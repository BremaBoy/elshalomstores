import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { logger } from '../config/logger';
import { paystackService } from './paystack.service';
import { flutterwaveService } from './flutterwave.service';

export const paystackWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-paystack-signature'] as string;
    if (!signature || !paystackService.verifyWebhookSignature(signature, req.body)) {
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
      
      if (verifyData.status === 'success') {
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

export const flutterwaveWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['verif-hash'] as string;
    if (!signature || !flutterwaveService.verifyWebhookSignature(signature)) {
      return res.status(401).send('Invalid signature');
    }

    const event = req.body;
    logger.info(`Flutterwave Webhook received: ${event.event}`);

    // Log the event
    await supabase.from('payment_logs').insert([{
      payment_reference: event.data?.tx_ref || null,
      event_type: `webhook_${event.event}`,
      gateway: 'flutterwave',
      payload: event
    }]);

    if (event.event === 'charge.completed' && event.data?.status === 'successful') {
       const { tx_ref, id } = event.data;
       
       // Verify with API to be doubly sure
       const verifyData = await flutterwaveService.verifyPayment(id.toString());
       
       if (verifyData.status === 'successful') {
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
