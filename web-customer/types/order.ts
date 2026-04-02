export type OrderStatus = 
  | 'Pending' 
  | 'Processing' 
  | 'Packed' 
  | 'Shipped' 
  | 'Out for Delivery' 
  | 'Delivered' 
  | 'Cancelled' 
  | 'Refunded';

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  note?: string;
  timestamp: string;
  updated_by?: string;
}

export interface Shipment {
  id: string;
  order_id: string;
  courier: string;
  tracking_number: string;
  shipping_method?: string;
  estimated_delivery?: string;
  status: string;
  shipped_at?: string;
  delivered_at?: string;
}

export interface OrderNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order' | 'promo' | 'system';
  is_read: boolean;
  created_at: string;
}

export interface DetailedOrder {
  id: string;
  user_id: string;
  status: OrderStatus;
  payment_status: string;
  payment_method: string;
  total_amount: number;
  subtotal: number;
  shipping_cost: number;
  delivery_instructions?: string;
  created_at: string;
  items?: any[];
  shipping_details?: any;
  order_items?: any[];
  shipments?: Shipment[];
  order_status_history?: OrderStatusHistory[];
}
