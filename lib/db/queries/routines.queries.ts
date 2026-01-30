import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { routines, type Routine, type NewRoutine, exercises } from "../db.schema";

export async function createRoutine(data: NewRoutine): Promise<Routine> {
  const [routine] = await db.insert(routines).values(data).returning();
  return routine;
}

export async function getRoutineById(id: string): Promise<Routine | undefined> {
  const [routine] = await db.select().from(routines).where(eq(routines.id, id));
  return routine;
}

export async function getRoutinesByUserId(userId: string): Promise<Routine[]> {
  return db
    .select()
    .from(routines)
    .where(eq(routines.userId, userId))
    .orderBy(desc(routines.createdAt));
}

export async function getRoutineWithExercises(id: string) {
  const [routine] = await db
    .select()
    .from(routines)
    .where(eq(routines.id, id));

  if (!routine) return undefined;

  const routineExercises = await db
    .select()
    .from(exercises)
    .where(eq(exercises.routineId, id))
    .orderBy(exercises.orderIndex);

  return {
    ...routine,
    exercises: routineExercises,
  };
}

export async function updateRoutine(
  id: string,
  data: Partial<Omit<NewRoutine, "id" | "userId" | "createdAt" | "updatedAt">>
): Promise<Routine | undefined> {
  const [routine] = await db
    .update(routines)
    .set(data)
    .where(eq(routines.id, id))
    .returning();
  return routine;
}

export async function deleteRoutine(id: string): Promise<void> {
  await db.delete(routines).where(eq(routines.id, id));
}
