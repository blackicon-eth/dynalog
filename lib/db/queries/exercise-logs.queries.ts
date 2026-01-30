import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { exerciseLogs, type ExerciseLog, type NewExerciseLog } from "../db.schema";

export async function createExerciseLog(data: NewExerciseLog): Promise<ExerciseLog> {
  const [log] = await db.insert(exerciseLogs).values(data).returning();
  return log;
}

export async function getExerciseLogById(id: string): Promise<ExerciseLog | undefined> {
  const [log] = await db.select().from(exerciseLogs).where(eq(exerciseLogs.id, id));
  return log;
}

export async function getExerciseLogsBySessionId(sessionId: string): Promise<ExerciseLog[]> {
  return db.select().from(exerciseLogs).where(eq(exerciseLogs.sessionId, sessionId)).orderBy(exerciseLogs.createdAt);
}

export async function getExerciseLogsByExerciseId(exerciseId: string): Promise<ExerciseLog[]> {
  return db.select().from(exerciseLogs).where(eq(exerciseLogs.exerciseId, exerciseId)).orderBy(desc(exerciseLogs.createdAt));
}

export async function getExerciseLogsForSessionAndExercise(sessionId: string, exerciseId: string): Promise<ExerciseLog[]> {
  return db
    .select()
    .from(exerciseLogs)
    .where(and(eq(exerciseLogs.sessionId, sessionId), eq(exerciseLogs.exerciseId, exerciseId)))
    .orderBy(exerciseLogs.setNumber);
}

export async function updateExerciseLog(
  id: string,
  data: Partial<Omit<NewExerciseLog, "id" | "sessionId" | "exerciseId" | "createdAt">>
): Promise<ExerciseLog | undefined> {
  const [log] = await db.update(exerciseLogs).set(data).where(eq(exerciseLogs.id, id)).returning();
  return log;
}

export async function deleteExerciseLog(id: string): Promise<void> {
  await db.delete(exerciseLogs).where(eq(exerciseLogs.id, id));
}

export async function deleteExerciseLogsBySessionId(sessionId: string): Promise<void> {
  await db.delete(exerciseLogs).where(eq(exerciseLogs.sessionId, sessionId));
}
