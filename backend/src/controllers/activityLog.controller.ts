import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const getActivityLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { admin_id, action } = req.query;
    let query = supabase.from('activity_logs').select('*, users(name, email)');

    if (admin_id) query = query.eq('admin_id', admin_id);
    if (action) query = query.eq('action', action);

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
