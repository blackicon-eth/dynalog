"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, X, CheckCheck, Pencil, Timer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/shadcn-ui/button";
import { Input } from "@/components/shadcn-ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import { Badge } from "@/components/shadcn-ui/badge";
import { useCreateLog, useUpdateLog } from "@/hooks/use-sessions";
import type { Exercise } from "@/lib/api/routines";
import type { ExerciseLog } from "@/lib/api/sessions";

function formatRestTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

interface ActiveSessionProps {
  sessionId: string;
  exercises: Exercise[];
  logs: ExerciseLog[];
  readOnly?: boolean;
}

interface SetLogFormProps {
  sessionId: string;
  exercise: Exercise;
  setNumber: number;
  existingLog?: ExerciseLog;
  readOnly?: boolean;
}

function SetLogForm({
  sessionId,
  exercise,
  setNumber,
  existingLog,
  readOnly,
}: SetLogFormProps) {
  const [weight, setWeight] = useState(
    existingLog?.weight?.toString() ?? exercise.weight.toString()
  );
  const [reps, setReps] = useState(
    existingLog?.reps?.toString() ?? exercise.reps.toString()
  );
  const [isEditing, setIsEditing] = useState(false);
  const createLog = useCreateLog();
  const updateLog = useUpdateLog();

  const handleLog = async () => {
    try {
      if (existingLog) {
        // Update existing log
        await updateLog.mutateAsync({
          id: existingLog.id,
          sessionId,
          payload: {
            weight: parseFloat(weight) || 0,
            reps: parseInt(reps) || 0,
            completed: true,
          },
        });
        toast.success(`Set ${setNumber} updated`);
      } else {
        // Create new log
        await createLog.mutateAsync({
          sessionId,
          exerciseId: exercise.id,
          setNumber,
          weight: parseFloat(weight) || 0,
          reps: parseInt(reps) || 0,
          completed: true,
        });
        toast.success(`Set ${setNumber} logged`);
      }
      setIsEditing(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to log set"
      );
    }
  };

  const isLogged = !!existingLog?.completed;
  const isDisabled = readOnly || (isLogged && !isEditing);
  const isPending = createLog.isPending || updateLog.isPending;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-2 rounded-lg border p-2 ${isLogged && !isEditing
        ? "border-green-500/30 bg-green-500/10"
        : isEditing
          ? "border-secondary/50 bg-secondary/5"
          : "border-border"
        }`}
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">
        {setNumber}
      </div>
      <div className="flex flex-1 items-center gap-2">
        <div className="relative flex-1">
          <Input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="h-8 w-full pr-8 text-center text-sm"
            disabled={isDisabled}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            kg
          </span>
        </div>
        <X className="h-3 w-3 shrink-0 text-muted-foreground" />
        <div className="relative flex-1">
          <Input
            type="number"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="h-8 w-full pr-10 text-center text-sm"
            disabled={isDisabled}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            reps
          </span>
        </div>
      </div>
      {!readOnly && (
        isLogged && !isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
          >
            <Pencil className="h-3 w-3" />
          </Button>
        ) : (
          <Button
            onClick={handleLog}
            disabled={isPending}
            variant="default"
            size="icon"
            className="h-8 w-8 shrink-0 bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
        )
      )}
    </motion.div>
  );
}

interface ExerciseCardProps {
  sessionId: string;
  exercise: Exercise;
  exerciseIndex: number;
  exerciseLogs: ExerciseLog[];
  readOnly?: boolean;
}

function ExerciseCard({
  sessionId,
  exercise,
  exerciseIndex,
  exerciseLogs,
  readOnly,
}: ExerciseCardProps) {
  const createLog = useCreateLog();
  const [isCompletingAll, setIsCompletingAll] = useState(false);

  const completedSets = exerciseLogs.filter((l) => l.completed).length;
  const allCompleted = completedSets === exercise.series;

  const handleCompleteAll = async () => {
    setIsCompletingAll(true);
    try {
      const unloggedSets = Array.from(
        { length: exercise.series },
        (_, i) => i + 1
      ).filter(
        (setNumber) =>
          !exerciseLogs.find((l) => l.setNumber === setNumber && l.completed)
      );

      for (const setNumber of unloggedSets) {
        await createLog.mutateAsync({
          sessionId,
          exerciseId: exercise.id,
          setNumber,
          weight: exercise.weight,
          reps: exercise.reps,
          completed: true,
        });
      }
      toast.success(`${exercise.name} completed`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to complete exercise"
      );
    } finally {
      setIsCompletingAll(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: exerciseIndex * 0.1 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/20 text-lg font-bold text-secondary">
                {exerciseIndex + 1}
              </div>
              <div>
                <CardTitle className="text-lg">{exercise.name}</CardTitle>
                {exercise.description && (
                  <p className="text-sm text-muted-foreground">
                    {exercise.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2.5">
              <Badge
                variant={allCompleted ? "default" : "secondary"}
                className={allCompleted ? "bg-green-500/20 text-green-400" : ""}
              >
                {completedSets}/{exercise.series} sets
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Timer className="size-4 mb-1" />
                <span>{formatRestTime(exercise.restTime)}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {Array.from({ length: exercise.series }, (_, i) => i + 1).map(
            (setNumber) => {
              const existingLog = exerciseLogs.find(
                (l) => l.setNumber === setNumber
              );
              return (
                <SetLogForm
                  key={`${exercise.id}-${setNumber}`}
                  sessionId={sessionId}
                  exercise={exercise}
                  setNumber={setNumber}
                  existingLog={existingLog}
                  readOnly={readOnly}
                />
              );
            }
          )}
          {!allCompleted && !readOnly && (
            <Button
              onClick={handleCompleteAll}
              disabled={isCompletingAll}
              variant="outline"
              size="sm"
              className="mt-2 gap-2"
            >
              {isCompletingAll ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4" />
              )}
              Complete All Sets
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function ActiveSession({
  sessionId,
  exercises,
  logs,
  readOnly,
}: ActiveSessionProps) {
  const getLogsForExercise = (exerciseId: string) => {
    return logs.filter((log) => log.exerciseId === exerciseId);
  };

  return (
    <div className="flex flex-col gap-6">
      {exercises.map((exercise, exerciseIndex) => (
        <ExerciseCard
          key={exercise.id}
          sessionId={sessionId}
          exercise={exercise}
          exerciseIndex={exerciseIndex}
          exerciseLogs={getLogsForExercise(exercise.id)}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}
