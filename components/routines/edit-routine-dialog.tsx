"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/shadcn-ui/button";
import { Input } from "@/components/shadcn-ui/input";
import { Label } from "@/components/shadcn-ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn-ui/dialog";
import { useUpdateRoutine, useDeleteRoutine } from "@/hooks/use-routines";
import type { Routine } from "@/lib/api/routines";

interface EditRoutineDialogProps {
  routine: Routine;
  onDeleted?: () => void;
}

function EditRoutineForm({
  routine,
  onClose,
  onDeleted,
}: {
  routine: Routine;
  onClose: () => void;
  onDeleted?: () => void;
}) {
  const [name, setName] = useState(routine.name);
  const [description, setDescription] = useState(routine.description ?? "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const updateRoutine = useUpdateRoutine();
  const deleteRoutine = useDeleteRoutine();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a routine name");
      return;
    }

    try {
      await updateRoutine.mutateAsync({
        id: routine.id,
        payload: {
          name: name.trim(),
          description: description.trim() || null,
        },
      });
      toast.success("Routine updated successfully");
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update routine"
      );
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRoutine.mutateAsync(routine.id);
      toast.success("Routine deleted successfully");
      onClose();
      onDeleted?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete routine"
      );
    }
  };

  if (showDeleteConfirm) {
    return (
      <div className="mt-4 flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete this routine?
          <br />
          This action cannot be undone and all exercises in this routine will be deleted.
        </p>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={deleteRoutine.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteRoutine.isPending}
          >
            {deleteRoutine.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Routine"
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="edit-routine-name">Name</Label>
        <Input
          id="edit-routine-name"
          placeholder="e.g., Upper Body, Leg Day"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={updateRoutine.isPending}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="edit-routine-description">Description (optional)</Label>
        <Input
          id="edit-routine-description"
          placeholder="Describe your routine..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={updateRoutine.isPending}
        />
      </div>

      <div className="mt-2 flex justify-between">
        <Button
          type="button"
          variant="destructive"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={updateRoutine.isPending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={updateRoutine.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            disabled={updateRoutine.isPending}
          >
            {updateRoutine.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

export function EditRoutineDialog({
  routine,
  onDeleted,
}: EditRoutineDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="outline" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        </motion.div>
      </DialogTrigger>
      <AnimatePresence>
        {open && (
          <DialogContent className="sm:max-w-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <DialogHeader>
                <DialogTitle>Edit Routine</DialogTitle>
                <DialogDescription>
                  Update your routine details or delete it
                </DialogDescription>
              </DialogHeader>
              <EditRoutineForm
                key={routine.id}
                routine={routine}
                onClose={() => setOpen(false)}
                onDeleted={onDeleted}
              />
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
