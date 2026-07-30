import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { logger } from '../config/logger';
import { paystackService } from './paystack.service';
import { flutterwaveService } from './flutterwave.service';

export const paystackWebhook = async (req: Request & { rawBody?: Buffer }, res: Response) => {
  try {
    const signature = req.headers['x-paystack-signature'] as string;
    if (!signature || !req.rawBody || !paystackService.verifyWebhookSignature(signature, req.rawBody)) {
      return res.status(401).send('Invalid signature');
    }

    const event = req.body;
    logger.info(`Paystack Webhook received: ${event.event}`);

    // Log the event
    await supabase.from('payment_logs').insert([{
      payment_reference: event.data?.reference || null,
      event_type: `webhook_${event.event}`,
      gateway: 'paystack',
      payload: event
    }]);

    if (event.event === 'charge.success') {
      const { reference, amount, metadata } = event.data;
      
      // Verify with API to be doubly sure
      const verifyData = await paystackService.verifyPayment(reference);

      const { data: pendingPayment } = await supabase
        .from('payments')
        .select('*')
        .eq('reference', reference)
        .single();
      const amountMatches =
        pendingPayment &&
        Math.abs(Number(verifyData.amount) / 100 - Number(pendingPayment.amount)) < 0.01;
      const currencyMatches = pendingPayment && verifyData.currency === pendingPayment.currency;

      if (
        pendingPayment &&
        verifyData.status === 'success' &&
        verifyData.reference === reference &&
        amountMatches &&
        currencyMatches
      ) {
        const { data: payment } = await supabase
          .from('payments')
          .update({ 
              status: 'successful', 
              paid_at: new Date().toISOString(),
              transaction_id: verifyData.id.toString()
          })
          .eq('reference', reference)
          .select()
          .single();
        
        if (payment) {
          await supabase
            .from('orders')
            .update({ payment_status: 'Paid', status: 'Processing' })
            .eq('id', payment.order_id);
        }
      }
    }
    
    res.status(200).send('Webhook processed');
  } catch (error) {
    logger.error('Paystack webhook error', error);
    res.status(500).send('Internal Server Error');
  }
};

export const flutterwaveWebhook = async (req: Request & { rawBody?: Buffer }, res: Response) => {
  try {
    const signedSignature = req.headers['flutterwave-signature'] as string;
    const legacySignature = req.headers['verif-hash'] as string;
    const isValidSignature =
      (signedSignature &&
        req.rawBody &&
        flutterwaveService.verifyWebhookSignature(signedSignature, req.rawBody)) ||
      (legacySignature &&
        flutterwaveService.verifyWebhookSignature(legacySignature, undefined, true));
    if (!isValidSignature) {
      return res.status(401).send('Invalid signature');
    }

    const event = req.body;
    const eventType = event.type || event.event;
    logger.info(`Flutterwave Webhook received: ${eventType}`);

    // Log the event
    await supabase.from('payment_logs').insert([{
      payment_reference: event.data?.tx_ref || null,
      event_type: `webhook_${eventType}`,
      gateway: 'flutterwave',
      payload: event
    }]);

    if (
      eventType === 'charge.completed' &&
      ['successful', 'succeeded'].includes(event.data?.status)
    ) {
       const tx_ref = event.data.tx_ref || event.data.reference;
       const { id } = event.data;
       
       // Verify with API to be doubly sure
       const verifyData = await flutterwaveService.verifyPayment(id.toString());

       const { data: pendingPayment } = await supabase
         .from('payments')
         .select('*')
         .eq('reference', tx_ref)
         .single();
       const amountMatches =
         pendingPayment &&
         Math.abs(Number(verifyData.amount) - Number(pendingPayment.amount)) < 0.01;
       const currencyMatches = pendingPayment && verifyData.currency === pendingPayment.currency;

       if (
         pendingPayment &&
         verifyData.status === 'successful' &&
         verifyData.tx_ref === tx_ref &&
         amountMatches &&
         currencyMatches
       ) {
          const { data: payment } = await supabase
            .from('payments')
            .update({ 
                status: 'successful', 
                paid_at: new Date().toISOString(),
                transaction_id: verifyData.id.toString()
            })
            .eq('reference', tx_ref)
            .select()
            .single();
          
          if (payment) {
            await supabase
              .from('orders')
              .update({ payment_status: 'Paid', status: 'Processing' })
              .eq('id', payment.order_id);
          }
       }
    }

    res.status(200).send('Webhook processed');
  } catch (error) {
    logger.error('Flutterwave webhook error', error);
    res.status(500).send('Internal Server Error');
  }
};
