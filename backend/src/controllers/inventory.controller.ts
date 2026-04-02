import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { logger } from '../config/logger';

export const getInventoryLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { product_id } = req.query;
    let query = supabase.from('inventory_logs').select('*, products(name, sku)');

    if (product_id) query = query.eq('product_id', product_id);

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

export const updateStock = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { product_id, change_qty, reason, barcode } = req.body;

    if (!product_id && !barcode) {
      res.status(400);
      throw new Error('Product ID or Barcode is required');
    }

    // 1. Find product
    let productQuery = supabase.from('products').select('id, stock, name');
    if (product_id) productQuery = productQuery.eq('id', product_id);
    else productQuery = productQuery.eq('barcode', barcode);

    const { data: product, error: findError } = await productQuery.single();

    if (findError || !product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const previous_qty = product.stock;
    const new_qty = previous_qty + change_qty;

    if (new_qty < 0) {
      res.status(400);
      throw new Error('Stock cannot be negative');
    }

    // 2. Update product stock
    const { error: updateError } = await supabase
      .from('products')
      .update({ stock: new_qty })
      .eq('id', product.id);

    if (updateError) throw updateError;

    // 3. Log movement
    const { error: logError } = await supabase.from('inventory_logs').insert([
      {
        product_id: product.id,
        previous_qty,
        change_qty,
        new_qty,
        reason: reason || 'Manual Adjustment',
        admin_id: req.user.id,
      },
    ]);

    if (logError) {
      logger.error(`Failed to log inventory movement for ${product.id}: ${logError.message}`);
    }

    res.json({
      success: true,
      data: {
        product_id: product.id,
        name: product.name,
        previous_qty,
        new_qty,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLowStockAlerts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Arbitrary threshold of 10 for now, could be a setting later
    const threshold = 10;
    const { data, error } = await supabase
      .from('products')
      .select('id, name, sku, stock')
      .lte('stock', threshold)
      .order('stock', { ascending: true });

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
