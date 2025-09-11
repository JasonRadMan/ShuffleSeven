import {
  users,
  notificationSubscriptions,
  drawnCards,
  type User,
  type SignupData,
  type NotificationSubscription,
  type InsertNotificationSubscription,
  type DrawnCard,
  type InsertDrawnCard,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<(User & { passwordHash: string }) | undefined>;
  createUserWithPassword(signupData: SignupData, passwordHash: string): Promise<User>;
  
  // Notification subscription operations
  createNotificationSubscription(subscriptionData: InsertNotificationSubscription): Promise<NotificationSubscription>;
  getNotificationSubscriptionsByUserId(userId: string): Promise<NotificationSubscription[]>;
  updateNotificationSubscription(id: string, isActive: boolean): Promise<NotificationSubscription | undefined>;
  deleteNotificationSubscriptionsByUserId(userId: string): Promise<void>;
  getActiveNotificationSubscriptions(): Promise<NotificationSubscription[]>;
  
  // Drawn cards operations
  saveDrawnCard(userId: string, insertDrawnCard: InsertDrawnCard): Promise<DrawnCard>;
  getUserDrawnCards(userId: string, cardType?: string, limitCount?: number, offsetCount?: number): Promise<DrawnCard[]>;
  getDrawnCardsByUser(userId: string): Promise<DrawnCard[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      profileImageUrl: users.profileImageUrl,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<(User & { passwordHash: string }) | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return user;
  }

  async createUserWithPassword(signupData: SignupData, passwordHash: string): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email: signupData.email.toLowerCase(),
        passwordHash,
        firstName: signupData.firstName,
        lastName: signupData.lastName,
      })
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });
    return user;
  }

  // Notification subscription operations
  async createNotificationSubscription(subscriptionData: InsertNotificationSubscription): Promise<NotificationSubscription> {
    // First, deactivate any existing subscriptions for this user
    await db
      .update(notificationSubscriptions)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(notificationSubscriptions.userId, subscriptionData.userId));

    // Create new subscription
    const [subscription] = await db
      .insert(notificationSubscriptions)
      .values(subscriptionData)
      .returning();
    
    return subscription;
  }

  async getNotificationSubscriptionsByUserId(userId: string): Promise<NotificationSubscription[]> {
    return await db
      .select()
      .from(notificationSubscriptions)
      .where(eq(notificationSubscriptions.userId, userId));
  }

  async updateNotificationSubscription(id: string, isActive: boolean): Promise<NotificationSubscription | undefined> {
    const [subscription] = await db
      .update(notificationSubscriptions)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(notificationSubscriptions.id, id))
      .returning();
    
    return subscription;
  }

  async deleteNotificationSubscriptionsByUserId(userId: string): Promise<void> {
    await db
      .delete(notificationSubscriptions)
      .where(eq(notificationSubscriptions.userId, userId));
  }

  async getActiveNotificationSubscriptions(): Promise<NotificationSubscription[]> {
    return await db
      .select()
      .from(notificationSubscriptions)
      .where(eq(notificationSubscriptions.isActive, true));
  }

  // Drawn cards operations
  async saveDrawnCard(userId: string, insertDrawnCard: InsertDrawnCard): Promise<DrawnCard> {
    const [drawnCard] = await db
      .insert(drawnCards)
      .values({
        ...insertDrawnCard,
        userId,
      })
      .returning();
    
    return drawnCard;
  }

  async getUserDrawnCards(userId: string, cardType?: string, limitCount?: number, offsetCount?: number): Promise<DrawnCard[]> {
    const conditions = [eq(drawnCards.userId, userId)];
    
    if (cardType) {
      conditions.push(eq(drawnCards.cardType, cardType));
    }

    const baseQuery = db
      .select()
      .from(drawnCards)
      .where(and(...conditions))
      .orderBy(desc(drawnCards.drawnAt));

    // Apply limit and offset using SQL when needed
    if (limitCount !== undefined && offsetCount !== undefined) {
      return await baseQuery.limit(limitCount).offset(offsetCount);
    } else if (limitCount !== undefined) {
      return await baseQuery.limit(limitCount);
    } else if (offsetCount !== undefined) {
      return await baseQuery.offset(offsetCount);
    } else {
      return await baseQuery;
    }
  }

  async getDrawnCardsByUser(userId: string): Promise<DrawnCard[]> {
    return await db
      .select()
      .from(drawnCards)
      .where(eq(drawnCards.userId, userId))
      .orderBy(desc(drawnCards.drawnAt));
  }
}

export const storage = new DatabaseStorage();
