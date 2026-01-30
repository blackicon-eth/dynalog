import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/proxy";
import { createExerciseLog } from "@/lib/db/queries/exercise-logs.queries";
import { getWorkoutSessionById } from "@/lib/db/queries/workout-sessions.queries";
import { getExerciseById } from "@/lib/db/queries/exercises.queries";
import { getRoutineById } from "@/lib/db/queries/routines.queries";

const createLogSchema = z.object({
  sessionId: z.string().min(1),
  exerciseId: z.string().min(1),
  setNumber: z.number().int().min(1),
  weight: z.number().min(0),
  reps: z.number().int().min(0),
  completed: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    const body = await request.json();
    const parsed = createLogSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify the session belongs to the user
    const session = await getWorkoutSessionById(parsed.data.sessionId);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.userId !== auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (session.completedAt) {
      return NextResponse.json(
        { error: "Cannot log to a completed session" },
        { status: 400 }
      );
    }

    // Verify the exercise exists and belongs to a routine owned by the user
    const exercise = await getExerciseById(parsed.data.exerciseId);

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    const routine = await getRoutineById(exercise.routineId);

    if (!routine || routine.userId !== auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const log = await createExerciseLog({
      sessionId: parsed.data.sessionId,
      exerciseId: parsed.data.exerciseId,
      setNumber: parsed.data.setNumber,
      weight: parsed.data.weight,
      reps: parsed.data.reps,
      completed: parsed.data.completed,
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create log error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
