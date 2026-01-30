"use client";

import { use, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, TrendingUp } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { ExerciseChart } from "@/components/progress/exercise-chart";
import { TimeframeSelector, type Timeframe } from "@/components/progress/timeframe-selector";
import { useRoutineProgress } from "@/hooks/use-progress";

interface RoutineProgressPageProps {
  params: Promise<{ routineId: string }>;
}

export default function RoutineProgressPage({ params }: RoutineProgressPageProps) {
  const { routineId } = use(params);
  const [timeframe, setTimeframe] = useState<Timeframe>("1m");
  const { data, isLoading, error } = useRoutineProgress(routineId);

  if (isLoading) {
    return (
      <PageContainer className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </PageContainer>
    );
  }

  if (error || !data) {
    return (
      <PageContainer className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-destructive">
            Failed to load progress data. Please try again.
          </p>
          <Link href="/progress">
            <motion.div
              whileHover={{ x: -3 }}
              className="mt-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Progress
            </motion.div>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const hasAnyData = data.exerciseProgress.some((ep) => ep.dataPoints.length > 0);

  return (
    <PageContainer className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <Link href="/progress">
          <motion.div
            whileHover={{ x: -3 }}
            className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Progress
          </motion.div>
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl font-bold text-foreground">
              {data.routine.name}
            </h1>
            {data.routine.description && (
              <p className="mt-1 text-muted-foreground">
                {data.routine.description}
              </p>
            )}
          </motion.div>

          {hasAnyData && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <TimeframeSelector value={timeframe} onChange={setTimeframe} />
            </motion.div>
          )}
        </div>
      </div>

      {!hasAnyData ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <TrendingUp className="h-16 w-16 text-muted-foreground/50" />
          </motion.div>
          <h3 className="mt-4 text-lg font-medium text-muted-foreground">
            No workout data yet
          </h3>
          <p className="mt-1 text-sm text-muted-foreground text-center px-5">
            Complete some workouts with this routine to see your progress
          </p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-8">
          {data.exerciseProgress.map((exercise, index) => (
            <motion.div
              key={exercise.exerciseId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ExerciseChart
                exerciseName={exercise.exerciseName}
                dataPoints={exercise.dataPoints}
                timeframe={timeframe}
              />
            </motion.div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
