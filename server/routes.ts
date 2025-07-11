import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertSubscriptionSchema, insertWarrantySchema, insertReminderSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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
      const validatedData = insertSubscriptionSchema.parse(req.body);
      const subscription = await storage.createSubscription({ ...validatedData, userId });
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subscription data", errors: error.errors });
      }
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
      const validatedData = insertWarrantySchema.parse(req.body);
      const warranty = await storage.createWarranty({ ...validatedData, userId });
      res.status(201).json(warranty);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid warranty data", errors: error.errors });
      }
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
      const validatedData = insertReminderSchema.parse(req.body);
      const reminder = await storage.createReminder({ ...validatedData, userId });
      res.status(201).json(reminder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reminder data", errors: error.errors });
      }
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

  const httpServer = createServer(app);
  return httpServer;
}
