import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const getNotifications = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user.id;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user.id;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user_id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};
