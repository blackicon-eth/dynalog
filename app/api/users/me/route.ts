import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/proxy";
import { getUserById, updateUser } from "@/lib/db/queries/users.queries";
import { getRoutinesByUserId } from "@/lib/db/queries/routines.queries";
import { getWorkoutSessionsByUserId } from "@/lib/db/queries/workout-sessions.queries";

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  gender: z.enum(["male", "female", "other"]).nullable().optional(),
  age: z.number().int().min(1).max(150).nullable().optional(),
  height: z.number().int().min(1).max(300).nullable().optional(), // cm
  weight: z.number().min(1).max(500).nullable().optional(), // kg
  fitnessGoal: z
    .enum(["lose_weight", "build_muscle", "maintain", "improve_endurance", "flexibility"])
    .nullable()
    .optional(),
  activityLevel: z
    .enum(["sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"])
    .nullable()
    .optional(),
  avatar: z.string().nullable().optional(),
});

export async function GET() {
  try {
    const auth = await requireAuth();
    const user = await getUserById(auth.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [routines, sessions] = await Promise.all([
      getRoutinesByUserId(user.id),
      getWorkoutSessionsByUserId(user.id),
    ]);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        gender: user.gender,
        age: user.age,
        height: user.height,
        weight: user.weight,
        fitnessGoal: user.fitnessGoal,
        activityLevel: user.activityLevel,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      routines,
      sessions,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth();
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const user = await updateUser(auth.userId, parsed.data);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        gender: user.gender,
        age: user.age,
        height: user.height,
        weight: user.weight,
        fitnessGoal: user.fitnessGoal,
        activityLevel: user.activityLevel,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
