import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { routines, exercises, workoutSessions, exerciseLogs } from "@/lib/db/db.schema";
import { eq } from "drizzle-orm";
import { ulid } from "ulid";

// Hardcoded test user ID
const TEST_USER_ID = "01KEVGRA18F1V4R1K4KFV361J5";

// Realistic workout routines with exercises
const mockRoutines = [
  {
    name: "Push Day",
    description: "Chest, shoulders, and triceps workout",
    exercises: [
      { name: "Bench Press", weight: 60, series: 4, reps: 8, restTime: 120 },
      { name: "Overhead Press", weight: 40, series: 4, reps: 8, restTime: 90 },
      { name: "Incline Dumbbell Press", weight: 24, series: 3, reps: 10, restTime: 90 },
      { name: "Lateral Raises", weight: 10, series: 3, reps: 12, restTime: 60 },
      { name: "Tricep Pushdowns", weight: 25, series: 3, reps: 12, restTime: 60 },
    ],
  },
  {
    name: "Pull Day",
    description: "Back and biceps workout",
    exercises: [
      { name: "Deadlift", weight: 80, series: 4, reps: 6, restTime: 180 },
      { name: "Barbell Rows", weight: 50, series: 4, reps: 8, restTime: 120 },
      { name: "Lat Pulldowns", weight: 50, series: 3, reps: 10, restTime: 90 },
      { name: "Face Pulls", weight: 20, series: 3, reps: 15, restTime: 60 },
      { name: "Barbell Curls", weight: 25, series: 3, reps: 10, restTime: 60 },
    ],
  },
  {
    name: "Leg Day",
    description: "Quadriceps, hamstrings, and calves",
    exercises: [
      { name: "Squat", weight: 70, series: 4, reps: 8, restTime: 180 },
      { name: "Romanian Deadlift", weight: 60, series: 4, reps: 10, restTime: 120 },
      { name: "Leg Press", weight: 120, series: 3, reps: 12, restTime: 90 },
      { name: "Leg Curls", weight: 35, series: 3, reps: 12, restTime: 60 },
      { name: "Calf Raises", weight: 80, series: 4, reps: 15, restTime: 60 },
    ],
  },
];

// Helper to add random variation (-10% to +10%)
function addVariation(value: number, percentage: number = 0.1): number {
  const variation = value * percentage * (Math.random() * 2 - 1);
  return Math.round((value + variation) * 2) / 2; // Round to nearest 0.5
}

// Helper to calculate progressive weight over time (simulate strength gains)
function getProgressiveWeight(
  baseWeight: number,
  weekNumber: number,
  totalWeeks: number
): number {
  // Simulate ~20-30% strength gain over a year with some randomness
  const progressMultiplier = 1 + (weekNumber / totalWeeks) * 0.25;
  const weight = baseWeight * progressMultiplier;
  return addVariation(weight, 0.05);
}

// Helper to get random reps with slight variation
function getRandomReps(targetReps: number): number {
  const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
  return Math.max(1, targetReps + variation);
}

