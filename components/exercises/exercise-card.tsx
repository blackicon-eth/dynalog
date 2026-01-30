"use client";

import { motion } from "framer-motion";
import { Weight, RefreshCw, Clock, Trash2, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import { Button } from "@/components/shadcn-ui/button";
import { Badge } from "@/components/shadcn-ui/badge";
import type { Exercise } from "@/lib/api/routines";

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

export function ExerciseCard({
  exercise,
  index,
  onEdit,
  onDelete,
}: ExerciseCardProps) {
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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      layout
    >
      <Card className="border-border transition-all hover:border-secondary/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/20 text-sm font-bold text-secondary">
                {index + 1}
              </div>
              <CardTitle className="text-base font-semibold text-foreground">
                {exercise.name}
              </CardTitle>
            </div>
            <div className="flex gap-1">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onEdit}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {exercise.description && (
            <p className="mb-3 text-sm text-muted-foreground">
              {exercise.description}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <Weight className="h-3 w-3" />
              {exercise.weight} kg
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <RefreshCw className="h-3 w-3" />
              {exercise.series} x {exercise.reps}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              {formatRestTime(exercise.restTime)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
