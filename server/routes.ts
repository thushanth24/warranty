import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertSubscriptionSchema, insertWarrantySchema, insertReminderSchema, profileSchema, notificationSettingsSchema, insertWarrantyClaimSchema } from "@shared/schema";
import { z } from "zod";
import { NotificationService } from "./services/notification-service";

export async function registerRoutes(app: Express): Promise<Server> {
  const notificationService = new NotificationService();

  // Auth routes
  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
      }

      // In a real app, you would send an actual OTP via SMS
      // For this demo, we'll just return success
      res.json({ message: "OTP sent successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { phoneNumber, otp } = req.body;
      
      if (!phoneNumber || !otp) {
        return res.status(400).json({ message: "Phone number and OTP are required" });
      }

      // In a real app, you would verify the actual OTP
      // For this demo, we'll accept any 6-digit code
      if (otp.length !== 6) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      // Get or create user
      let user = await storage.getUserByPhoneNumber(phoneNumber);
      if (!user) {
        user = await storage.createUser({ phoneNumber, isVerified: true });
      } else {
        user = await storage.updateUser(user.id, { isVerified: true });
      }

      res.json({ user, message: "OTP verified successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to verify OTP" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/upcoming/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const subscriptions = await storage.getSubscriptions(userId);
      const warranties = await storage.getWarranties(userId);
      
      const now = new Date();
      const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      
      // Get upcoming renewals (next 2 weeks)
      const upcomingRenewals = subscriptions
        .filter(sub => sub.nextRenewalDate <= twoWeeksFromNow)
        .sort((a, b) => a.nextRenewalDate.getTime() - b.nextRenewalDate.getTime())
        .slice(0, 5);
      
      // Get warranty expirations (next 2 weeks)
      const warrantyExpirations = warranties
        .filter(warranty => warranty.expirationDate <= twoWeeksFromNow)
        .sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime())
        .slice(0, 5);
      
      res.json({ upcomingRenewals, warrantyExpirations });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming items" });
    }
  });

  // Subscription routes
  app.get("/api/subscriptions/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const subscriptions = await storage.getSubscriptions(userId);
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  app.post("/api/subscriptions/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const validatedData = insertSubscriptionSchema.parse(req.body);
      const subscription = await storage.createSubscription({ ...validatedData, userId });
      
      // Schedule automatic reminders for the new subscription
      try {
        await notificationService.scheduleSubscriptionReminders(subscription);
      } catch (error) {
        console.error("Failed to schedule subscription reminders:", error);
        // Continue anyway - subscription was created successfully
      }
      
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subscription data", errors: error.errors });
      }
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  app.put("/api/subscriptions/:userId/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const id = parseInt(req.params.id);
      const updates = req.body;
      const subscription = await storage.updateSubscription(id, userId, updates);
      
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  app.delete("/api/subscriptions/:userId/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const id = parseInt(req.params.id);
      const success = await storage.deleteSubscription(id, userId);
      
      if (!success) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      res.json({ message: "Subscription deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete subscription" });
    }
  });

  // Warranty routes
  app.get("/api/warranties/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const warranties = await storage.getWarranties(userId);
      res.json(warranties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch warranties" });
    }
  });

  app.post("/api/warranties/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const validatedData = insertWarrantySchema.parse(req.body);
      const warranty = await storage.createWarranty({ ...validatedData, userId });
      
      // Schedule automatic reminders for the new warranty
      try {
        await notificationService.scheduleWarrantyReminders(warranty);
      } catch (error) {
        console.error("Failed to schedule warranty reminders:", error);
        // Continue anyway - warranty was created successfully
      }
      
      res.status(201).json(warranty);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid warranty data", errors: error.errors });
      }
      console.error("Error creating warranty:", error);
      res.status(500).json({ message: "Failed to create warranty" });
    }
  });

  app.put("/api/warranties/:userId/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const id = parseInt(req.params.id);
      const updates = req.body;
      const warranty = await storage.updateWarranty(id, userId, updates);
      
      if (!warranty) {
        return res.status(404).json({ message: "Warranty not found" });
      }
      
      res.json(warranty);
    } catch (error) {
      res.status(500).json({ message: "Failed to update warranty" });
    }
  });

  app.delete("/api/warranties/:userId/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const id = parseInt(req.params.id);
      const success = await storage.deleteWarranty(id, userId);
      
      if (!success) {
        return res.status(404).json({ message: "Warranty not found" });
      }
      
      res.json({ message: "Warranty deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete warranty" });
    }
  });

  // Reminder routes
  app.get("/api/reminders/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const reminders = await storage.getReminders(userId);
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reminders" });
    }
  });

  app.post("/api/reminders/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const validatedData = insertReminderSchema.parse(req.body);
      const reminder = await storage.createReminder({ ...validatedData, userId });
      res.status(201).json(reminder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reminder data", errors: error.errors });
      }
      console.error("Error creating reminder:", error);
      res.status(500).json({ message: "Failed to create reminder" });
    }
  });

  app.delete("/api/reminders/:userId/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const id = parseInt(req.params.id);
      const success = await storage.deleteReminder(id, userId);
      
      if (!success) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      res.json({ message: "Reminder deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete reminder" });
    }
  });

  // User profile routes
  app.get("/api/users/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put("/api/users/:userId/profile", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const validatedData = profileSchema.parse(req.body);
      const updates = {
        ...validatedData,
        dateOfBirth: new Date(validatedData.dateOfBirth),
        profileCompleted: true,
      };
      
      const user = await storage.updateUser(userId, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Notification Settings routes
  app.get("/api/users/:userId/notification-settings", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      let settings = await storage.getUserNotificationSettings(userId);
      
      // Create default settings if they don't exist
      if (!settings) {
        settings = await storage.createNotificationSettings({
          userId,
          emailEnabled: true,
          smsEnabled: false,
          pushEnabled: true,
          reminderIntervals: "7,3,1",
        });
      }

      res.json(settings);
    } catch (error) {
      console.error("Error fetching notification settings:", error);
      res.status(500).json({ message: "Failed to fetch notification settings" });
    }
  });

  app.put("/api/users/:userId/notification-settings", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const validatedData = notificationSettingsSchema.parse(req.body);
      
      // Check if settings exist
      let settings = await storage.getUserNotificationSettings(userId);
      
      if (!settings) {
        // Create new settings
        settings = await storage.createNotificationSettings({
          userId,
          ...validatedData,
        });
      } else {
        // Update existing settings
        settings = await storage.updateNotificationSettings(userId, validatedData);
      }

      if (!settings) {
        return res.status(404).json({ message: "Failed to update notification settings" });
      }

      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid notification settings", errors: error.errors });
      }
      console.error("Error updating notification settings:", error);
      res.status(500).json({ message: "Failed to update notification settings" });
    }
  });

  // Get user notifications history
  app.get("/api/users/:userId/notifications", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Warranty Claims routes
  app.get("/api/warranties/:warrantyId/claims", async (req, res) => {
    try {
      const warrantyId = parseInt(req.params.warrantyId);
      if (isNaN(warrantyId)) {
        return res.status(400).json({ message: "Invalid warranty ID" });
      }

      const claims = await storage.getWarrantyClaims(warrantyId);
      res.json(claims);
    } catch (error) {
      console.error("Error fetching warranty claims:", error);
      res.status(500).json({ message: "Failed to fetch warranty claims" });
    }
  });

  app.post("/api/warranties/:warrantyId/claims", async (req, res) => {
    try {
      const warrantyId = parseInt(req.params.warrantyId);
      const userId = parseInt(req.body.userId);
      
      if (isNaN(warrantyId) || isNaN(userId)) {
        return res.status(400).json({ message: "Invalid warranty or user ID" });
      }

      const validatedData = insertWarrantyClaimSchema.parse({
        ...req.body,
        warrantyId,
        userId,
      });

      const claim = await storage.createWarrantyClaim(validatedData);
      res.status(201).json(claim);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid claim data", errors: error.errors });
      }
      console.error("Error creating warranty claim:", error);
      res.status(500).json({ message: "Failed to create warranty claim" });
    }
  });

  app.put("/api/claims/:claimId", async (req, res) => {
    try {
      const claimId = parseInt(req.params.claimId);
      const userId = parseInt(req.body.userId);
      
      if (isNaN(claimId) || isNaN(userId)) {
        return res.status(400).json({ message: "Invalid claim or user ID" });
      }

      const updates = req.body;
      delete updates.userId; // Don't allow userId to be updated

      const claim = await storage.updateWarrantyClaim(claimId, userId, updates);
      
      if (!claim) {
        return res.status(404).json({ message: "Warranty claim not found" });
      }

      res.json(claim);
    } catch (error) {
      console.error("Error updating warranty claim:", error);
      res.status(500).json({ message: "Failed to update warranty claim" });
    }
  });

  app.delete("/api/claims/:claimId", async (req, res) => {
    try {
      const claimId = parseInt(req.params.claimId);
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(claimId) || isNaN(userId)) {
        return res.status(400).json({ message: "Invalid claim or user ID" });
      }

      const success = await storage.deleteWarrantyClaim(claimId, userId);
      
      if (!success) {
        return res.status(404).json({ message: "Warranty claim not found" });
      }

      res.json({ message: "Warranty claim deleted successfully" });
    } catch (error) {
      console.error("Error deleting warranty claim:", error);
      res.status(500).json({ message: "Failed to delete warranty claim" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
