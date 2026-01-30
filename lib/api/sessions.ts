import { api } from "./client";
import type { Routine } from "./routines";

export interface WorkoutSession {
  id: string;
  userId: string;
  routineId: string;
  startedAt: Date;
  completedAt: Date | null;
  notes: string | null;
}

export interface ExerciseLog {
  id: string;
  sessionId: string;
  exerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
  createdAt: Date;
}

export interface WorkoutSessionWithDetails extends WorkoutSession {
  routine: Routine;
  logs: ExerciseLog[];
}

export interface CreateSessionPayload {
  routineId: string;
}

export interface CompleteSessionPayload {
  notes?: string | null;
}

export interface CreateLogPayload {
  sessionId: string;
  exerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  completed?: boolean;
}

export interface UpdateLogPayload {
  weight?: number;
  reps?: number;
  completed?: boolean;
}

export interface PaginatedSessionsResponse {
  sessions: WorkoutSession[];
  total: number;
  hasMore: boolean;
  page: number;
  limit: number;
}

export async function getSessions(
  page: number = 1,
  limit: number = 15
): Promise<PaginatedSessionsResponse> {
  return api.get(`sessions?page=${page}&limit=${limit}`).json();
}

export async function getSession(
  id: string
): Promise<{ session: WorkoutSessionWithDetails }> {
  return api.get(`sessions/${id}`).json();
}

export async function createSession(
  payload: CreateSessionPayload
): Promise<{ session: WorkoutSession }> {
  return api.post("sessions", { json: payload }).json();
}

export async function completeSession(
  id: string,
  payload?: CompleteSessionPayload
): Promise<{ session: WorkoutSession }> {
  return api.patch(`sessions/${id}`, { json: payload ?? {} }).json();
}

export async function deleteSession(id: string): Promise<{ success: boolean }> {
  return api.delete(`sessions/${id}`).json();
}

export async function createLog(
  payload: CreateLogPayload
): Promise<{ log: ExerciseLog }> {
  return api.post("logs", { json: payload }).json();
}

export async function updateLog(
  id: string,
  payload: UpdateLogPayload
): Promise<{ log: ExerciseLog }> {
  return api.patch(`logs/${id}`, { json: payload }).json();
}

export async function deleteLog(id: string): Promise<{ success: boolean }> {
  return api.delete(`logs/${id}`).json();
}
