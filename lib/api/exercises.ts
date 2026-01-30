import { api } from "./client";

export interface Exercise {
  id: string;
  routineId: string;
  name: string;
  description: string | null;
  weight: number;
  series: number;
  reps: number;
  restTime: number;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExercisePayload {
  routineId: string;
  name: string;
  description?: string | null;
  weight?: number;
  series?: number;
  reps?: number;
  restTime?: number;
}

export interface UpdateExercisePayload {
  name?: string;
  description?: string | null;
  weight?: number;
  series?: number;
  reps?: number;
  restTime?: number;
}

export async function createExercise(
  payload: CreateExercisePayload
): Promise<{ exercise: Exercise }> {
  return api.post("exercises", { json: payload }).json();
}

export async function getExercise(id: string): Promise<{ exercise: Exercise }> {
  return api.get(`exercises/${id}`).json();
}

export async function updateExercise(
  id: string,
  payload: UpdateExercisePayload
): Promise<{ exercise: Exercise }> {
  return api.patch(`exercises/${id}`, { json: payload }).json();
}

export async function deleteExercise(id: string): Promise<{ success: boolean }> {
  return api.delete(`exercises/${id}`).json();
}

export async function reorderExercises(
  routineId: string,
  exerciseIds: string[]
): Promise<{ success: boolean }> {
  return api.post("exercises/reorder", { json: { routineId, exerciseIds } }).json();
}
