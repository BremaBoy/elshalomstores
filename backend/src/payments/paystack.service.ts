import axios from 'axios';
import crypto from 'crypto';
import { logger } from '../config/logger';

export class PaystackService {
  private readonly secretKey: string;
  private readonly baseUrl = 'https://api.paystack.co';

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
    if (!this.secretKey) {
      logger.warn('PAYSTACK_SECRET_KEY is not defined in environment variables');
    }
  }

  /**
   * Initializes a transaction with Paystack
   */
  async initializePayment(data: {
    email: string;
    amount: number | string; // in NGN (will be converted to kobo)
    reference: string;
    callback_url?: string;
    metadata?: any;
  }) {
    const amountInNaira = Number(data.amount);
    const amountInKobo = Math.round(amountInNaira * 100);

    if (!Number.isFinite(amountInNaira) || amountInKobo < 5000) {
      throw new Error('Paystack amount must be a valid value of at least ₦50');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          email: data.email,
          // Paystack documents this field as a string containing the amount in
          // the currency subunit (kobo for NGN).
          amount: String(amountInKobo),
          currency: 'NGN',
          reference: data.reference,
          callback_url: data.callback_url || process.env.PAYMENT_CALLBACK_URL,
          metadata: data.metadata,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.data; // contains authorization_url, access_code, reference
    } catch (error: any) {
      logger.error('Paystack initialize error:', error.response?.data || error.message);
      throw new Error(`Paystack initialization failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Verifies a transaction
   */
  async verifyPayment(reference: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction/verify/${encodeURIComponent(reference)}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        }
      );

      return response.data.data; // contains status, amount, etc.
    } catch (error: any) {
      logger.error('Paystack verify error:', error.response?.data || error.message);
      throw new Error(`Paystack verification failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Refunds a transaction
   */
  async refundPayment(transactionId: string, amount: number) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/refund`,
        {
          transaction: transactionId,
          amount: Math.round(amount * 100), // convert to kobo
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.data;
    } catch (error: any) {
      logger.error('Paystack refund error:', error.response?.data || error.message);
      throw new Error(`Paystack refund failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Verifies the webhook signature from Paystack
   */
  verifyWebhookSignature(signature: string, payload: any): boolean {
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(JSON.stringify(payload))
      .digest('hex');

    return hash === signature;
  }
}

export const paystackService = new PaystackService();
