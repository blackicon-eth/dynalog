import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/proxy";
import { getExerciseLogById, updateExerciseLog, deleteExerciseLog } from "@/lib/db/queries/exercise-logs.queries";
import { getWorkoutSessionById } from "@/lib/db/queries/workout-sessions.queries";

const updateLogSchema = z.object({
  weight: z.number().min(0).optional(),
  reps: z.number().int().min(0).optional(),
  completed: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const parsed = updateLogSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
    }

    const existingLog = await getExerciseLogById(id);

    if (!existingLog) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    // Verify the session belongs to the user
    const session = await getWorkoutSessionById(existingLog.sessionId);

    if (!session || session.userId !== auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const log = await updateExerciseLog(id, parsed.data);

    return NextResponse.json({ log });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update log error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth();
    const { id } = await params;

    const existingLog = await getExerciseLogById(id);

    if (!existingLog) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    // Verify the session belongs to the user
    const session = await getWorkoutSessionById(existingLog.sessionId);

    if (!session || session.userId !== auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteExerciseLog(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Delete log error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