export async function POST() {
  try {
    const userId = TEST_USER_ID;

    const createdRoutines: { id: string; exercises: { id: string; data: typeof mockRoutines[0]["exercises"][0] }[] }[] = [];

    // Create routines and exercises
    for (const routineData of mockRoutines) {
      const routineId = ulid();

      await db.insert(routines).values({
        id: routineId,
        userId,
        name: routineData.name,
        description: routineData.description,
      });

      const createdExercises: { id: string; data: typeof routineData.exercises[0] }[] = [];

      for (let i = 0; i < routineData.exercises.length; i++) {
        const exerciseData = routineData.exercises[i];
        const exerciseId = ulid();

        await db.insert(exercises).values({
          id: exerciseId,
          routineId,
          name: exerciseData.name,
          weight: exerciseData.weight,
          series: exerciseData.series,
          reps: exerciseData.reps,
          restTime: exerciseData.restTime,
          orderIndex: i,
        });

        createdExercises.push({ id: exerciseId, data: exerciseData });
      }

      createdRoutines.push({ id: routineId, exercises: createdExercises });
    }

    // Generate workout sessions for the past year
    // Simulate training 3-4 times per week (Push/Pull/Legs rotation)
    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const totalWeeks = 52;
    let sessionCount = 0;
    let logCount = 0;

    // Iterate through each week of the year
    for (let week = 0; week < totalWeeks; week++) {
      // 3-4 workouts per week (sometimes skip a day)
      const workoutsThisWeek = Math.random() > 0.2 ? 3 : 2;

      for (let workout = 0; workout < workoutsThisWeek; workout++) {
        // Rotate through routines (Push, Pull, Legs)
        const routineIndex = (week * 3 + workout) % 3;
        const routine = createdRoutines[routineIndex];

        // Calculate date for this workout
        const workoutDate = new Date(oneYearAgo);
        workoutDate.setDate(workoutDate.getDate() + week * 7 + workout * 2 + Math.floor(Math.random() * 2));

        // Skip if date is in the future
        if (workoutDate > now) continue;

        // Randomly skip some workouts (simulate missed days ~10%)
        if (Math.random() < 0.1) continue;

        const sessionId = ulid();
        const startedAt = new Date(workoutDate);
        startedAt.setHours(Math.floor(Math.random() * 4) + 17); // Between 5-9 PM
        startedAt.setMinutes(Math.floor(Math.random() * 60));

        // Workout duration between 45-90 minutes
        const durationMinutes = 45 + Math.floor(Math.random() * 45);
        const completedAt = new Date(startedAt);
        completedAt.setMinutes(completedAt.getMinutes() + durationMinutes);

        await db.insert(workoutSessions).values({
          id: sessionId,
          userId,
          routineId: routine.id,
          startedAt: startedAt.toISOString(),
          completedAt: completedAt.toISOString(),
          notes: Math.random() > 0.7 ? getRandomNote() : null,
        });

        sessionCount++;

        // Create exercise logs for each exercise
        for (const exercise of routine.exercises) {
          const progressiveWeight = getProgressiveWeight(
            exercise.data.weight,
            week,
            totalWeeks
          );

          // Log each set
          for (let setNumber = 1; setNumber <= exercise.data.series; setNumber++) {
            // Sometimes fail to complete all sets (last set might be skipped ~5%)
            if (setNumber === exercise.data.series && Math.random() < 0.05) continue;

            // Weight might drop slightly on later sets
            const setWeight = setNumber <= 2
              ? progressiveWeight
              : addVariation(progressiveWeight * 0.95, 0.02);

            await db.insert(exerciseLogs).values({
              id: ulid(),
              sessionId,
              exerciseId: exercise.id,
              setNumber,
              weight: Math.max(0, setWeight),
              reps: getRandomReps(exercise.data.reps),
              completed: true,
              createdAt: new Date(startedAt.getTime() + setNumber * 60000).toISOString(),
            });

            logCount++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Mock data created successfully",
      data: {
        routines: createdRoutines.length,
        sessions: sessionCount,
        logs: logCount,
      },
    });
  } catch (error) {
    console.error("Create mock data error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getRandomNote(): string {
  const notes = [
    "Felt strong today!",
    "A bit tired, but pushed through",
    "Great pump",
    "Need to focus on form next time",
    "New PR!",
    "Solid workout",
    "Energy was low today",
    "Increased weight on main lifts",
    "Good session overall",
    "Need more sleep",
    "Felt the mind-muscle connection",
    "Quick but effective",
  ];
  return notes[Math.floor(Math.random() * notes.length)];
}

// DELETE endpoint to clean up test data
export async function DELETE() {
  try {
    const userId = TEST_USER_ID;

    // Delete all user's data (cascades will handle related records)
    await db.delete(routines).where(eq(routines.userId, userId));

    return NextResponse.json({
      success: true,
      message: "All user data deleted successfully",
    });
  } catch (error) {
    console.error("Delete data error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
