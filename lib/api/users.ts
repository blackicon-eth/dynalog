import { api } from "./client";

export interface User {
  id: string;
  email: string;
  name: string;
  gender: string | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  fitnessGoal: string | null;
  activityLevel: string | null;
  avatar: string | null;
  createdAt: Date;
}

export interface UpdateUserPayload {
  name?: string;
  gender?: "male" | "female" | "other" | null;
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  fitnessGoal?: "lose_weight" | "build_muscle" | "maintain" | "improve_endurance" | "flexibility" | null;
  activityLevel?: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extremely_active" | null;
  avatar?: string | null;
}

export interface GetMeResponse {
  user: User;
  routines: Array<{
    id: string;
    userId: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
  sessions: Array<{
    id: string;
    userId: string;
    routineId: string;
    startedAt: Date;
    completedAt: Date | null;
    notes: string | null;
  }>;
}

export async function getMe(): Promise<GetMeResponse> {
  return api.get("users/me").json();
}

export async function updateMe(payload: UpdateUserPayload): Promise<{ user: User }> {
  return api.patch("users/me", { json: payload }).json();
}
