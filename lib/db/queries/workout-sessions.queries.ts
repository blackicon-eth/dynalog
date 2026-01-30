import { eq, desc, and, isNull, count } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  workoutSessions,
  type WorkoutSession,
  type NewWorkoutSession,
  exerciseLogs,
  routines,
} from "../db.schema";

export async function createWorkoutSession(
  data: NewWorkoutSession
): Promise<WorkoutSession> {
  const [session] = await db.insert(workoutSessions).values(data).returning();
  return session;
}

export async function getWorkoutSessionById(
  id: string
): Promise<WorkoutSession | undefined> {
  const [session] = await db
    .select()
    .from(workoutSessions)
    .where(eq(workoutSessions.id, id));
  return session;
}

export async function getWorkoutSessionsByUserId(
  userId: string
): Promise<WorkoutSession[]> {
  return db
    .select()
    .from(workoutSessions)
    .where(eq(workoutSessions.userId, userId))
    .orderBy(desc(workoutSessions.startedAt));
}

export async function getWorkoutSessionsByUserIdPaginated(
  userId: string,
  page: number = 1,
  limit: number = 15
): Promise<{ sessions: WorkoutSession[]; total: number; hasMore: boolean }> {
  const offset = (page - 1) * limit;

  const [sessions, totalResult] = await Promise.all([
    db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.userId, userId))
      .orderBy(desc(workoutSessions.startedAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(workoutSessions)
      .where(eq(workoutSessions.userId, userId)),
  ]);

  const total = totalResult[0]?.count ?? 0;
  const hasMore = offset + sessions.length < total;

  return { sessions, total, hasMore };
}

export async function getWorkoutSessionsByRoutineId(
  routineId: string
): Promise<WorkoutSession[]> {
  return db
    .select()
    .from(workoutSessions)
    .where(eq(workoutSessions.routineId, routineId))
    .orderBy(desc(workoutSessions.startedAt));
}

export async function getActiveSession(
  userId: string
): Promise<WorkoutSession | undefined> {
  const [session] = await db
    .select()
    .from(workoutSessions)
    .where(
      and(
        eq(workoutSessions.userId, userId),
        isNull(workoutSessions.completedAt)
      )
    );
  return session;
}

export async function getWorkoutSessionWithDetails(id: string) {
  const [session] = await db
    .select()
    .from(workoutSessions)
    .where(eq(workoutSessions.id, id));

  if (!session) return undefined;

  const [routine] = await db
    .select()
    .from(routines)
    .where(eq(routines.id, session.routineId));

  const logs = await db
    .select()
    .from(exerciseLogs)
    .where(eq(exerciseLogs.sessionId, id))
    .orderBy(exerciseLogs.createdAt);

  return {
    ...session,
    routine,
    logs,
  };
}

export async function completeWorkoutSession(
  id: string,
  notes?: string
): Promise<WorkoutSession | undefined> {
  const [session] = await db
    .update(workoutSessions)
    .set({
      completedAt: new Date().toISOString(),
      notes: notes ?? null,
    })
    .where(eq(workoutSessions.id, id))
    .returning();
  return session;
}

export async function deleteWorkoutSession(id: string): Promise<void> {
  await db.delete(workoutSessions).where(eq(workoutSessions.id, id));
}
