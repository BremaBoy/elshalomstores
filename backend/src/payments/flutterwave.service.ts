import axios from 'axios';
import crypto from 'crypto';
import { logger } from '../config/logger';

export class FlutterwaveService {
  private readonly secretKey: string;
  private readonly baseUrl = 'https://api.flutterwave.com/v3';
  private readonly hashKey: string;

  constructor() {
    this.secretKey = process.env.FLUTTERWAVE_SECRET_KEY || '';
    this.hashKey = process.env.FLUTTERWAVE_HASH_KEY || '';
    
    if (!this.secretKey) {
      logger.warn('FLUTTERWAVE_SECRET_KEY is not defined in environment variables');
    }
  }

  /**
   * Initializes a transaction with Flutterwave
   */
  async initializePayment(data: {
    customer: { email: string; phonenumber?: string; name?: string };
    amount: number;
    currency?: string;
    tx_ref: string;
    redirect_url?: string;
    meta?: any;
  }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/payments`,
        {
          tx_ref: data.tx_ref,
          amount: data.amount,
          currency: data.currency || 'NGN',
          redirect_url: data.redirect_url || process.env.PAYMENT_CALLBACK_URL,
          customer: data.customer,
          meta: data.meta,
          customizations: {
            title: process.env.STORE_NAME || 'Elshalomstores',
            description: 'Payment for order',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data; // contains data.link (authorization_url)
    } catch (error: any) {
      logger.error('Flutterwave initialize error:', error.response?.data || error.message);
      throw new Error(`Flutterwave initialization failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Verifies a transaction
   */
  async verifyPayment(transactionId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transactions/${transactionId}/verify`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        }
      );

      return response.data.data; // contains status, amount, tx_ref
    } catch (error: any) {
      logger.error('Flutterwave verify error:', error.response?.data || error.message);
      throw new Error(`Flutterwave verification failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Refunds a transaction
   */
  async refundPayment(transactionId: string, amount: number) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transactions/${transactionId}/refund`,
        {
          amount: amount,
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
      logger.error('Flutterwave refund error:', error.response?.data || error.message);
      throw new Error(`Flutterwave refund failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Verifies the webhook signature from Flutterwave
   */
  verifyWebhookSignature(signature: string): boolean {
    return signature === this.hashKey;
  }
}

export const flutterwaveService = new FlutterwaveService();
