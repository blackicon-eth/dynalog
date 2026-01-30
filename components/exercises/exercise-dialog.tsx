"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/shadcn-ui/button";
import { Input } from "@/components/shadcn-ui/input";
import { Label } from "@/components/shadcn-ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn-ui/dialog";
import { useCreateExercise, useUpdateExercise } from "@/hooks/use-exercises";
import type { Exercise } from "@/lib/api/routines";

interface ExerciseDialogProps {
  routineId: string;
  exercise?: Exercise;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

function ExerciseForm({
  routineId,
  exercise,
  onClose,
}: {
  routineId: string;
  exercise?: Exercise;
  onClose: () => void;
}) {
  const [name, setName] = useState(exercise?.name ?? "");
  const [description, setDescription] = useState(exercise?.description ?? "");
  const [weight, setWeight] = useState(String(exercise?.weight ?? 0));
  const [series, setSeries] = useState(String(exercise?.series ?? 3));
  const [reps, setReps] = useState(String(exercise?.reps ?? 8));
  const [restTime, setRestTime] = useState(String(exercise?.restTime ?? 90));

  const createExercise = useCreateExercise();
  const updateExercise = useUpdateExercise();
  const isEditing = !!exercise;
  const isPending = createExercise.isPending || updateExercise.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter an exercise name");
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      weight: parseFloat(weight) || 0,
      series: parseInt(series) || 3,
      reps: parseInt(reps) || 10,
      restTime: parseInt(restTime) || 60,
    };

    try {
      if (isEditing && exercise) {
        await updateExercise.mutateAsync({
          id: exercise.id,
          routineId,
          payload,
        });
        toast.success("Exercise updated successfully");
      } else {
        await createExercise.mutateAsync({
          routineId,
          ...payload,
        });
        toast.success("Exercise added successfully");
      }
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${isEditing ? "update" : "create"} exercise`
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="exercise-name">Name</Label>
        <Input
          id="exercise-name"
          placeholder="e.g., Bench Press, Squats"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="exercise-description">Description (optional)</Label>
        <Input
          id="exercise-description"
          placeholder="Any notes about form or technique..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="exercise-weight">Weight (kg)</Label>
          <Input
            id="exercise-weight"
            type="number"
            min="0"
            step="0.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="exercise-rest">Rest (seconds)</Label>
          <Input
            id="exercise-rest"
            type="number"
            min="0"
            step="5"
            value={restTime}
            onChange={(e) => setRestTime(e.target.value)}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="exercise-series">Sets</Label>
          <Input
            id="exercise-series"
            type="number"
            min="1"
            value={series}
            onChange={(e) => setSeries(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="exercise-reps">Reps</Label>
          <Input
            id="exercise-reps"
            type="number"
            min="1"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Saving..." : "Adding..."}
            </>
          ) : isEditing ? (
            "Save Changes"
          ) : (
            "Add Exercise"
          )}
        </Button>
      </div>
    </form>
  );
}

export function ExerciseDialog({
  routineId,
  exercise,
  open: controlledOpen,
  onOpenChange,
  trigger,
}: ExerciseDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const isEditing = !!exercise;

  const defaultTrigger = (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90">
        <Plus className="h-4 w-4" />
        Add Exercise
      </Button>
    </motion.div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== undefined ? (
        trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>{defaultTrigger}</DialogTrigger>
      )}
      <AnimatePresence>
        {open && (
          <DialogContent className="sm:max-w-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Edit Exercise" : "Add Exercise"}
                </DialogTitle>
                <DialogDescription>
                  {isEditing
                    ? "Update the exercise details"
                    : "Add a new exercise to your routine"}
                </DialogDescription>
              </DialogHeader>
              <ExerciseForm
                key={exercise?.id ?? "new"}
                routineId={routineId}
                exercise={exercise}
                onClose={() => setOpen(false)}
              />
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
