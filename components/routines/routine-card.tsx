"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, Dumbbell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import type { Routine } from "@/lib/api/routines";

interface RoutineCardProps {
  routine: Routine;
  index: number;
}

export function RoutineCard({ routine, index }: RoutineCardProps) {
  const createdDate = new Date(routine.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Link href={`/routines/${routine.id}`}>
        <Card className="group cursor-pointer border-border transition-all hover:border-secondary hover:shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20"
                >
                  <Dumbbell className="h-5 w-5 text-secondary" />
                </motion.div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  {routine.name}
                </CardTitle>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {routine.description && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {routine.description}
              </p>
            )}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mb-1" />
              <span>Created {createdDate}</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
