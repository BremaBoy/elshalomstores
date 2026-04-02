import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Total Revenue
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total')
      .eq('payment_status', 'Paid');
    
    const totalRevenue = revenueData?.reduce((acc, curr) => acc + curr.total, 0) || 0;

    // Total Orders
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Total Customers
    const { count: totalCustomers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer');

    // Total Products
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSalesReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { start_date, end_date } = req.query;
    
    let query = supabase
      .from('orders')
      .select('created_at, total')
      .eq('payment_status', 'Paid');

    if (start_date) query = query.gte('created_at', start_date);
    if (end_date) query = query.lte('created_at', end_date);

    const { data, error } = await query.order('created_at', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
