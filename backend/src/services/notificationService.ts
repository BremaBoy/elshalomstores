import { supabase } from '../config/supabase';
import { logger } from '../config/logger';

export enum NotificationType {
  ORDER = 'order',
  PROMO = 'promo',
  SYSTEM = 'system',
}

export interface NotificationPayload {
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  metadata?: any;
}

class NotificationService {
  /**
   * Internal method to send in-app notification (DB save)
   */
  private async sendInAppNotification(payload: NotificationPayload) {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          user_id: payload.user_id,
          title: payload.title,
          message: payload.message,
          type: payload.type,
        }]);

      if (error) throw error;
      logger.info(`In-app notification sent to ${payload.user_id}: ${payload.title}`);
    } catch (error) {
      logger.error('Error sending in-app notification', error);
    }
  }

  /**
   * Internal method to send email (Placeholder)
   */
  private async sendEmailNotification(payload: NotificationPayload) {
    // TODO: Integrate with SendGrid, Mailchimp, or AWS SES
    logger.info(`[EMAIL SIMULATION] To: ${payload.user_id}, Subject: ${payload.title}`);
  }

  /**
   * Internal method to send push notification (Placeholder)
   */
  private async sendPushNotification(payload: NotificationPayload) {
    // TODO: Integrate with Firebase Cloud Messaging (FCM) or Expo Push
    logger.info(`[PUSH SIMULATION] To: ${payload.user_id}, Message: ${payload.message}`);
  }

  /**
   * Main entry point for sending multi-channel notifications
   */
  async notify(payload: NotificationPayload) {
    await Promise.all([
      this.sendInAppNotification(payload),
      this.sendEmailNotification(payload),
      this.sendPushNotification(payload),
    ]);
  }

  /**
   * Specialized notification for order status updates
   */
  async notifyOrderStatusUpdate(order: any, status: string, trackingNumber?: string) {
    let title = `Order ${status}`;
    let message = `Your order #${order.id.slice(0, 8)} status has been updated to ${status}.`;

    if (status === 'Shipped' && trackingNumber) {
      title = 'Your order has been shipped';
      message = `Great news! Your order #${order.id.slice(0, 8)} has been shipped. Tracking number: ${trackingNumber}`;
    } else if (status === 'Delivered') {
      title = 'Order Delivered';
      message = `Your order #${order.id.slice(0, 8)} has been successfully delivered. Thank you for shopping with us!`;
    }

    await this.notify({
      user_id: order.user_id,
      title,
      message,
      type: NotificationType.ORDER,
      metadata: { order_id: order.id, status },
    });
  }
}

export const notificationService = new NotificationService();
