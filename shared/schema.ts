import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull().unique(),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  billingCycle: text("billing_cycle").notNull(), // weekly, monthly, quarterly, yearly
  category: text("category"),
  nextRenewalDate: timestamp("next_renewal_date").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const warranties = pgTable("warranties", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productName: text("product_name").notNull(),
  vendor: text("vendor").notNull(),
  purchaseDate: timestamp("purchase_date").notNull(),
  warrantyDuration: integer("warranty_duration").notNull(), // in months
  expirationDate: timestamp("expiration_date").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  itemType: text("item_type").notNull(), // subscription, warranty
  itemId: integer("item_id").notNull(),
  reminderDays: integer("reminder_days").notNull(), // days before expiration/renewal
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertWarrantySchema = createInsertSchema(warranties).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertReminderSchema = createInsertSchema(reminders).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Warranty = typeof warranties.$inferSelect;
export type InsertWarranty = z.infer<typeof insertWarrantySchema>;
export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;
