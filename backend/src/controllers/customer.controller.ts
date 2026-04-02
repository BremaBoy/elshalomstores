import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const getAllCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'customer')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*, addresses(*), orders(*)')
      .eq('id', id)
      .single();

    if (userError) {
      res.status(404);
      throw new Error('Customer not found');
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const suspendCustomer = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { is_suspended } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({ is_suspended })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log action
    await supabase.from('activity_logs').insert([{
      admin_id: req.user.id,
      action: is_suspended ? 'SUSPEND_USER' : 'UNSUSPEND_USER',
      entity_type: 'USER',
      entity_id: id,
    }]);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
