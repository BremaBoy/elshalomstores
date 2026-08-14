import axios from 'axios';
import { PaystackService } from '../payments/paystack.service';

describe('Paystack transaction initialization', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sends a naira amount as a kobo string with an explicit currency', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'test-paystack-secret';
    const post = jest.spyOn(axios, 'post').mockResolvedValue({
      data: {
        data: {
          authorization_url: 'https://checkout.paystack.test/example',
          reference: 'REF-123',
        },
      },
    });
    const service = new PaystackService();

    await service.initializePayment({
      email: 'customer@example.com',
      amount: '500.00',
      reference: 'REF-123',
    });

    expect(post).toHaveBeenCalledWith(
      'https://api.paystack.co/transaction/initialize',
      expect.objectContaining({
        amount: '50000',
        currency: 'NGN',
      }),
      expect.any(Object)
    );
  });

  it('rejects a zero amount before calling Paystack', async () => {
    const post = jest.spyOn(axios, 'post');
    const service = new PaystackService();

    await expect(
      service.initializePayment({
        email: 'customer@example.com',
        amount: 0,
        reference: 'REF-ZERO',
      })
    ).rejects.toThrow('at least ₦50');
    expect(post).not.toHaveBeenCalled();
  });
});
