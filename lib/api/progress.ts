import { api } from "./client";

export interface ProgressDataPoint {
  date: string;
  maxWeight: number;
  totalVolume: number;
  totalReps: number;
  setsCompleted: number;
  dynascore: number;
}

export interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  restTime: number;
  dataPoints: ProgressDataPoint[];
}

export interface RoutineProgress {
  routine: {
    id: string;
    name: string;
    description: string | null;
  };
  exerciseProgress: ExerciseProgress[];
}

export async function getRoutineProgress(routineId: string): Promise<RoutineProgress> {
  return api.get(`progress/${routineId}`).json();
}
