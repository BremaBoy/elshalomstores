import { supabase } from "@/lib/supabase";

export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  link?: string;
  badge?: string;
  cta_text?: string;
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
      
    if (error || !data) return [];
    return data;
  } catch (error) {
    console.error("Supabase hero slides fetch failed", error);
    return [];
  }
}

export interface Brand {
  id: string;
  name: string;
  logo_url?: string;
  logo_icon?: string;
}

export async function getBrands(): Promise<Brand[]> {
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
      
    if (error || !data) return [];
    return data;
  } catch (error) {
    console.error("Supabase brands fetch failed", error);
    return [];
  }
}
