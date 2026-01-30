"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2 } from "lucide-react";
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
import { useCreateRoutine } from "@/hooks/use-routines";

export function CreateRoutineDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createRoutine = useCreateRoutine();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a routine name");
      return;
    }

    try {
      await createRoutine.mutateAsync({
        name: name.trim(),
        description: description.trim() || null,
      });
      toast.success("Routine created successfully");
      setName("");
      setDescription("");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create routine"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.button
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 275,
            damping: 15,
            delay: 0.2,
            ease: "easeInOut"
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-lg md:bottom-8"
        >
          <Plus className="h-6 w-6" />
        </motion.button>
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
                <DialogTitle>Create New Routine</DialogTitle>
                <DialogDescription>
                  Add a new workout routine to organize your exercises
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="routine-name">Name</Label>
                  <Input
                    id="routine-name"
                    placeholder="e.g., Upper Body, Leg Day"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={createRoutine.isPending}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="routine-description">
                    Description (optional)
                  </Label>
                  <Input
                    id="routine-description"
                    placeholder="Describe your routine..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={createRoutine.isPending}
                  />
                </div>

                <div className="mt-2 flex justify-end items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={createRoutine.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    disabled={createRoutine.isPending}
                  >
                    {createRoutine.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Routine"
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
