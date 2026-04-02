import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const getCart = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user.id;

    const { data, error } = await supabase
      .from('cart_items')
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

export const addToCart = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { product_id, quantity } = req.body;
    const user_id = req.user.id;

    if (!product_id || !quantity) {
      res.status(400);
      throw new Error('Product ID and quantity are required');
    }

    // Check if item already in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user_id)
      .eq('product_id', product_id)
      .single();

    if (existingItem) {
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
        .select()
        .single();
      if (error) throw error;
      return res.json({ success: true, data });
    }

    const { data, error } = await supabase
      .from('cart_items')
      .insert([{ user_id, product_id, quantity }])
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

export const updateCartItem = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { quantity } = req.body;
    const { id } = req.params;
    const user_id = req.user.id;

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
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

export const removeFromCart = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user.id;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user_id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Cart cleared',
    });
  } catch (error) {
    next(error);
  }
};
