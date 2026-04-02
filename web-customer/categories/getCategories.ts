import { supabase } from "@/lib/supabase";

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
  itemCount: number;
}

const MOCK_CATEGORIES: Category[] = [
  {
    id: "electronics",
    name: "Electronics",
    icon: "📱",
    itemCount: 450,
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "fashion",
    name: "Fashion",
    icon: "👕",
    itemCount: 1200,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800",
  },
];

export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*');
      
    if (error || !data || data.length === 0) return MOCK_CATEGORIES;
    return data;
  } catch (error) {
    console.warn("Supabase categories fetch failed, using mock data");
    return MOCK_CATEGORIES;
  }
}
