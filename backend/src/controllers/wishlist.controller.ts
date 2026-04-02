import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const getWishlist = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user.id;

    const { data, error } = await supabase
      .from('wishlists')
      .select('*, products(*)')
      .eq('user_id', user_id);

    if (error) throw error;

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const addToWishlist = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { product_id } = req.body;
    const user_id = req.user.id;

    if (!product_id) {
      res.status(400);
      throw new Error('Product ID is required');
    }

    const { data, error } = await supabase
      .from('wishlists')
      .insert([{ user_id, product_id }])
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

export const removeFromWishlist = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Item removed from wishlist',
    });
  } catch (error) {
    next(error);
  }
};
