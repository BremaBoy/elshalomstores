import { getEffectiveProductPrice } from '../utils/pricing';

describe('getEffectiveProductPrice', () => {
  it('uses the regular price when zero means no discount', () => {
    expect(getEffectiveProductPrice({ price: 100, discount_price: 0 })).toBe(100);
  });

  it('uses a positive discount price', () => {
    expect(getEffectiveProductPrice({ price: '100', discount_price: '80' })).toBe(80);
  });

  it('rejects products without a positive effective price', () => {
    expect(() => getEffectiveProductPrice({ price: 0, discount_price: null })).toThrow(
      'does not have a valid price'
    );
  });
});
