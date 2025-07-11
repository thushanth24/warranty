import { MailService } from '@sendgrid/mail';

export class EmailService {
  private mailService: MailService;
  private isConfigured: boolean = false;

  constructor() {
    this.mailService = new MailService();
    this.configure();
  }

  private configure() {
    if (process.env.SENDGRID_API_KEY) {
      this.mailService.setApiKey(process.env.SENDGRID_API_KEY);
      this.isConfigured = true;
    } else {
      console.warn('SENDGRID_API_KEY not configured. Email notifications will be disabled.');
    }
  }

  async sendNotificationEmail(
    to: string,
    title: string,
    message: string,
    itemType: string,
    actionDate: string
  ): Promise<boolean> {
    if (!this.isConfigured) {
      console.log(`Email notification skipped (not configured): ${title} - ${message}`);
      return false;
    }

    try {
      const html = this.generateEmailTemplate(title, message, itemType, actionDate);
      
      await this.mailService.send({
        to,
        from: process.env.FROM_EMAIL || 'noreply@subtracker.com',
        subject: title,
        text: message,
        html,
      });

      console.log(`Email sent successfully to ${to}: ${title}`);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  private generateEmailTemplate(title: string, message: string, itemType: string, actionDate: string): string {
    const isSubscription = itemType === 'subscription';
    const icon = isSubscription ? '💳' : '🛡️';
    const color = isSubscription ? '#3B82F6' : '#10B981';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 48px; margin-bottom: 16px;">${icon}</div>
            <h1 style="color: ${color}; margin: 0; font-size: 24px; font-weight: bold;">SubTracker Reminder</h1>
          </div>
          
          <div style="background-color: #f8fafc; border-left: 4px solid ${color}; padding: 16px; margin: 24px 0; border-radius: 4px;">
            <h2 style="color: #1f2937; margin: 0 0 8px 0; font-size: 18px;">${title}</h2>
            <p style="color: #4b5563; margin: 0; font-size: 16px; line-height: 1.5;">${message}</p>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.APP_URL || 'https://subtracker.com'}" 
               style="background-color: ${color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Manage ${isSubscription ? 'Subscriptions' : 'Warranties'}
            </a>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 24px; text-align: center;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              This is an automated reminder from SubTracker Pro. 
              <a href="${process.env.APP_URL}/profile" style="color: ${color};">Manage notification preferences</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  }
}