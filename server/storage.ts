import {
  users,
  type User,
  type SignupData,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<(User & { passwordHash: string }) | undefined>;
  createUserWithPassword(signupData: SignupData, passwordHash: string): Promise<User>;
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
}

export const storage = new DatabaseStorage();
