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

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Gift Items", slug: "gift-items", image_url: "/categories/gift-items.png", icon: "🎁", color: "bg-rose-500", itemCount: 12 },
  { id: "2", name: "House Hold Items", slug: "household-items", image_url: "/categories/household-items.png", icon: "🏠", color: "bg-sky-500", itemCount: 24 },
  { id: "3", name: "Humidifiers and Diffusers", slug: "humidifiers-and-diffusers", image_url: "/categories/humidifiers.png", icon: "💨", color: "bg-teal-500", itemCount: 8 },
  { id: "4", name: "Kitchen Utensils", slug: "kitchen-utensils", image_url: "/categories/kitchen-utensils.png", icon: "🍳", color: "bg-amber-500", itemCount: 15 },
  { id: "5", name: "Oils and Candles", slug: "oils-and-candles", image_url: "/categories/oils-candles.png", icon: "🕯️", color: "bg-yellow-500", itemCount: 18 },
  { id: "6", name: "Perfumeries and Cosmetics", slug: "perfumeries-and-cosmetics", image_url: "/categories/perfumes.png", icon: "💄", color: "bg-purple-500", itemCount: 30 },
  { id: "7", name: "Phone Accessories", slug: "phone-accessories", image_url: "/categories/phone-accessories.png", icon: "🔌", color: "bg-indigo-500", itemCount: 22 },
  { id: "8", name: "Toiletries and Daily Needs", slug: "toiletries-and-daily-needs", image_url: "/categories/toiletries.png", icon: "🧼", color: "bg-emerald-500", itemCount: 40 },
];

export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
      
    if (error || !data || data.length === 0) {
      return DEFAULT_CATEGORIES;
    }
    
    // Merge DB categories with our rich mock visual metadata if possible
    return data.map(dbCat => {
      const match = DEFAULT_CATEGORIES.find(c => c.slug === dbCat.slug || c.name.toLowerCase() === dbCat.name.toLowerCase());
      return {
        ...dbCat,
        slug:
          dbCat.slug ||
          match?.slug ||
          dbCat.id ||
          dbCat.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"),
        image_url: dbCat.image_url || match?.image_url,
        icon: dbCat.icon || match?.icon || "📦",
        color: dbCat.color || match?.color || "bg-slate-500",
        itemCount: match?.itemCount || 0
      };
    });
  } catch (error) {
    console.error("Supabase categories fetch failed, returning default ones", error);
    return DEFAULT_CATEGORIES;
  }
}
