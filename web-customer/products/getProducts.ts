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

// Fallback image used whenever a product has a missing/invalid image URL
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizeProduct(product: any): Product {
  const image = typeof product.image === "string" && product.image.startsWith("http")
    ? product.image
    : PLACEHOLDER_IMAGE;
  return {
    ...product,
    image,
    discountPrice: product.discountPrice ?? product.discount_price,
    isNew: product.isNew ?? product.is_new,
    isSale: product.isSale ?? product.is_sale,
    rating: Number(product.rating || 0),
    price: Number(product.price || 0),
    stock: Number(product.stock || 0),
  };
}

export async function getProducts(params?: { category?: string }): Promise<Product[]> {
  try {
    let query = supabase.from('products').select('*').eq('status', 'active');
    
    if (params?.category) {
      query = query.eq('category_id', params.category);
    }
    
    const { data, error } = await query;
    if (error || !data) return [];
    return data.map(sanitizeProduct);
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
    return data.map(sanitizeProduct);
  } catch {
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
    return sanitizeProduct(data);
  } catch {
    return null;
  }
}
