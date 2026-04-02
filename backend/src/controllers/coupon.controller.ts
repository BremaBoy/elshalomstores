import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const getCoupons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
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

export const createCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .insert([req.body])
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

export const updateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .update(req.body)
      .eq('id', req.params.id)
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

export const deleteCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const validateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, amount } = req.body;

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .single();

    if (error || !coupon) {
      res.status(404);
      throw new Error('Invalid coupon code');
    }

    // Check expiry
    if (new Date(coupon.expires_at) < new Date()) {
      res.status(400);
      throw new Error('Coupon has expired');
    }

    // Check usage limit
    if (coupon.uses_count >= coupon.usage_limit) {
      res.status(400);
      throw new Error('Coupon usage limit reached');
    }

    // Check min order
    if (amount < coupon.min_order) {
      res.status(400);
      throw new Error(`Minimum order amount of ${coupon.min_order} required`);
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (amount * coupon.discount_value) / 100;
    } else {
      discount = coupon.discount_value;
    }

    res.json({
      success: true,
      data: {
        id: coupon.id,
        code: coupon.code,
        discount,
      },
    });
  } catch (error) {
    next(error);
  }
};
