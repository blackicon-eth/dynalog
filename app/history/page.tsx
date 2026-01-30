"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { History, Loader2 } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { SessionCard } from "@/components/sessions/session-card";
import { useSessions } from "@/hooks/use-sessions";
import { useUser } from "@/hooks/use-user";

export default function HistoryPage() {
  const { routines } = useUser();
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSessions();

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Flatten all pages into a single array of sessions
  const sessions = data?.pages.flatMap((page) => page.sessions) ?? [];

  const getRoutineName = (routineId: string) => {
    return routines.find((r) => r.id === routineId)?.name;
  };

  // Infinite scroll using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <PageContainer className="mx-auto max-w-7xl px-4 py-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-foreground">Workout History</h1>
        <p className="text-muted-foreground">
          View your past workout sessions
        </p>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-destructive">
            Failed to load history. Please try again.
          </p>
        </div>
      ) : sessions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <History className="h-16 w-16 text-muted-foreground/50" />
          </motion.div>
          <h3 className="mt-4 text-lg font-medium text-muted-foreground">
            No workout history yet
          </h3>
          <p className="mt-1 text-sm text-muted-foreground text-center px-5">
            Start a workout to begin tracking your progress
          </p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-4">
          {sessions.map((session, index) => (
            <SessionCard
              key={session.id}
              session={session}
              routineName={getRoutineName(session.routineId)}
              index={index % 15}
            />
          ))}

          {/* Load more trigger */}
          <div ref={loadMoreRef} className="py-4">
            {isFetchingNextPage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2"
              >
                <Loader2 className="h-5 w-5 animate-spin text-secondary" />
                <span className="text-sm text-muted-foreground">
                  Loading more workouts...
                </span>
              </motion.div>
            )}
            {!hasNextPage && sessions.length > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                You&apos;ve reached the end of your history
              </p>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
