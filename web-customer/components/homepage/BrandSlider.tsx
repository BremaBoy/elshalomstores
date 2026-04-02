import { getBrands } from "@/products/getHomepageData";
import { BrandSliderClient } from "./BrandSliderClient";

export const BrandSlider = async () => {
  const brands = await getBrands();

  if (brands.length === 0) return null;

  return <BrandSliderClient brands={brands} />;
};
