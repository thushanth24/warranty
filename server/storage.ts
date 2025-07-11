import { users, subscriptions, warranties, reminders, type User, type InsertUser, type Subscription, type InsertSubscription, type Warranty, type InsertWarranty, type Reminder, type InsertReminder } from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Subscriptions
  getSubscriptions(userId: number): Promise<Subscription[]>;
  getSubscription(id: number, userId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription & { userId: number }): Promise<Subscription>;
  updateSubscription(id: number, userId: number, updates: Partial<Subscription>): Promise<Subscription | undefined>;
  deleteSubscription(id: number, userId: number): Promise<boolean>;

  // Warranties
  getWarranties(userId: number): Promise<Warranty[]>;
  getWarranty(id: number, userId: number): Promise<Warranty | undefined>;
  createWarranty(warranty: InsertWarranty & { userId: number }): Promise<Warranty>;
  updateWarranty(id: number, userId: number, updates: Partial<Warranty>): Promise<Warranty | undefined>;
  deleteWarranty(id: number, userId: number): Promise<boolean>;

  // Reminders
  getReminders(userId: number): Promise<Reminder[]>;
  getRemindersByItem(userId: number, itemType: string, itemId: number): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder & { userId: number }): Promise<Reminder>;
  updateReminder(id: number, userId: number, updates: Partial<Reminder>): Promise<Reminder | undefined>;
  deleteReminder(id: number, userId: number): Promise<boolean>;

  // Dashboard stats
  getDashboardStats(userId: number): Promise<{
    activeSubscriptions: number;
    monthlySpend: number;
    activeWarranties: number;
    dueThisWeek: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private subscriptions: Map<number, Subscription>;
  private warranties: Map<number, Warranty>;
  private reminders: Map<number, Reminder>;
  private currentUserId: number;
  private currentSubscriptionId: number;
  private currentWarrantyId: number;
  private currentReminderId: number;

  constructor() {
    this.users = new Map();
    this.subscriptions = new Map();
    this.warranties = new Map();
    this.reminders = new Map();
    this.currentUserId = 1;
    this.currentSubscriptionId = 1;
    this.currentWarrantyId = 1;
    this.currentReminderId = 1;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.phoneNumber === phoneNumber
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
      isVerified: insertUser.isVerified ?? false,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Subscriptions
  async getSubscriptions(userId: number): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(
      (sub) => sub.userId === userId && sub.isActive
    );
  }

  async getSubscription(id: number, userId: number): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(id);
    return subscription && subscription.userId === userId ? subscription : undefined;
  }

  async createSubscription(subscription: InsertSubscription & { userId: number }): Promise<Subscription> {
    const id = this.currentSubscriptionId++;
    const newSubscription: Subscription = {
      ...subscription,
      id,
      createdAt: new Date(),
      description: subscription.description ?? null,
      category: subscription.category ?? null,
      isActive: subscription.isActive ?? true,
    };
    this.subscriptions.set(id, newSubscription);
    return newSubscription;
  }

  async updateSubscription(id: number, userId: number, updates: Partial<Subscription>): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(id);
    if (!subscription || subscription.userId !== userId) return undefined;
    
    const updatedSubscription = { ...subscription, ...updates };
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }

  async deleteSubscription(id: number, userId: number): Promise<boolean> {
    const subscription = this.subscriptions.get(id);
    if (!subscription || subscription.userId !== userId) return false;
    
    const updated = { ...subscription, isActive: false };
    this.subscriptions.set(id, updated);
    return true;
  }

  // Warranties
  async getWarranties(userId: number): Promise<Warranty[]> {
    return Array.from(this.warranties.values()).filter(
      (warranty) => warranty.userId === userId && warranty.isActive
    );
  }

  async getWarranty(id: number, userId: number): Promise<Warranty | undefined> {
    const warranty = this.warranties.get(id);
    return warranty && warranty.userId === userId ? warranty : undefined;
  }

  async createWarranty(warranty: InsertWarranty & { userId: number }): Promise<Warranty> {
    const id = this.currentWarrantyId++;
    const newWarranty: Warranty = {
      ...warranty,
      id,
      createdAt: new Date(),
      description: warranty.description ?? null,
      isActive: warranty.isActive ?? true,
    };
    this.warranties.set(id, newWarranty);
    return newWarranty;
  }

  async updateWarranty(id: number, userId: number, updates: Partial<Warranty>): Promise<Warranty | undefined> {
    const warranty = this.warranties.get(id);
    if (!warranty || warranty.userId !== userId) return undefined;
    
    const updatedWarranty = { ...warranty, ...updates };
    this.warranties.set(id, updatedWarranty);
    return updatedWarranty;
  }

  async deleteWarranty(id: number, userId: number): Promise<boolean> {
    const warranty = this.warranties.get(id);
    if (!warranty || warranty.userId !== userId) return false;
    
    const updated = { ...warranty, isActive: false };
    this.warranties.set(id, updated);
    return true;
  }

  // Reminders
  async getReminders(userId: number): Promise<Reminder[]> {
    return Array.from(this.reminders.values()).filter(
      (reminder) => reminder.userId === userId && reminder.isActive
    );
  }

  async getRemindersByItem(userId: number, itemType: string, itemId: number): Promise<Reminder[]> {
    return Array.from(this.reminders.values()).filter(
      (reminder) => reminder.userId === userId && reminder.itemType === itemType && reminder.itemId === itemId && reminder.isActive
    );
  }

  async createReminder(reminder: InsertReminder & { userId: number }): Promise<Reminder> {
    const id = this.currentReminderId++;
    const newReminder: Reminder = {
      ...reminder,
      id,
      createdAt: new Date(),
      isActive: reminder.isActive ?? true,
    };
    this.reminders.set(id, newReminder);
    return newReminder;
  }

  async updateReminder(id: number, userId: number, updates: Partial<Reminder>): Promise<Reminder | undefined> {
    const reminder = this.reminders.get(id);
    if (!reminder || reminder.userId !== userId) return undefined;
    
    const updatedReminder = { ...reminder, ...updates };
    this.reminders.set(id, updatedReminder);
    return updatedReminder;
  }

  async deleteReminder(id: number, userId: number): Promise<boolean> {
    const reminder = this.reminders.get(id);
    if (!reminder || reminder.userId !== userId) return false;
    
    const updated = { ...reminder, isActive: false };
    this.reminders.set(id, updated);
    return true;
  }

  // Dashboard stats
  async getDashboardStats(userId: number): Promise<{
    activeSubscriptions: number;
    monthlySpend: number;
    activeWarranties: number;
    dueThisWeek: number;
  }> {
    const subscriptions = await this.getSubscriptions(userId);
    const warranties = await this.getWarranties(userId);
    
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Calculate monthly spend (convert all to monthly)
    let monthlySpend = 0;
    subscriptions.forEach(sub => {
      const amount = parseFloat(sub.amount);
      switch (sub.billingCycle) {
        case 'weekly':
          monthlySpend += amount * 4.33; // 4.33 weeks per month average
          break;
        case 'monthly':
          monthlySpend += amount;
          break;
        case 'quarterly':
          monthlySpend += amount / 3;
          break;
        case 'yearly':
          monthlySpend += amount / 12;
          break;
      }
    });
    
    // Count due this week
    const dueThisWeek = subscriptions.filter(sub => 
      sub.nextRenewalDate <= weekFromNow
    ).length + warranties.filter(warranty => 
      warranty.expirationDate <= weekFromNow
    ).length;
    
    return {
      activeSubscriptions: subscriptions.length,
      monthlySpend: Math.round(monthlySpend * 100) / 100,
      activeWarranties: warranties.length,
      dueThisWeek,
    };
  }
}

export const storage = new MemStorage();
