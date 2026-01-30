import { api } from "./client";

export interface Routine {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface RoutineWithExercises extends Routine {
  exercises: Exercise[];
}

export interface CreateRoutinePayload {
  name: string;
  description?: string | null;
}

export interface UpdateRoutinePayload {
  name?: string;
  description?: string | null;
}

export async function getRoutines(): Promise<{ routines: Routine[] }> {
  return api.get("routines").json();
}

export async function getRoutine(id: string): Promise<{ routine: RoutineWithExercises }> {
  return api.get(`routines/${id}`).json();
}

export async function createRoutine(payload: CreateRoutinePayload): Promise<{ routine: Routine }> {
  return api.post("routines", { json: payload }).json();
}

export async function updateRoutine(
  id: string,
  payload: UpdateRoutinePayload
): Promise<{ routine: Routine }> {
  return api.patch(`routines/${id}`, { json: payload }).json();
}

export async function deleteRoutine(id: string): Promise<{ success: boolean }> {
  return api.delete(`routines/${id}`).json();
}
