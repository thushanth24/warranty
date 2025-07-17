import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";

export type User = {
  id: number;
  phoneNumber: string;
  isVerified: boolean;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  dateOfBirth?: Date | null;
  profileCompleted: boolean;
  createdAt: Date | string;
};
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull().unique(),
  isVerified: boolean("is_verified").default(false),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  dateOfBirth: timestamp("date_of_birth"),
  profileCompleted: boolean("profile_completed").default(false),
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
  brand: text("brand"),
  model: text("model"),
  serialNumber: text("serial_number"),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  category: text("category"),
  vendorEmail: text("vendor_email"),
  vendorPhone: text("vendor_phone"),
  vendorWebsite: text("vendor_website"),
  vendorAddress: text("vendor_address"),
  receiptPhotos: json("receipt_photos").$type<string[]>().default([]),
  warrantyDocuments: json("warranty_documents").$type<string[]>().default([]),
  isTransferred: boolean("is_transferred").default(false),
  transferredTo: text("transferred_to"),
  transferDate: timestamp("transfer_date"),
  transferNotes: text("transfer_notes"),
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

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // email, sms, push
  title: text("title").notNull(),
  message: text("message").notNull(),
  itemType: text("item_type"), // subscription, warranty
  itemId: integer("item_id"),
  scheduledFor: timestamp("scheduled_for").notNull(),
  sentAt: timestamp("sent_at"),
  status: text("status").default("pending"), // pending, sent, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export const userNotificationSettings = pgTable("user_notification_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  emailEnabled: boolean("email_enabled").default(true),
  smsEnabled: boolean("sms_enabled").default(false),
  pushEnabled: boolean("push_enabled").default(true),
  reminderIntervals: text("reminder_intervals").default("7,3,1"), // comma-separated days
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const warrantyClaims = pgTable("warranty_claims", {
  id: serial("id").primaryKey(),
  warrantyId: integer("warranty_id").notNull(),
  userId: integer("user_id").notNull(),
  claimNumber: text("claim_number"),
  issueDescription: text("issue_description").notNull(),
  claimDate: timestamp("claim_date").notNull(),
  status: text("status").default("submitted"), // submitted, in_progress, approved, denied, completed
  vendorResponse: text("vendor_response"),
  resolution: text("resolution"),
  claimAmount: decimal("claim_amount", { precision: 10, scale: 2 }),
  supportingDocuments: json("supporting_documents").$type<string[]>().default([]),
  contactHistory: json("contact_history").$type<Array<{ date: string; method: string; contact: string; notes: string; }>>().default([]),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertWarrantySchema = createInsertSchema(warranties).omit({
  id: true,
  createdAt: true,
});

export const insertWarrantyClaimSchema = createInsertSchema(warrantyClaims).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const insertReminderSchema = createInsertSchema(reminders).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSettingsSchema = createInsertSchema(userNotificationSettings).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const notificationSettingsSchema = z.object({
  emailEnabled: z.boolean(),
  smsEnabled: z.boolean(),
  pushEnabled: z.boolean(),
  reminderIntervals: z.string().regex(/^\d+(,\d+)*$/, "Please enter comma-separated numbers"),
});
