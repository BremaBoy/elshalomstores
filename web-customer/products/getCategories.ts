import { supabase } from "@/lib/supabase";

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  parent_id?: string;
  icon?: string;
  itemCount?: number;
  color?: string;
}

export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
      
    if (error || !data) return [];
    
    // Add some default visual properties if they are missing in the DB
    // (In a real app, these would be in the DB or a configuration file)
    const categoryEnhancements: Record<string, { icon: string; color: string }> = {
      "electronics": { icon: "📱", color: "bg-blue-500" },
      "fashion": { icon: "👕", color: "bg-purple-500" },
      "home-decor": { icon: "🏠", color: "bg-orange-500" },
      "beauty": { icon: "💄", color: "bg-pink-500" },
      "sports": { icon: "⚽", color: "bg-emerald-500" },
      "books": { icon: "📚", color: "bg-amber-500" },
    };

    return data.map(cat => ({
      ...cat,
      icon: categoryEnhancements[cat.slug]?.icon || "📦",
      color: categoryEnhancements[cat.slug]?.color || "bg-slate-500",
      itemCount: 0 // This should ideally be a count from the products table or a separate column
    }));
  } catch (error) {
    console.error("Supabase categories fetch failed", error);
    return [];
  }
}
