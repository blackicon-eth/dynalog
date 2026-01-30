"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/shadcn-ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn-ui/dialog";
import { ExerciseCard } from "./exercise-card";
import { ExerciseDialog } from "./exercise-dialog";
import type { Exercise } from "@/lib/api/routines";
import { useDeleteExercise } from "@/hooks/use-exercises";

interface ExerciseListProps {
  exercises: Exercise[];
  routineId: string;
}

export function ExerciseList({ exercises, routineId }: ExerciseListProps) {
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteExercise = useDeleteExercise();

  const handleDelete = async () => {
    if (!exerciseToDelete) return;

    setIsDeleting(true);

    try {
      await deleteExercise.mutateAsync({
        id: exerciseToDelete.id,
        routineId,
      });
      toast.success("Exercise deleted");
      setExerciseToDelete(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete exercise"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (exercises.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Dumbbell className="h-12 w-12 text-muted-foreground/50" />
        </motion.div>
        <h3 className="mt-4 text-lg font-medium text-muted-foreground">
          No exercises yet
        </h3>
        <p className="mt-1 text-sm text-muted-foreground text-center px-5">
          Add your first exercise to this routine
        </p>
      </motion.div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {exercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              index={index}
              onEdit={() => setEditingExercise(exercise)}
              onDelete={() => setExerciseToDelete(exercise)}
            />
          ))}
        </AnimatePresence>
      </div>

      {editingExercise && (
        <ExerciseDialog
          routineId={routineId}
          exercise={editingExercise}
          open={!!editingExercise}
          onOpenChange={(open) => !open && setEditingExercise(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!exerciseToDelete}
        onOpenChange={(open) => !open && setExerciseToDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Exercise</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{exerciseToDelete?.name}&quot;?
              <br />
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setExerciseToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
