import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/proxy";
import { getUserById } from "@/lib/db/queries/users.queries";
import { getRoutinesByUserId } from "@/lib/db/queries/routines.queries";
import { getWorkoutSessionsByUserId } from "@/lib/db/queries/workout-sessions.queries";

export async function GET() {
  try {
    const tokenPayload = await getAuthenticatedUser();

    if (!tokenPayload) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const user = await getUserById(tokenPayload.userId);

    if (!user) {
      return NextResponse.json(
        { authenticated: false, error: "User not found" },
        { status: 401 }
      );
    }

    // Fetch user's routines and recent sessions
    const [routines, sessions] = await Promise.all([
      getRoutinesByUserId(user.id),
      getWorkoutSessionsByUserId(user.id),
    ]);

    // Return user data without sensitive information
    return NextResponse.json({
      authenticated: true,
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
      recentSessions: sessions.slice(0, 10),
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { authenticated: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
