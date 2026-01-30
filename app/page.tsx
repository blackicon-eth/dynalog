"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { RoutineList } from "@/components/routines/routine-list";
import { CreateRoutineDialog } from "@/components/routines/create-routine-dialog";
import { useRoutines } from "@/hooks/use-routines";
import { useUser } from "@/hooks/use-user";

export default function HomePage() {
  const { user } = useUser();
  const { data: routines, isLoading, error } = useRoutines();

  return (
    <>
      <PageContainer className="mx-auto max-w-7xl px-4 py-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 flex flex-col gap-4"
        >
          <h1 className="text-4xl font-bold leading-[1.35] text-foreground">
            Welcome back,<br />
            <span className="text-secondary">{user?.name?.split(" ")[0]}</span>
          </h1>
          <p className="text-muted-foreground">
            Manage your workout routines
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
        ) : (
          <RoutineList routines={routines ?? []} />
        )}
      </PageContainer>

      <CreateRoutineDialog />
    </>
  );
}
