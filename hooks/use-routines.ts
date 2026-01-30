"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRoutines,
  getRoutine,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  type CreateRoutinePayload,
  type UpdateRoutinePayload,
} from "@/lib/api/routines";
import { useUser } from "@/components/contexts/user-context";

export function useRoutines() {
  const { isAuthenticated } = useUser();

  return useQuery({
    queryKey: ["routines"],
    queryFn: async () => {
      const response = await getRoutines();
      return response.routines;
    },
    enabled: isAuthenticated,
  });
}

export function useRoutine(id: string) {
  const { isAuthenticated } = useUser();

  return useQuery({
    queryKey: ["routines", id],
    queryFn: async () => {
      const response = await getRoutine(id);
      return response.routine;
    },
    enabled: isAuthenticated && !!id,
  });
}

export function useCreateRoutine() {
  const queryClient = useQueryClient();
  const { setRoutines, routines } = useUser();

  return useMutation({
    mutationFn: (payload: CreateRoutinePayload) => createRoutine(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
      setRoutines([data.routine, ...routines]);
    },
  });
}

export function useUpdateRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRoutinePayload }) =>
      updateRoutine(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
      queryClient.invalidateQueries({ queryKey: ["routines", variables.id] });
    },
  });
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient();
  const { setRoutines, routines } = useUser();

  return useMutation({
    mutationFn: (id: string) => deleteRoutine(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
      setRoutines(routines.filter((r) => r.id !== id));
    },
  });
}
