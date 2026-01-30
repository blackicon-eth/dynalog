"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Weight, RefreshCw, Clock, Pencil, GripVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import { Button } from "@/components/shadcn-ui/button";
import { Badge } from "@/components/shadcn-ui/badge";
import type { Exercise } from "@/lib/api/routines";

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  onEdit: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  isDragging?: boolean;
}

export const ExerciseCard = forwardRef<HTMLDivElement, ExerciseCardProps>(function ExerciseCard({
  exercise,
  index,
  onEdit,
  dragHandleProps,
  isDragging,
}, ref) {
  const formatRestTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (val: number) => val.toString().padStart(2, "0");

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      layout
    >
      <Card className={`border-border transition-all hover:border-secondary/50 ${isDragging ? "shadow-lg ring-2 ring-secondary" : ""}`}>
        <CardHeader className="block overflow-hidden">
          <div className="flex w-full items-center gap-2">
            <button
              {...dragHandleProps}
              className="shrink-0 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
            >
              <GripVertical className="h-5 w-5" />
            </button>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-sm font-bold text-secondary">
              {index + 1}
            </div>
            <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold text-foreground">
              {exercise.name}
            </span>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onEdit}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground italic">
            {exercise.description || "No description provided"}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1 text-xs">
              <Weight className="h-3 w-3" />
              {exercise.weight} kg
            </Badge>
            <Badge variant="secondary" className="gap-1 text-xs">
              <RefreshCw className="h-3 w-3" />
              {exercise.series} x {exercise.reps}
            </Badge>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Clock className="h-3 w-3" />
              {formatRestTime(exercise.restTime)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
