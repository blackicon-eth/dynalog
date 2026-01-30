"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Play, Dumbbell } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/shadcn-ui/button";
import { PageContainer } from "@/components/layout/page-container";
import { EditRoutineDialog } from "@/components/routines/edit-routine-dialog";
import { ExerciseList } from "@/components/exercises/exercise-list";
import { ExerciseDialog } from "@/components/exercises/exercise-dialog";
import { useRoutine } from "@/hooks/use-routines";
import { useCreateSession } from "@/hooks/use-sessions";

interface RoutinePageProps {
  params: Promise<{ id: string }>;
}

export default function RoutinePage({ params }: RoutinePageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: routine, isLoading, error } = useRoutine(id);
  const createSession = useCreateSession();

  // The number of exercises in this routine
  const numberOfExercises = routine?.exercises.length ?? 0;

  const handleStartWorkout = async () => {
    if (!routine || routine.exercises.length === 0) {
      toast.error("Add at least one exercise to start a workout");
      return;
    }

    try {
      const { session } = await createSession.mutateAsync({ routineId: id });
      router.push(`/sessions/${session.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to start workout"
      );
    }
  };

  if (isLoading) {
    return (
      <PageContainer className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </PageContainer>
    );
  }

  if (error || !routine) {
    return (
      <PageContainer className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-destructive">
            Failed to load routine. Please try again.
          </p>
          <Link href="/">
            <Button variant="outline" className="mt-4">
              Go Back
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <Link href="/">
          <motion.div
            whileHover={{ x: -3 }}
            className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Routines
          </motion.div>
        </Link>

        <div className="flex flex-col gap-7 sm:flex-row sm:items-start sm:justify-between">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-start w-full"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/20">
                <Dumbbell className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {routine.name}
                </h1>
                {routine.description && (
                  <p className="mt-1 text-muted-foreground">
                    {routine.description}
                  </p>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {numberOfExercises === 0 ? "No exercises yet" :
                numberOfExercises === 1 ? `${numberOfExercises} exercise` : `${numberOfExercises} exercises`}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2"
          >
            <EditRoutineDialog
              routine={routine}
              onDeleted={() => router.push("/")}
            />
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleStartWorkout}
                disabled={createSession.isPending || routine.exercises.length === 0}
                className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                {createSession.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Start Workout
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-4 flex items-center justify-between"
      >
        <h2 className="text-lg font-semibold text-foreground">Exercises</h2>
        <ExerciseDialog routineId={id} />
      </motion.div>

      <ExerciseList exercises={routine.exercises} routineId={id} />
    </PageContainer>
  );
}
