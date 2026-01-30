import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/proxy";
import {
  createRoutine,
  getRoutinesByUserId,
} from "@/lib/db/queries/routines.queries";

const createRoutineSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).nullable().optional(),
});

export async function GET() {
  try {
    const auth = await requireAuth();
    const routines = await getRoutinesByUserId(auth.userId);

    return NextResponse.json({ routines });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get routines error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    const body = await request.json();
    const parsed = createRoutineSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const routine = await createRoutine({
      userId: auth.userId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    });

    return NextResponse.json({ routine }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create routine error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
