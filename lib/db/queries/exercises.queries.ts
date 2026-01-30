import { eq, and, gt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { exercises, type Exercise, type NewExercise } from "../db.schema";

export async function createExercise(data: NewExercise): Promise<Exercise> {
  // Get the next order index for this routine
  const [maxOrder] = await db
    .select({ maxIndex: sql<number>`MAX(${exercises.orderIndex})` })
    .from(exercises)
    .where(eq(exercises.routineId, data.routineId));

  const orderIndex = (maxOrder?.maxIndex ?? -1) + 1;

  const [exercise] = await db
    .insert(exercises)
    .values({ ...data, orderIndex })
    .returning();
  return exercise;
}

export async function getExerciseById(id: string): Promise<Exercise | undefined> {
  const [exercise] = await db.select().from(exercises).where(eq(exercises.id, id));
  return exercise;
}

export async function getExercisesByRoutineId(routineId: string): Promise<Exercise[]> {
  return db
    .select()
    .from(exercises)
    .where(eq(exercises.routineId, routineId))
    .orderBy(exercises.orderIndex);
}

export async function updateExercise(
  id: string,
  data: Partial<Omit<NewExercise, "id" | "routineId" | "createdAt" | "updatedAt">>
): Promise<Exercise | undefined> {
  const [exercise] = await db
    .update(exercises)
    .set(data)
    .where(eq(exercises.id, id))
    .returning();
  return exercise;
}

export async function deleteExercise(id: string): Promise<void> {
  const [exercise] = await db.select().from(exercises).where(eq(exercises.id, id));
  if (!exercise) return;

  await db.delete(exercises).where(eq(exercises.id, id));

  // Update order indices for remaining exercises
  await db
    .update(exercises)
    .set({ orderIndex: sql`${exercises.orderIndex} - 1` })
    .where(
      and(
        eq(exercises.routineId, exercise.routineId),
        gt(exercises.orderIndex, exercise.orderIndex)
      )
    );
}

export async function reorderExercises(
  routineId: string,
  exerciseIds: string[]
): Promise<void> {
  // Update each exercise with its new order index
  await Promise.all(
    exerciseIds.map((id, index) =>
      db
        .update(exercises)
        .set({ orderIndex: index })
        .where(and(eq(exercises.id, id), eq(exercises.routineId, routineId)))
    )
  );
}

export async function moveExercise(
  id: string,
  direction: "up" | "down"
): Promise<void> {
  const [exercise] = await db.select().from(exercises).where(eq(exercises.id, id));
  if (!exercise) return;

  const targetIndex = direction === "up"
    ? exercise.orderIndex - 1
    : exercise.orderIndex + 1;

  if (targetIndex < 0) return;

  // Find the exercise at the target position
  const [targetExercise] = await db
    .select()
    .from(exercises)
    .where(
      and(
        eq(exercises.routineId, exercise.routineId),
        eq(exercises.orderIndex, targetIndex)
      )
    );

  if (!targetExercise) return;

  // Swap positions
  await db
    .update(exercises)
    .set({ orderIndex: targetIndex })
    .where(eq(exercises.id, id));

  await db
    .update(exercises)
    .set({ orderIndex: exercise.orderIndex })
    .where(eq(exercises.id, targetExercise.id));
}
