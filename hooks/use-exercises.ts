"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createExercise,
  updateExercise,
  deleteExercise,
  reorderExercises,
  type CreateExercisePayload,
  type UpdateExercisePayload,
} from "@/lib/api/exercises";

export function useCreateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateExercisePayload) => createExercise(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["routines", variables.routineId],
      });
    },
  });
}

export function useUpdateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      routineId: string;
      payload: UpdateExercisePayload;
    }) => updateExercise(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["routines", variables.routineId],
      });
    },
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; routineId: string }) =>
      deleteExercise(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["routines", variables.routineId],
      });
    },
  });
}

export function useReorderExercises() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      routineId,
      exerciseIds,
    }: {
      routineId: string;
      exerciseIds: string[];
    }) => reorderExercises(routineId, exerciseIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["routines", variables.routineId],
      });
    },
  });
}
