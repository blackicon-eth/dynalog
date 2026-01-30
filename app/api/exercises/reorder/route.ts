import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/proxy";
import { reorderExercises } from "@/lib/db/queries/exercises.queries";
import { getRoutineById } from "@/lib/db/queries/routines.queries";

const reorderSchema = z.object({
  routineId: z.string().min(1),
  exerciseIds: z.array(z.string().min(1)).min(1),
});

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    const body = await request.json();
    const parsed = reorderSchema.safeParse(body);

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

    await reorderExercises(parsed.data.routineId, parsed.data.exerciseIds);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Reorder exercises error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
