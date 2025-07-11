import { db } from "../db";
import { notifications, userNotificationSettings, subscriptions, warranties, users } from "@shared/schema";
import { eq, and, lte, gte, sql } from "drizzle-orm";
import type { Subscription, Warranty, UserNotificationSettings } from "@shared/schema";

export class NotificationService {
  
  // Schedule notifications for a subscription
  async scheduleSubscriptionReminders(subscription: Subscription, userSettings?: UserNotificationSettings) {
    const settings = userSettings || await this.getUserNotificationSettings(subscription.userId);
    const intervals = this.parseReminderIntervals(settings.reminderIntervals);
    
    const renewalDate = new Date(subscription.nextRenewalDate);
    
    for (const days of intervals) {
      const scheduledDate = new Date(renewalDate);
      scheduledDate.setDate(scheduledDate.getDate() - days);
      
      // Only schedule if the date is in the future
      if (scheduledDate > new Date()) {
        await this.createNotifications(
          subscription.userId,
          scheduledDate,
          subscription,
          null,
          days,
          settings
        );
      }
    }
  }

  // Schedule notifications for a warranty
  async scheduleWarrantyReminders(warranty: Warranty, userSettings?: UserNotificationSettings) {
    const settings = userSettings || await this.getUserNotificationSettings(warranty.userId);
    const intervals = this.parseReminderIntervals(settings.reminderIntervals);
    
    const expirationDate = new Date(warranty.expirationDate);
    
    for (const days of intervals) {
      const scheduledDate = new Date(expirationDate);
      scheduledDate.setDate(scheduledDate.getDate() - days);
      
      // Only schedule if the date is in the future
      if (scheduledDate > new Date()) {
        await this.createNotifications(
          warranty.userId,
          scheduledDate,
          null,
          warranty,
          days,
          settings
        );
      }
    }
  }

  // Create individual notifications based on user preferences
  private async createNotifications(
    userId: number,
    scheduledDate: Date,
    subscription: Subscription | null,
    warranty: Warranty | null,
    daysBefore: number,
    settings: UserNotificationSettings
  ) {
    const isSubscription = subscription !== null;
    const item = subscription || warranty!;
    const itemType = isSubscription ? 'subscription' : 'warranty';
    const actionDate = isSubscription ? subscription!.nextRenewalDate : warranty!.expirationDate;
    const actionWord = isSubscription ? 'renews' : 'expires';
    
    const title = `${isSubscription ? 'Subscription' : 'Warranty'} Reminder`;
    const message = `Your ${isSubscription ? 'subscription for' : 'warranty for'} ${item.name || item.productName} ${actionWord} in ${daysBefore} day${daysBefore !== 1 ? 's' : ''} (${new Date(actionDate).toLocaleDateString()})`;

    const notificationsToCreate = [];

    // Email notification
    if (settings.emailEnabled) {
      notificationsToCreate.push({
        userId,
        type: 'email',
        title,
        message,
        itemType,
        itemId: item.id,
        scheduledFor: scheduledDate,
        status: 'pending' as const,
      });
    }

    // SMS notification
    if (settings.smsEnabled) {
      notificationsToCreate.push({
        userId,
        type: 'sms',
        title,
        message,
        itemType,
        itemId: item.id,
        scheduledFor: scheduledDate,
        status: 'pending' as const,
      });
    }

    // Push notification
    if (settings.pushEnabled) {
      notificationsToCreate.push({
        userId,
        type: 'push',
        title,
        message,
        itemType,
        itemId: item.id,
        scheduledFor: scheduledDate,
        status: 'pending' as const,
      });
    }

    // Insert all notifications
    if (notificationsToCreate.length > 0) {
      await db.insert(notifications).values(notificationsToCreate);
    }
  }

  // Get or create user notification settings
  async getUserNotificationSettings(userId: number): Promise<UserNotificationSettings> {
    const [existing] = await db
      .select()
      .from(userNotificationSettings)
      .where(eq(userNotificationSettings.userId, userId));

    if (existing) {
      return existing;
    }

    // Create default settings
    const [created] = await db
      .insert(userNotificationSettings)
      .values({
        userId,
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: true,
        reminderIntervals: "7,3,1", // 7 days, 3 days, 1 day before
      })
      .returning();

    return created;
  }

  // Update user notification settings
  async updateNotificationSettings(userId: number, updates: Partial<UserNotificationSettings>) {
    const [updated] = await db
      .update(userNotificationSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userNotificationSettings.userId, userId))
      .returning();

    return updated;
  }

  // Parse reminder intervals from string
  private parseReminderIntervals(intervals: string | null): number[] {
    if (!intervals) return [7, 3, 1]; // default
    return intervals.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d) && d > 0);
  }

  // Get pending notifications that should be sent
  async getPendingNotifications(): Promise<any[]> {
    const now = new Date();
    
    return await db
      .select({
        notification: notifications,
        user: users,
      })
      .from(notifications)
      .innerJoin(users, eq(notifications.userId, users.id))
      .where(
        and(
          eq(notifications.status, 'pending'),
          lte(notifications.scheduledFor, now)
        )
      );
  }

  // Mark notification as sent
  async markNotificationSent(notificationId: number, status: 'sent' | 'failed' = 'sent') {
    await db
      .update(notifications)
      .set({ 
        status, 
        sentAt: new Date() 
      })
      .where(eq(notifications.id, notificationId));
  }

  // Remove old notifications for an item (when updated/deleted)
  async removeNotificationsForItem(itemType: string, itemId: number, userId: number) {
    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.itemType, itemType),
          eq(notifications.itemId, itemId),
          eq(notifications.userId, userId),
          eq(notifications.status, 'pending')
        )
      );
  }

  // Get user's notification history
  async getUserNotifications(userId: number, limit: number = 50) {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(sql`${notifications.createdAt} DESC`)
      .limit(limit);
  }
}