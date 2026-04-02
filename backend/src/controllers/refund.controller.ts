import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const requestRefund = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { order_id, reason, amount } = req.body;
    const user_id = req.user.id;

    // Verify order belongs to user
    const { data: order } = await supabase
      .from('orders')
      .select('user_id')
      .eq('id', order_id)
      .single();

    if (!order || order.user_id !== user_id) {
      res.status(403);
      throw new Error('Not authorized to request refund for this order');
    }

    const { data, error } = await supabase
      .from('refunds')
      .insert([{ 
        order_id, 
        reason, 
        amount, 
        status: 'Pending' 
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRefundStatus = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, admin_note } = req.body;

    const { data, error } = await supabase
      .from('refunds')
      .update({ status, admin_note })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If approved, update order status
    if (status === 'Approved') {
      await supabase.from('orders').update({ status: 'Refunded' }).eq('id', data.order_id);
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllRefunds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    let query = supabase.from('refunds').select('*, orders(user_id, total)');

    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
