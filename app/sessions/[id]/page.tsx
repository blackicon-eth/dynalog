"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, CheckCircle, Clock, Trophy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/shadcn-ui/button";
import { Input } from "@/components/shadcn-ui/input";
import { Label } from "@/components/shadcn-ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn-ui/dialog";
import { PageContainer } from "@/components/layout/page-container";
import { ActiveSession } from "@/components/sessions/active-session";
import { useSession, useCompleteSession, useDeleteSession } from "@/hooks/use-sessions";
import { useRoutine } from "@/hooks/use-routines";

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

export default function SessionPage({ params }: SessionPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [notes, setNotes] = useState("");

  const { data: session, isLoading, error } = useSession(id);
  const { data: routine } = useRoutine(session?.routineId ?? "");
  const completeSession = useCompleteSession();
  const deleteSessionMutation = useDeleteSession();

  const handleComplete = async () => {
    try {
      await completeSession.mutateAsync({
        id,
        payload: { notes: notes.trim() || undefined },
      });
      toast.success("Workout completed! Great job!");
      setShowCompleteDialog(false);
      router.push("/history");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to complete session"
      );
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSessionMutation.mutateAsync(id);
      toast.success("Workout cancelled");
      setShowDeleteDialog(false);
      router.push("/");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete session"
      );
    }
  };

  if (isLoading) {
    return (
      <PageContainer className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </PageContainer>
    );
  }

  if (error || !session) {
    return (
      <PageContainer className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-destructive">
            Failed to load session. Please try again.
          </p>
          <Link href="/">
            <Button variant="outline" className="mt-4">
              Go Back
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const isCompleted = !!session.completedAt;
  const completedLogs = session.logs.filter((l) => l.completed).length;
  const totalSets = routine?.exercises.reduce((sum, e) => sum + e.series, 0) ?? 0;
  const progress = totalSets > 0 ? Math.round((completedLogs / totalSets) * 100) : 0;

  return (
    <PageContainer className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6">
        <Link href={isCompleted ? "/history" : "/"}>
          <motion.div
            whileHover={{ x: -3 }}
            className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {isCompleted ? "Back to History" : "Back to Routines"}
          </motion.div>
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <Trophy className="h-6 w-6 text-secondary" />
              ) : (
                <Clock className="h-6 w-6 text-secondary" />
              )}
              <h1 className="text-2xl font-bold text-foreground">
                {isCompleted ? "Workout Complete" : "Active Workout"}
              </h1>
            </div>
            <p className="mt-1 text-muted-foreground">
              {routine?.name ?? "Workout Session"}
            </p>
          </motion.div>

          {!isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold text-foreground">
                  {progress}%
                </p>
              </div>
              <div className="flex items-center gap-2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => setShowCompleteDialog(true)}
                    className="gap-2 bg-green-600 text-white hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Finish Workout
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => setShowDeleteDialog(true)}
                    variant="outline"
                    className="gap-2 border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                    Cancel
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Progress bar */}
        {!isCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-secondary"
            />
          </motion.div>
        )}
      </div>

      {routine && (
        <ActiveSession
          sessionId={id}
          exercises={routine.exercises}
          logs={session.logs}
          readOnly={isCompleted}
        />
      )}

      {/* Completion notes */}
      {isCompleted && session.notes && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-lg border border-border bg-muted/50 p-4"
        >
          <h3 className="mb-2 font-semibold text-foreground">Session Notes</h3>
          <p className="text-muted-foreground">{session.notes}</p>
        </motion.div>
      )}

      {/* Complete Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Workout</DialogTitle>
            <DialogDescription>
              Add any notes about your session (optional)
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                placeholder="How did the workout go?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCompleteDialog(false)}
                disabled={completeSession.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleComplete}
                disabled={completeSession.isPending}
                className="gap-2 bg-green-600 text-white hover:bg-green-700"
              >
                {completeSession.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Complete
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Workout</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this workout? All logged sets will
              be deleted and this action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteSessionMutation.isPending}
            >
              Keep Workout
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteSessionMutation.isPending}
              variant="destructive"
              className="gap-2"
            >
              {deleteSessionMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Cancel Workout
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
