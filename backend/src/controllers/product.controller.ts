import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, min_price, max_price, sort_by, status, search } = req.query;

    let query = supabase.from('products').select('*, categories(*)');

    if (category) query = query.eq('category_id', category);
    if (min_price) query = query.gte('price', min_price);
    if (max_price) query = query.lte('price', max_price);
    if (status) query = query.eq('status', status);
    if (search) query = query.ilike('name', `%${search}%`);

    if (sort_by) {
      const [column, order] = (sort_by as string).split(':');
      query = query.order(column, { ascending: order === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

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

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*)')
      .eq('id', req.params.id)
      .single();

    if (error) {
      res.status(404);
      throw new Error('Product not found');
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*)')
      .eq('slug', req.params.slug)
      .single();

    if (error) {
      res.status(404);
      throw new Error('Product not found');
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productData = req.body;

    const { data, error } = await supabase
      .from('products')
      .insert([productData])
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

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('products')
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

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
