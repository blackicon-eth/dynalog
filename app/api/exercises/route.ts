import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/proxy";
import { createExercise } from "@/lib/db/queries/exercises.queries";
import { getRoutineById } from "@/lib/db/queries/routines.queries";

const createExerciseSchema = z.object({
  routineId: z.string().min(1),
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).nullable().optional(),
  weight: z.number().min(0).default(0),
  series: z.number().int().min(1).default(3),
  reps: z.number().int().min(1).default(10),
  restTime: z.number().int().min(0).default(60), // seconds
});

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    const body = await request.json();
    const parsed = createExerciseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify the routine belongs to the user
    const routine = await getRoutineById(parsed.data.routineId);

    if (!routine) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    }

    if (routine.userId !== auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const exercise = await createExercise({
      routineId: parsed.data.routineId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      weight: parsed.data.weight,
      series: parsed.data.series,
      reps: parsed.data.reps,
      restTime: parsed.data.restTime,
    });

    return NextResponse.json({ exercise }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create exercise error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
