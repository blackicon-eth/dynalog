import { api } from "./client";

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignInResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface AuthCheckResponse {
  authenticated: boolean;
  user?: {
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
  };
  routines?: Array<{
    id: string;
    userId: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
  recentSessions?: Array<{
    id: string;
    userId: string;
    routineId: string;
    startedAt: Date;
    completedAt: Date | null;
    notes: string | null;
  }>;
  error?: string;
}

export async function signIn(payload: SignInPayload): Promise<SignInResponse> {
  return api.post("auth/sign-in", { json: payload }).json();
}

export async function signOut(): Promise<{ success: boolean }> {
  return api.post("auth/sign-out").json();
}

export async function checkAuth(): Promise<AuthCheckResponse> {
  return api.get("auth/check").json();
}
