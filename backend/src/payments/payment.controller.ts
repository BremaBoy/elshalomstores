import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { logger } from '../config/logger';
import { paystackService } from './paystack.service';
import { flutterwaveService } from './flutterwave.service';

/**
 * Initializes a payment transaction and logs the intent
 * POST /api/payments/:gateway/initialize
 */
export const initializePayment = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { gateway } = req.params;
    const orderId = req.body.order_id;
    
    if (!orderId) {
       res.status(400); throw new Error('Order ID is required');
    }

    // 1. Fetch order details from database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, profiles(full_name)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      res.status(404); throw new Error('Order not found');
    }

    if (order.payment_status === 'successful' || order.payment_status === 'Paid') {
      res.status(400); throw new Error('Order is already paid');
    }

    let authUrl = '';
    let reference = `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 2. Initialize with correct gateway
    const email = req.body.email || req.user?.email || 'customer@example.com';

    if (gateway === 'paystack') {
      const response = await paystackService.initializePayment({
        email: email,
        amount: order.total_amount,
        reference: reference,
        callback_url: `${process.env.CLIENT_URL}/checkout/verify?reference=${reference}&gateway=paystack`,
        metadata: { order_id: order.id }
      });
      authUrl = response.authorization_url;
      reference = response.reference;
    } else if (gateway === 'flutterwave') {
      const response = await flutterwaveService.initializePayment({
        customer: {
          email: email,
          name: order.profiles?.full_name || '',
          phonenumber: '',
        },
        amount: order.total_amount,
        tx_ref: reference,
        redirect_url: `${process.env.CLIENT_URL}/checkout/verify?reference=${reference}&gateway=flutterwave`,
        meta: { order_id: order.id }
      });
      authUrl = response.data.link; // authorization_url in Flutterwave v3
    } else {
      res.status(400); throw new Error('Unsupported gateway');
    }

    // 3. Create pending payment record
    const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
            order_id: order.id,
            customer_id: order.user_id,
            gateway: gateway,
            reference: reference,
            amount: order.total_amount,
            currency: 'NGN',
            status: 'pending'
        }]);

    if (paymentError) throw paymentError;

    // 4. Create action log
    await supabase.from('payment_logs').insert([{
        payment_reference: reference,
        event_type: 'payment_initialized',
        gateway: gateway,
        payload: { order_id: order.id }
    }]);

    // 5. Update order with payment reference
    await supabase.from('orders').update({ payment_reference: reference, payment_method: gateway }).eq('id', order.id);

    res.json({
      success: true,
      data: {
        authorization_url: authUrl,
        reference
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Retries a payment for a pending order
 * POST /api/payments/retry
 */
export const retryPayment = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { order_id, gateway } = req.body;
        if (!order_id || !gateway) {
            res.status(400); throw new Error('Order ID and gateway are required');
        }
        
        req.params.gateway = gateway;
        return initializePayment(req, res, next);
    } catch (error) {
        next(error);
    }
};

/**
 * Endpoint for testing payment refund
 * POST /api/payments/refund
 */
export const refundPayment = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { order_id } = req.body;
        if (!order_id) {
            res.status(400); throw new Error('Order ID is required');
        }

        // 1. Verify payment
        const { data: payment, error } = await supabase
            .from('payments')
            .select('*')
            .eq('order_id', order_id)
            .eq('status', 'successful')
            .single();

        if (error || !payment) {
            res.status(404); throw new Error('No successful payment found for this order');
        }

        let refundData = null;

        // 2. Call gateway refund API
        if (payment.gateway === 'paystack') {
            refundData = await paystackService.refundPayment(payment.transaction_id, payment.amount);
        } else if (payment.gateway === 'flutterwave') {
            refundData = await flutterwaveService.refundPayment(payment.transaction_id, payment.amount);
        } else {
            res.status(400); throw new Error('Refund not supported for this gateway');
        }

        // 3. Update status in db
        await supabase.from('payments').update({ status: 'refunded' }).eq('id', payment.id);
        await supabase.from('orders').update({ payment_status: 'refunded', status: 'Refunded' }).eq('id', order_id);

        await supabase.from('payment_logs').insert([{
            payment_reference: payment.reference,
            event_type: 'payment_refunded',
            gateway: payment.gateway,
            payload: refundData
        }]);

        res.json({
            success: true,
            message: 'Refund successful',
            data: refundData
        });

    } catch(error) {
        next(error);
    }
};

/**
 * Manual verification endpoint for the frontend after redirect
 * GET /api/payments/:gateway/verify/:reference
 */
export const verifyPaymentEndpoint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { gateway, reference } = req.params;
    
    if (!gateway || !reference) {
      res.status(400); throw new Error('Gateway and reference are required');
    }

    let verifyData = null;
    
    // 1. Call gateway verification API
    if (gateway === 'paystack') {
      verifyData = await paystackService.verifyPayment(reference);
    } else if (gateway === 'flutterwave') {
      // In Flutterwave, tx_ref is often what we have as reference, but the verify endpoint sometimes needs ID.
      // However, we stored our internal reference in tx_ref.
      // Flutterwave's verify by ID is more reliable. Let's find the payment record first to get the transaction_id if we have it,
      // or just search by reference if the gateway supports it.
      // Actually, for the manual redirect, Flutterwave appends transaction_id or tx_ref to the URL.
      
      // Let's assume we use ID if provided in query, otherwise use reference
      const txId = req.query.transaction_id as string;
      if (txId) {
        verifyData = await flutterwaveService.verifyPayment(txId);
      } else {
         // Fallback or handle appropriately
         res.status(400); throw new Error('Transaction ID is required for Flutterwave verification');
      }
    } else {
      res.status(400); throw new Error('Unsupported gateway');
    }

    // 2. If successful, update DB (similar to webhook but as a safety net)
    if (verifyData && (verifyData.status === 'success' || verifyData.status === 'successful')) {
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

    res.json({
      success: true,
      status: verifyData.status,
      data: verifyData
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get all payments for admin dashboard
 * GET /api/payments
 */
export const getPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, gateway } = req.query;

    let query = supabase
      .from('payments')
      .select('*, orders(id, user_id, total_amount), profiles(full_name)')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status as string);
    if (gateway) query = query.eq('gateway', gateway as string);

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
