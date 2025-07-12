import { NotificationService } from './notification-service';
import { EmailService } from './email-service';
import { SMSService } from './sms-service';

export class NotificationScheduler {
  private notificationService: NotificationService;
  private emailService: EmailService;
  private smsService: SMSService;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.notificationService = new NotificationService();
    this.emailService = new EmailService();
    this.smsService = new SMSService();
  }

  // Start the notification scheduler
  start(intervalMinutes: number = 15) {
    if (this.intervalId) {
      console.log('Notification scheduler is already running');
      return;
    }

    console.log(`Starting notification scheduler with ${intervalMinutes} minute intervals`);
    
    // Run immediately
    this.processPendingNotifications();
    
    // Then run on interval
    this.intervalId = setInterval(() => {
      this.processPendingNotifications();
    }, intervalMinutes * 60 * 1000);
  }

  // Stop the notification scheduler
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Notification scheduler stopped');
    }
  }

  // Process all pending notifications
  private async processPendingNotifications() {
    try {
      const pendingNotifications = await this.notificationService.getPendingNotifications();
      
      if (pendingNotifications.length === 0) {
        return;
      }

      console.log(`Processing ${pendingNotifications.length} pending notifications`);

      for (const { notification, user } of pendingNotifications) {
        await this.sendNotification(notification, user);
      }
    } catch (error) {
      console.error('Error processing pending notifications:', error);
    }
  }

  // Send a single notification
  private async sendNotification(notification: any, user: any) {
    let success = false;
    
    try {
      switch (notification.type) {
        case 'email':
          if (user.email) {
            success = await this.emailService.sendNotificationEmail(
              user.email,
              notification.title,
              notification.message,
              notification.itemType,
              notification.scheduledFor.toLocaleDateString()
            );
          } else {
            console.warn(`User ${user.id} has no email address for email notification`);
          }
          break;

        case 'sms':
          success = await this.smsService.sendNotificationSMS(
            user.phoneNumber,
            notification.title,
            this.smsService.formatSMSMessage(notification.title, notification.message)
          );
          break;

        case 'push':
          // For push notifications, we'll just mark as sent for now
          // In production, you would integrate with push notification services
          console.log(`Push notification (simulated): ${notification.title} - ${notification.message}`);
          success = true;
          break;

        default:
          console.warn(`Unknown notification type: ${notification.type}`);
      }

      // Mark notification as sent or failed
      await this.notificationService.markNotificationSent(
        notification.id, 
        success ? 'sent' : 'failed'
      );

      if (success) {
        console.log(`✓ ${notification.type} notification sent to user ${user.id}: ${notification.title}`);
      } else {
        console.log(`✗ ${notification.type} notification failed for user ${user.id}: ${notification.title}`);
      }

    } catch (error) {
      console.error(`Error sending ${notification.type} notification:`, error);
      await this.notificationService.markNotificationSent(notification.id, 'failed');
    }
  }

  // Manual trigger for testing
  async triggerNow() {
    console.log('Manually triggering notification processing...');
    await this.processPendingNotifications();
  }
}