import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import path from "path";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, hashPassword } from "./localAuth";
import { signupSchema, loginSchema, notificationSubscriptionSchema, insertDrawnCardSchema, insertJournalEntrySchema } from "@shared/schema";
import { z } from "zod";
import { ObjectStorageService, objectStorageClient } from "./objectStorage";

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
      
      res.json({ cardFiles });
    } catch (error) {
      console.error('Error listing card files:', error);
      res.status(500).json({ error: 'Failed to list card files' });
    }
  });

  // Serve lifeline cards from the lifeline folder in object storage
  app.get('/api/cards/lifeline', async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const lifelineFiles = await objectStorageService.listLifelineCards();
      
      // Generate card data from lifeline files
      const lifelineCards = lifelineFiles.map((filePath, index) => {
        // Extract filename from path for generating basic card data
        const filename = filePath.split('/').pop() || `lifeline-${index}`;
        const cardId = filename.replace(/\.[^/.]+$/, ""); // Remove file extension
        
        return {
          category: 'Lifeline',
          image: `/public-objects/${filePath}`,
          message: `Lifeline card ${cardId}`,
          title: `Lifeline ${cardId}`
        };
      });
      
      res.json({ cards: lifelineCards });
    } catch (error) {
      console.error('Error loading lifeline cards from object storage:', error);
      
      // Fallback: Return sample lifeline cards for testing
      const fallbackLifelineCards = [
        {
          category: 'Lifeline',
          image: '/assets/shuffle7-card-back.svg',
          message: 'Emergency support: Take a deep breath and remember that this too shall pass.',
          title: 'Breathe'
        },
        {
          category: 'Lifeline',
          image: '/assets/shuffle7-card-back.svg',
          message: 'Emergency support: Reach out to someone you trust when you need help.',
          title: 'Connect'
        },
        {
          category: 'Lifeline',
          image: '/assets/shuffle7-card-back.svg',
          message: 'Emergency support: Ground yourself by naming 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.',
          title: 'Ground'
        }
      ];
      
      res.json({ cards: fallbackLifelineCards });
    }
  });


  // Serve public card images from App Storage
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectPath = await objectStorageService.searchPublicObject(filePath);
      
      if (!objectPath) {
        return res.status(404).json({ error: "File not found" });
      }
      
      await objectStorageService.downloadObject(objectPath, res);
    } catch (error) {
      console.error(`Error serving public object ${filePath}:`, error);
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

    const { rememberMe } = result.data;

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

        // Set session cookie maxAge based on Remember Me
        if (rememberMe && req.session.cookie) {
          // 30 days if remember me is checked
          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
        } else if (req.session.cookie) {
          // 7 days if not checked (default)
          req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000;
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

  // Drawn cards routes
  const saveDrawnCardSchema = insertDrawnCardSchema.extend({
    cardType: z.enum(['daily', 'lifeline']),
  }).omit({
    userId: true,
    drawnAt: true,
  });

  app.post('/api/drawn-cards', isAuthenticated, async (req, res) => {
    try {
      const result = saveDrawnCardSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error.issues });
      }

      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = (req.user as any).id;
      const drawnCard = await storage.saveDrawnCard(userId, {
        ...result.data,
        userId, // This will be overridden by the storage method, but satisfies TypeScript
      });

      res.status(201).json(drawnCard);
    } catch (error) {
      console.error("Save drawn card error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/drawn-cards', isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = (req.user as any).id;
      const { cardType, limit = '50', offset = '0' } = req.query;

      // Parse and validate query parameters
      const limitNum = parseInt(limit as string, 10);
      const offsetNum = parseInt(offset as string, 10);

      if (isNaN(limitNum) || limitNum < 0 || limitNum > 100) {
        return res.status(400).json({ message: "Invalid limit parameter. Must be a number between 0 and 100" });
      }

      if (isNaN(offsetNum) || offsetNum < 0) {
        return res.status(400).json({ message: "Invalid offset parameter. Must be a non-negative number" });
      }

      // Validate cardType if provided
      if (cardType && cardType !== 'daily' && cardType !== 'lifeline') {
        return res.status(400).json({ message: "Invalid cardType. Must be 'daily' or 'lifeline'" });
      }

      const drawnCards = await storage.getUserDrawnCards(
        userId,
        cardType as string | undefined,
        limitNum,
        offsetNum
      );

      res.json({ drawnCards });
    } catch (error) {
      console.error("Get drawn cards error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Journal entries routes
  app.post('/api/journal-entries', isAuthenticated, async (req, res) => {
    try {
      const result = insertJournalEntrySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input", errors: result.error.issues });
      }

      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = (req.user as any).id;
      const journalEntry = await storage.createJournalEntry({
        ...result.data,
        userId,
      });

      res.status(201).json(journalEntry);
    } catch (error) {
      console.error("Create journal entry error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/journal-entries/card/:drawnCardId', isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { drawnCardId } = req.params;
      const journalEntry = await storage.getJournalEntryByDrawnCardId(drawnCardId);

      if (!journalEntry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }

      // Verify that the journal entry belongs to the authenticated user
      const userId = (req.user as any).id;
      if (journalEntry.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(journalEntry);
    } catch (error) {
      console.error("Get journal entry error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put('/api/journal-entries/:id', isAuthenticated, async (req, res) => {
    try {
      const { content } = req.body;
      if (!content || typeof content !== 'string' || content.length === 0 || content.length > 500) {
        return res.status(400).json({ message: "Content must be between 1 and 500 characters" });
      }

      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { id } = req.params;
      
      // First check if the journal entry exists and belongs to the user
      const existingEntry = await storage.getJournalEntryById(id);
      if (!existingEntry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }

      const userId = (req.user as any).id;
      if (existingEntry.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const journalEntry = await storage.updateJournalEntry(id, content);
      res.json(journalEntry);
    } catch (error) {
      console.error("Update journal entry error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
