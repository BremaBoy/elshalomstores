import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { notificationService } from '../services/notificationService';

export const createShipment = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { order_id, courier, tracking_number, shipping_method, estimated_delivery } = req.body;

    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .insert([{ 
        order_id, 
        courier, 
        tracking_number, 
        shipping_method,
        estimated_delivery,
        status: 'Shipped',
        shipped_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (shipmentError) throw shipmentError;

    // 1. Update order status and tracking info
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .update({ 
        status: 'Shipped',
        tracking_number // This is a convenience field in orders
      })
      .eq('id', order_id)
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Record status history
    await supabase.from('order_status_history').insert([{
      order_id,
      status: 'Shipped',
      note: `Package shipped via ${courier}. Tracking: ${tracking_number}`,
      updated_by: req.user.id
    }]);

    // 3. Trigger Notification
    await notificationService.notifyOrderStatusUpdate(order, 'Shipped', tracking_number);

    res.status(201).json({
      success: true,
      data: shipment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateShipmentStatus = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const updateData: any = { status };
    if (status === 'Delivered') {
      updateData.delivered_at = new Date().toISOString();
    }

    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (shipmentError) throw shipmentError;

    // 1. Get the order to notify
    const { data: order } = await supabase.from('orders').select('*').eq('id', shipment.order_id).single();

    // 2. Sync order status if critical
    const statusMap: Record<string, string> = {
      'Out for Delivery': 'Out for Delivery',
      'Delivered': 'Delivered',
      'Returned': 'Refunded' // Or suitable mapping
    };

    if (statusMap[status]) {
      const newStatus = statusMap[status];
      await supabase.from('orders').update({ status: newStatus }).eq('id', shipment.order_id);
      
      // Record history
      await supabase.from('order_status_history').insert([{
        order_id: shipment.order_id,
        status: newStatus,
        note: note || `Shipment status updated to ${status}`,
        updated_by: req.user.id
      }]);

      // Notify
      if (order) {
        await notificationService.notifyOrderStatusUpdate(order, newStatus, shipment.tracking_number);
      }
    }

    res.json({
      success: true,
      data: shipment,
    });
  } catch (error) {
    next(error);
  }
};

export const getShipmentByOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { order_id } = req.params;
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('order_id', order_id)
      .single();

    if (error) {
      res.status(404);
      throw new Error('Shipment not found');
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
