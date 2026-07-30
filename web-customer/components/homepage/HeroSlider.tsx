import { getHeroSlides } from "@/products/getHomepageData";
import { HeroSliderClient } from "./HeroSliderClient";

export const HeroSlider = async () => {
  const slides = await getHeroSlides();

  return <HeroSliderClient slides={slides} />;
};
