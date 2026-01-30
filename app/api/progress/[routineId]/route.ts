import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/proxy";
import { getRoutineById, getRoutineWithExercises } from "@/lib/db/queries/routines.queries";
import { getWorkoutSessionsByRoutineId } from "@/lib/db/queries/workout-sessions.queries";
import { getExerciseLogsBySessionId } from "@/lib/db/queries/exercise-logs.queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ routineId: string }> }
) {
  try {
    const auth = await requireAuth();
    const { routineId } = await params;

    const routine = await getRoutineById(routineId);

    if (!routine) {
      return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    }

    if (routine.userId !== auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const routineWithExercises = await getRoutineWithExercises(routineId);
    const sessions = await getWorkoutSessionsByRoutineId(routineId);

    // Only get completed sessions
    const completedSessions = sessions.filter((s) => s.completedAt);

    // Get logs for all completed sessions
    const sessionsWithLogs = await Promise.all(
      completedSessions.map(async (session) => {
        const logs = await getExerciseLogsBySessionId(session.id);
        return {
          ...session,
          logs: logs.filter((l) => l.completed),
        };
      })
    );

    // Build progress data per exercise
    const exerciseProgress = routineWithExercises?.exercises.map((exercise) => {
      const dataPoints = sessionsWithLogs
        .map((session) => {
          const exerciseLogs = session.logs.filter(
            (l) => l.exerciseId === exercise.id
          );

          if (exerciseLogs.length === 0) return null;

          // Calculate metrics
          const totalVolume = exerciseLogs.reduce(
            (sum, log) => sum + log.weight * log.reps,
            0
          );
          const maxWeight = Math.max(...exerciseLogs.map((l) => l.weight));
          const totalReps = exerciseLogs.reduce((sum, log) => sum + log.reps, 0);
          const setsCompleted = exerciseLogs.length;

          // Dynascore = total volume / rest time (work per unit of rest)
          // Higher score = more efficient training density
          const dynascore =
            exercise.restTime > 0
              ? Math.round((totalVolume / exercise.restTime) * 100) / 100
              : totalVolume;

          return {
            date: session.completedAt,
            maxWeight,
            totalVolume,
            totalReps,
            setsCompleted,
            dynascore,
          };
        })
        .filter(Boolean)
        .sort(
          (a, b) =>
            new Date(a!.date!).getTime() - new Date(b!.date!).getTime()
        );

      return {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        restTime: exercise.restTime,
        dataPoints,
      };
    });

    return NextResponse.json({
      routine: {
        id: routine.id,
        name: routine.name,
        description: routine.description,
      },
      exerciseProgress: exerciseProgress ?? [],
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get progress error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
