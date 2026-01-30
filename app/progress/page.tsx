"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, Loader2, ChevronRight, Calendar } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import { useRoutines } from "@/hooks/use-routines";

export default function ProgressPage() {
  const { data: routines, isLoading, error } = useRoutines();

  return (
    <PageContainer className="mx-auto max-w-7xl px-4 py-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-foreground">Progress</h1>
        <p className="text-muted-foreground">
          Track your exercise progress over time
        </p>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-destructive">
            Failed to load routines. Please try again.
          </p>
        </div>
      ) : !routines || routines.length === 0 ? (
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
            No routines yet
          </h3>
          <p className="mt-1 text-sm text-muted-foreground text-center px-5">
            Create a routine and complete some workouts to see your progress
          </p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-4">
          {routines.map((routine, index) => {
            const createdDate = new Date(routine.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <motion.div
                key={routine.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link href={`/progress/${routine.id}`}>
                  <Card className="group cursor-pointer border-border transition-all hover:border-secondary hover:shadow-md">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20"
                          >
                            <TrendingUp className="h-5 w-5 text-secondary" />
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
                        <Calendar className="h-3 w-3 mb-0.5" />
                        <span>Created {createdDate}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
