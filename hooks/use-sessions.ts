"use client";

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSessions,
  getSession,
  createSession,
  completeSession,
  deleteSession,
  createLog,
  updateLog,
  deleteLog,
  type CreateSessionPayload,
  type CompleteSessionPayload,
  type CreateLogPayload,
  type UpdateLogPayload,
} from "@/lib/api/sessions";
import { useUser } from "@/components/contexts/user-context";

const SESSIONS_PER_PAGE = 15;

export function useSessions() {
  const { isAuthenticated } = useUser();

  return useInfiniteQuery({
    queryKey: ["sessions"],
    queryFn: async ({ pageParam = 1 }) => {
      return getSessions(pageParam, SESSIONS_PER_PAGE);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: isAuthenticated,
  });
}

export function useSession(id: string) {
  const { isAuthenticated } = useUser();

  return useQuery({
    queryKey: ["sessions", id],
    queryFn: async () => {
      const response = await getSession(id);
      return response.session;
    },
    enabled: isAuthenticated && !!id,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSessionPayload) => createSession(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export function useCompleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload?: CompleteSessionPayload;
    }) => completeSession(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["sessions", variables.id] });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export function useCreateLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLogPayload) => createLog(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["sessions", variables.sessionId],
      });
    },
  });
}

export function useUpdateLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      sessionId: string;
      payload: UpdateLogPayload;
    }) => updateLog(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["sessions", variables.sessionId],
      });
    },
  });
}

export function useDeleteLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; sessionId: string }) =>
      deleteLog(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["sessions", variables.sessionId],
      });
    },
  });
}
