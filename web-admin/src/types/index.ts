export interface Category {
  id: string;
  name: string;
  icon?: string;
  image?: string;
  item_count: number;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  image: string;
  category: string;
  rating: number;
  is_new: boolean;
  is_sale: boolean;
  stock: number;
  status: 'active' | 'pending';
  created_at?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  expiry_date?: string;
  usage_limit?: number;
  usage_count: number;
  is_active: boolean;
  created_at?: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  status: 'active' | 'inactive';
  created_at?: string;
}

export type AdminUser = Admin;

export interface Customer {
  id: string;
  full_name: string;
  email?: string;
  cart?: any[];
  updated_at?: string;
}

export interface Order {
  id: string;
  user_id: string;
  items: any[];
  total_amount: number;
  shipping_details: any;
  payment_method: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
}
