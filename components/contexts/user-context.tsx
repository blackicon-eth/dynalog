"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { checkAuth, signOut as apiSignOut } from "@/lib/api/auth";
import type { User } from "@/lib/api/users";
import type { Routine } from "@/lib/api/routines";
import type { WorkoutSession } from "@/lib/api/sessions";

interface UserContextValue {
  user: User | null;
  routines: Routine[];
  recentSessions: WorkoutSession[];
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setRoutines: (routines: Routine[]) => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await checkAuth();

      if (response.authenticated && response.user) {
        setUser(response.user as User);
        setRoutines((response.routines as Routine[]) ?? []);
        setRecentSessions((response.recentSessions as WorkoutSession[]) ?? []);
      } else {
        setUser(null);
        setRoutines([]);
        setRecentSessions([]);
      }
    } catch {
      setUser(null);
      setRoutines([]);
      setRecentSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await apiSignOut();
    } finally {
      setUser(null);
      setRoutines([]);
      setRecentSessions([]);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const value: UserContextValue = {
    user,
    routines,
    recentSessions,
    isLoading,
    isAuthenticated: !!user,
    refreshUser,
    signOut,
    setUser,
    setRoutines,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}
