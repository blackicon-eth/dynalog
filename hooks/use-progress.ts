"use client";

import { useQuery } from "@tanstack/react-query";
import { getRoutineProgress } from "@/lib/api/progress";
import { useUser } from "@/components/contexts/user-context";

export function useRoutineProgress(routineId: string) {
  const { isAuthenticated } = useUser();

  return useQuery({
    queryKey: ["progress", routineId],
    queryFn: () => getRoutineProgress(routineId),
    enabled: isAuthenticated && !!routineId,
  });
}
