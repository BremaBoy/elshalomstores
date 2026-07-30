import crypto from 'crypto';

describe('payment webhook signature verification', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('verifies Paystack against the exact raw request bytes', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'test-paystack-secret';
    const { PaystackService } = await import('../payments/paystack.service');
    const service = new PaystackService();
    const rawBody = Buffer.from('{\n  "event": "charge.success", "data": {"id": 1}\n}');
    const signature = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest('hex');

    expect(service.verifyWebhookSignature(signature, rawBody)).toBe(true);
    expect(
      service.verifyWebhookSignature(signature, JSON.stringify(JSON.parse(rawBody.toString())))
    ).toBe(false);
  });

  it('uses the documented Flutterwave webhook secret', async () => {
    process.env.FLUTTERWAVE_WEBHOOK_SECRET = 'test-flutterwave-secret';
    delete process.env.FLUTTERWAVE_HASH_KEY;
    const { FlutterwaveService } = await import('../payments/flutterwave.service');
    const service = new FlutterwaveService();

    const rawBody = Buffer.from('{"type":"charge.completed"}');
    const signature = crypto
      .createHmac('sha256', process.env.FLUTTERWAVE_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest('base64');

    expect(service.verifyWebhookSignature(signature, rawBody)).toBe(true);
    expect(service.verifyWebhookSignature('wrong-secret', rawBody)).toBe(false);
    expect(
      service.verifyWebhookSignature('test-flutterwave-secret', undefined, true)
    ).toBe(true);
  });
});
