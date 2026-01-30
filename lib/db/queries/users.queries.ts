import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, type User, type NewUser } from "../db.schema";

export async function createUser(data: NewUser): Promise<User> {
  const [user] = await db.insert(users).values(data).returning();
  return user;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

export async function updateUser(
  id: string,
  data: Partial<Omit<NewUser, "id" | "email" | "passwordHash" | "createdAt" | "updatedAt">>
): Promise<User | undefined> {
  const [user] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning();
  return user;
}

export async function updateUserPassword(
  id: string,
  passwordHash: string
): Promise<User | undefined> {
  const [user] = await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, id))
    .returning();
  return user;
}

export async function deleteUser(id: string): Promise<void> {
  await db.delete(users).where(eq(users.id, id));
}
