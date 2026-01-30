import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/proxy";
import {
  getExerciseById,
  updateExercise,
  deleteExercise,
} from "@/lib/db/queries/exercises.queries";
import { getRoutineById } from "@/lib/db/queries/routines.queries";

const updateExerciseSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  weight: z.number().min(0).optional(),
  series: z.number().int().min(1).optional(),
  reps: z.number().int().min(1).optional(),
  restTime: z.number().int().min(0).optional(),
});

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    const { id } = await params;

    const exercise = await getExerciseById(id);

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    // Verify the routine belongs to the user
    const routine = await getRoutineById(exercise.routineId);

    if (!routine || routine.userId !== auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ exercise });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get exercise error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const parsed = updateExerciseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existingExercise = await getExerciseById(id);

    if (!existingExercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    // Verify the routine belongs to the user
    const routine = await getRoutineById(existingExercise.routineId);

    if (!routine || routine.userId !== auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const exercise = await updateExercise(id, parsed.data);

    return NextResponse.json({ exercise });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update exercise error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    const { id } = await params;

    const existingExercise = await getExerciseById(id);

    if (!existingExercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    // Verify the routine belongs to the user
    const routine = await getRoutineById(existingExercise.routineId);

    if (!routine || routine.userId !== auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteExercise(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Delete exercise error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
