"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableExerciseCard } from "./sortable-exercise-card";
import { ExerciseDialog } from "./exercise-dialog";
import type { Exercise } from "@/lib/api/routines";
import { useReorderExercises } from "@/hooks/use-exercises";

interface ExerciseListProps {
  exercises: Exercise[];
  routineId: string;
}

export function ExerciseList({ exercises, routineId }: ExerciseListProps) {
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [localExercises, setLocalExercises] = useState<Exercise[]>(exercises);
  const reorderExercises = useReorderExercises();

  // Keep local state in sync with props
  useEffect(() => {
    setLocalExercises(exercises);
  }, [exercises]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localExercises.findIndex((e) => e.id === active.id);
      const newIndex = localExercises.findIndex((e) => e.id === over.id);

      const newOrder = arrayMove(localExercises, oldIndex, newIndex);
      setLocalExercises(newOrder);

      try {
        await reorderExercises.mutateAsync({
          routineId,
          exerciseIds: newOrder.map((e) => e.id),
        });
      } catch (error) {
        // Revert on error
        setLocalExercises(exercises);
        toast.error("Failed to reorder exercises");
      }
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localExercises.map((e) => e.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {localExercises.map((exercise, index) => (
                <SortableExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  index={index}
                  onEdit={() => setEditingExercise(exercise)}
                />
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>

      {editingExercise && (
        <ExerciseDialog
          routineId={routineId}
          exercise={editingExercise}
          open={!!editingExercise}
          onOpenChange={(open) => !open && setEditingExercise(null)}
        />
      )}
    </>
  );
}
