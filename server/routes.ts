import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import path from "path";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, hashPassword } from "./localAuth";
import { signupSchema, loginSchema, notificationSubscriptionSchema } from "@shared/schema";
import { ObjectStorageService } from "./objectStorage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve cards.json API endpoint
  app.get('/api/cards', (req, res) => {
    try {
      const cardsPath = path.resolve(import.meta.dirname, '../public/cards.json');
      res.sendFile(cardsPath);
    } catch (error) {
      res.status(500).json({ error: 'Could not load cards' });
    }
  });
  
  // Legacy support for direct cards.json requests
  app.get('/cards.json', (req, res) => {
    try {
      const cardsPath = path.resolve(import.meta.dirname, '../public/cards.json');
      res.sendFile(cardsPath);
    } catch (error) {
      res.status(500).json({ error: 'Could not load cards' });
    }
  });

  // List all available card files in object storage
  app.get('/api/cards/list', async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const cardFiles = await objectStorageService.listCardFiles();
      
      console.log('📁 Found card files:', cardFiles);
      res.json({ cardFiles });
    } catch (error) {
      console.error('Error listing card files:', error);
      res.status(500).json({ error: 'Failed to list card files' });
    }
  });

  // Serve public card images from App Storage
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    console.log(`🔍 Searching for public object: ${filePath}`);
    const objectStorageService = new ObjectStorageService();
    try {
      const objectPath = await objectStorageService.searchPublicObject(filePath);
      console.log(`🔍 Search result: ${objectPath ? `Found at "${objectPath}"` : 'Not found'}`);
      
      if (!objectPath) {
        console.log(`❌ No object path returned for: ${filePath}`);
        return res.status(404).json({ error: "File not found" });
      }
      
      console.log(`🚀 Starting download for: ${objectPath}`);
      await objectStorageService.downloadObject(objectPath, res);
      console.log(`✅ Download completed for: ${objectPath}`);
    } catch (error) {
      console.error(`💥 Error in route handler for ${filePath}:`, error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Auth middleware
  setupAuth(app);

  // Auth routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const result = signupSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error.issues });
      }

      const { email, password, firstName, lastName } = result.data;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password and create user
      const passwordHash = await hashPassword(password);
      const user = await storage.createUserWithPassword({ email, password, firstName, lastName }, passwordHash);

      // Log in the user
      req.login(user, (err) => {
        if (err) {
          console.error("Login error after signup:", err);
          return res.status(500).json({ message: "Signup successful but login failed" });
        }
        res.status(201).json(user);
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/auth/login', (req, res, next) => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid input", errors: result.error.issues });
    }

    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.login(user, (err) => {
        if (err) {
          console.error("Session error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        res.json(user);
      });
    })(req, res, next);
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
        }
        res.status(204).send();
      });
    });
  });

  app.get('/api/auth/me', isAuthenticated, (req, res) => {
    res.json(req.user);
  });

  // Notification subscription routes
  app.post('/api/notifications/subscribe', isAuthenticated, async (req, res) => {
    try {
      const result = notificationSubscriptionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error.issues });
      }

      const { userId, subscription } = result.data;
      
      // Verify that the authenticated user matches the userId
      if (!req.user || (req.user as any).id !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Create subscription record in database
      const subscriptionRecord = await storage.createNotificationSubscription({
        userId,
        endpoint: subscription.endpoint,
        p256dhKey: subscription.keys.p256dh,
        authKey: subscription.keys.auth,
        isActive: true,
      });

      res.json({ ok: true, subscription: subscriptionRecord });
    } catch (error) {
      console.error("Notification subscription error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/notifications/unsubscribe', isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.body;
      
      // Verify that the authenticated user matches the userId
      if (!req.user || (req.user as any).id !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Delete all subscriptions for this user
      await storage.deleteNotificationSubscriptionsByUserId(userId);

      res.json({ ok: true });
    } catch (error) {
      console.error("Notification unsubscribe error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/notifications/subscriptions', isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const subscriptions = await storage.getNotificationSubscriptionsByUserId((req.user as any).id);
      res.json({ subscriptions });
    } catch (error) {
      console.error("Get subscriptions error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
