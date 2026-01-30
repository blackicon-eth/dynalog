import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/proxy";
import {
  createWorkoutSession,
  getWorkoutSessionsByUserIdPaginated,
  getActiveSession,
} from "@/lib/db/queries/workout-sessions.queries";
import { getRoutineById } from "@/lib/db/queries/routines.queries";

const createSessionSchema = z.object({
  routineId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "15", 10);

    const { sessions, total, hasMore } = await getWorkoutSessionsByUserIdPaginated(
      auth.userId,
      page,
      limit
    );

    return NextResponse.json({ sessions, total, hasMore, page, limit });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get sessions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    const body = await request.json();
    const parsed = createSessionSchema.safeParse(body);

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

    // Check if there's already an active session
    const activeSession = await getActiveSession(auth.userId);

    if (activeSession) {
      return NextResponse.json(
        { error: "You already have an active session", activeSessionId: activeSession.id },
        { status: 400 }
      );
    }

    const session = await createWorkoutSession({
      userId: auth.userId,
      routineId: parsed.data.routineId,
      startedAt: new Date().toISOString(),
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create session error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
