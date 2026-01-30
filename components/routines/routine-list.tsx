"use client";

import { motion } from "framer-motion";
import { Dumbbell } from "lucide-react";
import { RoutineCard } from "./routine-card";
import type { Routine } from "@/lib/api/routines";

interface RoutineListProps {
  routines: Routine[];
}

export function RoutineList({ routines }: RoutineListProps) {
  if (routines.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Dumbbell className="h-16 w-16 text-muted-foreground/50" />
        </motion.div>
        <h3 className="mt-4 text-lg font-medium text-muted-foreground">
          No routines yet
        </h3>
        <p className="mt-1 text-sm text-muted-foreground text-center px-5">
          Create your first routine to get started
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {routines.map((routine, index) => (
        <RoutineCard key={routine.id} routine={routine} index={index} />
      ))}
    </div>
  );
}
