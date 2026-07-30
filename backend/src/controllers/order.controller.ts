import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { logger } from '../config/logger';

export const createOrder = async (req: any, res: Response, next: NextFunction) => {
  try {
    const {
      items, // Array of { product_id, quantity, unit_price, ... }
      payment_method,
      shipping_details, // New: contains full address/contact info
      delivery_instructions,
      coupon_id,
    } = req.body;
    const user_id = req.user.id;

    if (!items || items.length === 0) {
      res.status(400);
      throw new Error('Order must have at least one item');
    }
    if (!['paystack', 'flutterwave', 'cod'].includes(payment_method)) {
      res.status(400);
      throw new Error('Unsupported payment method');
    }
    if (
      !shipping_details?.address ||
      !shipping_details?.city ||
      !shipping_details?.state
    ) {
      res.status(400);
      throw new Error('A complete shipping address is required');
    }

    // 1. Resolve prices and availability on the server. Never trust cart prices.
    const productIds = items.map((item: any) => item.product_id || item.id);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, price, discount_price, stock, status')
      .in('id', productIds);

    if (productsError) throw productsError;
    if (!products || products.length !== new Set(productIds).size) {
      res.status(400);
      throw new Error('One or more products are unavailable');
    }

    const productsById = new Map(products.map((product: any) => [product.id, product]));
    const resolvedItems = items.map((item: any) => {
      const productId = item.product_id || item.id;
      const product: any = productsById.get(productId);
      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        res.status(400);
        throw new Error('Invalid product quantity');
      }
      if (product.status !== 'active') {
        res.status(400);
        throw new Error('A product in your cart is no longer available');
      }
      if (product.stock < quantity) {
        res.status(409);
        throw new Error('Insufficient stock for one or more products');
      }

      const unitPrice = Number(product.discount_price ?? product.price);
      return { ...item, product_id: productId, quantity, unit_price: unitPrice };
    });

    const subtotal = resolvedItems.reduce(
      (total: number, item: any) => total + item.unit_price * item.quantity,
      0
    );

    // TODO: Apply coupon if exists
    // Shipping is currently advertised as free. Never accept price adjustments
    // from the browser; introduce a server-side shipping calculator when needed.
    const shipping_cost = 0;
    const total_amount = subtotal + shipping_cost;

    // 2. Start Order Creation
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: user_id,
          status: 'Pending',
          payment_method,
          payment_status: 'Pending',
          total_amount,
          shipping_details,
          delivery_instructions,
          coupon_id,
          items: resolvedItems, // JSONB backup with server-authoritative prices
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // 3. Create relational Order Items
    const orderItems = resolvedItems.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id || item.id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.unit_price * item.quantity,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

    if (itemsError) {
      // Manual "rollback": delete order if items fail
      await supabase.from('orders').delete().eq('id', order.id);
      throw itemsError;
    }

    // 4. Update Stock & Clear Cart
    for (const item of resolvedItems) {
      const product_id = item.product_id || item.id;
      // Decrement stock
      const { data: product } = await supabase
        .from('products')
        .select('stock')
        .eq('id', product_id)
        .single();
      
      if (product) {
        await supabase
          .from('products')
          .update({ stock: product.stock - item.quantity })
          .eq('id', product_id);
        
        // Log movement
        await supabase.from('inventory_logs').insert([{
          product_id: product_id,
          previous_qty: product.stock,
          change_qty: -item.quantity,
          new_qty: product.stock - item.quantity,
          reason: `Order #${order.id}`,
          admin_id: 'system', // or null
        }]);
      }
    }

    // 5. Initialize Status History
    await supabase.from('order_status_history').insert([{
      order_id: order.id,
      status: 'Pending',
      note: 'Order placed via website',
      updated_by: user_id
    }]);

    // Clear cart
    await supabase.from('cart_items').delete().eq('user_id', user_id);

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user.id;
    const { data, error } = await supabase
      .from('orders')
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

export const getOrderById = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*)), shipments(*)')
      .eq('id', id)
      .single();

    if (error) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Auth check: only customer who placed it or admin can see it
    if (data.user_id !== user_id && req.user.role === 'customer') {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

import { notificationService } from '../services/notificationService';

export const updateOrderStatus = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    // 1. Update Order Status
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Record Status History
    await supabase.from('order_status_history').insert([{
      order_id: id,
      status,
      note: note || `Order status updated to ${status}`,
      updated_by: req.user.id
    }]);

    // 3. Trigger Notification
    await notificationService.notifyOrderStatusUpdate(order, status);

    // 4. Log admin action
    await supabase.from('activity_logs').insert([{
      admin_id: req.user.id,
      action: 'UPDATE_ORDER_STATUS',
      entity_type: 'ORDER',
      entity_id: id,
      description: `Updated status to ${status}`,
    }]);

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    let query = supabase.from('orders').select('*, users(name, email)');

    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false });

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
