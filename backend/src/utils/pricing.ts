type ProductPrice = {
  price: unknown;
  discount_price?: unknown;
};

const roundCurrency = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

/**
 * A discount value of 0 means "no discount" in the product editor/database.
 * Only a positive discount price should replace the regular product price.
 */
export const getEffectiveProductPrice = (product: ProductPrice): number => {
  const regularPrice = Number(product.price);
  const discountPrice = Number(product.discount_price);
  const effectivePrice =
    Number.isFinite(discountPrice) && discountPrice > 0
      ? discountPrice
      : regularPrice;

  if (!Number.isFinite(effectivePrice) || effectivePrice <= 0) {
    throw new Error('A product in your cart does not have a valid price');
  }

  return roundCurrency(effectivePrice);
};
