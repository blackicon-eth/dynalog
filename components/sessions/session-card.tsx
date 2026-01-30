"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, CheckCircle, PlayCircle, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn-ui/card";
import { Badge } from "@/components/shadcn-ui/badge";
import { Button } from "@/components/shadcn-ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn-ui/dialog";
import { useDeleteSession } from "@/hooks/use-sessions";
import type { WorkoutSession } from "@/lib/api/sessions";

interface SessionCardProps {
  session: WorkoutSession;
  routineName?: string;
  index: number;
}

export function SessionCard({ session, routineName, index }: SessionCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteSession = useDeleteSession();

  const startedDate = new Date(session.startedAt);
  const isCompleted = !!session.completedAt;
  const completedDate = session.completedAt
    ? new Date(session.completedAt)
    : null;

  const handleDelete = async () => {
    try {
      await deleteSession.mutateAsync(session.id);
      toast.success("Workout deleted");
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete workout"
      );
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDuration = () => {
    if (!completedDate) return null;
    const diffMs = completedDate.getTime() - startedDate.getTime();
    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Link href={`/sessions/${session.id}`}>
          <Card className="cursor-pointer border-border transition-all hover:border-secondary hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/20"
                  >
                    <Clock className="h-5 w-5 text-secondary" />
                  </motion.div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {routineName || "Workout Session"}
                    {session.notes && (
                      <p className="mt-1 line-clamp-2 text-xs font-normal text-muted-foreground italic">
                        &quot;{session.notes}&quot;
                      </p>
                    )}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={isCompleted ? "default" : "secondary"}
                    className={
                      isCompleted
                        ? "bg-green-500/20 text-green-400"
                        : "bg-secondary/20 text-secondary"
                    }
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Completed
                      </>
                    ) : (
                      <>
                        <PlayCircle className="mr-1 h-3 w-3" />
                        In Progress
                      </>
                    )}
                  </Badge>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowDeleteDialog(true);
                    }}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <div className="flex gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(startedDate)}
                </div>
                <span className="text-muted-foreground">·</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatTime(startedDate)}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {getDuration() && `Duration: ${getDuration()}`}
              </p>
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workout</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this workout? All logged sets will
              be permanently deleted and this action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteSession.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteSession.isPending}
              variant="destructive"
              className="gap-2"
            >
              {deleteSession.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
