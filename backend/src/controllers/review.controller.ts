import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const createReview = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { product_id, rating, comment } = req.body;
    const user_id = req.user.id;

    if (!product_id || !rating) {
      res.status(400);
      throw new Error('Product ID and rating are required');
    }

    // Verify if user bought the product (optional but good for "Verified Purchase")
    const { data: orderItem } = await supabase
      .from('order_items')
      .select('*, orders(user_id)')
      .eq('product_id', product_id)
      .eq('orders.user_id', user_id)
      .maybeSingle();

    const verified_purchase = !!orderItem;

    const { data, error } = await supabase
      .from('reviews')
      .insert([{ 
        product_id, 
        user_id, 
        rating, 
        comment,
        verified_purchase
      }])
      .select('*, users(name)')
      .single();

    if (error) throw error;

    // Update product rating average (this would ideally be a trigger or background job)
    // For now, let's just return success

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { product_id } = req.params;
    const { data, error } = await supabase
      .from('reviews')
      .select('*, users(name)')
      .eq('product_id', product_id)
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

export const deleteReview = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const { data: review } = await supabase
      .from('reviews')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    if (review.user_id !== user_id && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      res.status(403);
      throw new Error('Not authorized to delete this review');
    }

    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw error;

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
