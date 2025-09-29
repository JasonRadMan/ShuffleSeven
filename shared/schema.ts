import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  passwordHash: varchar("password_hash").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Push notification subscriptions table
export const notificationSubscriptions = pgTable("notification_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  endpoint: text("endpoint").notNull(),
  p256dhKey: text("p256dh_key").notNull(),
  authKey: text("auth_key").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_notification_subscriptions_user_id").on(table.userId),
  index("IDX_notification_subscriptions_endpoint").on(table.endpoint),
]);

// User drawn cards table
export const drawnCards = pgTable("drawn_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  cardId: varchar("card_id").notNull(),
  cardData: jsonb("card_data").notNull(),
  drawnAt: timestamp("drawn_at").defaultNow(),
  cardType: varchar("card_type").notNull(), // 'daily' or 'lifeline'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_drawn_cards_user_id").on(table.userId),
  index("IDX_drawn_cards_card_type").on(table.cardType),
  index("IDX_drawn_cards_drawn_at").on(table.drawnAt),
]);

// Journal entries table
export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  drawnCardId: varchar("drawn_card_id").notNull().references(() => drawnCards.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_journal_entries_drawn_card_id").on(table.drawnCardId),
  index("IDX_journal_entries_user_id").on(table.userId),
]);

export const signupSchema = z.object({
  email: z.string().email().transform(v => v.toLowerCase()),
  password: z.string().min(8).max(72),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email().transform(v => v.toLowerCase()),
  password: z.string().min(1),
});

export const notificationSubscriptionSchema = z.object({
  userId: z.string(),
  subscription: z.object({
    endpoint: z.string(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
  }),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  passwordHash: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSubscriptionSchema = createInsertSchema(notificationSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDrawnCardSchema = createInsertSchema(drawnCards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  content: z.string().min(1).max(500, "Journal entry cannot exceed 500 characters"),
});

export type SignupData = z.infer<typeof signupSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type NotificationSubscriptionData = z.infer<typeof notificationSubscriptionSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertNotificationSubscription = z.infer<typeof insertNotificationSubscriptionSchema>;
export type InsertDrawnCard = z.infer<typeof insertDrawnCardSchema>;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type User = Omit<typeof users.$inferSelect, 'passwordHash'>;
export type NotificationSubscription = typeof notificationSubscriptions.$inferSelect;
export type DrawnCard = typeof drawnCards.$inferSelect;
export type JournalEntry = typeof journalEntries.$inferSelect;
