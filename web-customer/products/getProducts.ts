import { supabase } from "@/lib/supabase";

export interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  category: string;
  rating: number;
  description?: string;
  isNew?: boolean;
  isSale?: boolean;
  stock?: number;
}

export async function getProducts(params?: any): Promise<Product[]> {
  try {
    let query = supabase.from('products').select('*').eq('status', 'active');
    
    if (params?.category) {
      query = query.eq('category_id', params.category);
    }
    
    const { data, error } = await query;
    if (error || !data) return [];
    return data;
  } catch (error) {
    console.error("Supabase products fetch failed", error);
    return [];
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .gte('rating', 4.5)
      .limit(8);
      
    if (error || !data) return [];
    return data;
  } catch (error) {
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error || !data) return null;
    return data;
  } catch (error) {
    return null;
  }
}
