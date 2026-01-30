"use client";

import { useMutation } from "@tanstack/react-query";
import { updateMe, type UpdateUserPayload } from "@/lib/api/users";
import { useUser as useUserContext } from "@/components/contexts/user-context";

export function useUpdateUser() {
  const { setUser } = useUserContext();

  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => updateMe(payload),
    onSuccess: (data) => {
      setUser(data.user);
    },
  });
}

// Re-export useUser from context for convenience
export { useUser } from "@/components/contexts/user-context";
