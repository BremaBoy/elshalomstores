import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const prepareCheckout = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user.id;
    const { coupon_code, shipping_address_id } = req.body;

    // 1. Get cart items
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', user_id);

    if (cartError) throw cartError;
    if (!cartItems || cartItems.length === 0) {
      res.status(400);
      throw new Error('Cart is empty');
    }

    // 2. Calculate subtotal
    let subtotal = 0;
    for (const item of cartItems) {
      subtotal += item.products.price * item.quantity;
    }

    // 3. Handle Coupon
    let discount = 0;
    let coupon_id = null;
    if (coupon_code) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', coupon_code)
        .single();
      
      if (coupon) {
        // Validate coupon logic (simplified here)
        if (new Date(coupon.expires_at) > new Date() && coupon.uses_count < coupon.usage_limit && subtotal >= coupon.min_order) {
          if (coupon.discount_type === 'percentage') {
            discount = (subtotal * coupon.discount_value) / 100;
          } else {
            discount = coupon.discount_value;
          }
          coupon_id = coupon.id;
        }
      }
    }

    // 4. Handle Shipping (simplified)
    const shipping_cost = 1000; // Flat rate for now

    const total = subtotal - discount + shipping_cost;

    res.json({
      success: true,
      data: {
        items: cartItems,
        subtotal,
        discount,
        shipping_cost,
        total,
        coupon_id,
        shipping_address_id
      },
    });
  } catch (error) {
    next(error);
  }
};
