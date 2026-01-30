"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, Pencil, Loader2, Ban } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/shadcn-ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn-ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn-ui/dialog";
import { Separator } from "@/components/shadcn-ui/separator";
import { PageContainer } from "@/components/layout/page-container";
import { ProfileForm } from "@/components/profile/profile-form";
import { StatsCard } from "@/components/profile/stats-card";
import { useUser, useUpdateUser } from "@/hooks/use-user";

const avatarOptions = ["0", "1", "2", "3", "4", "5", "6"];

export default function ProfilePage() {
  const { user, signOut } = useUser();
  const updateUser = useUpdateUser();
  const router = useRouter();
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [updatingAvatar, setUpdatingAvatar] = useState<string | null>(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/auth");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const handleAvatarSelect = async (avatarId: string) => {
    const currentAvatar = user?.avatar || "";
    if (avatarId === currentAvatar) {
      return;
    }

    setUpdatingAvatar(avatarId);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await updateUser.mutateAsync({ avatar: avatarId || null });
      setAvatarDialogOpen(false);
      toast.success("Avatar updated");
    } catch {
      toast.error("Failed to update avatar");
    } finally {
      setUpdatingAvatar(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <PageContainer className="mx-auto max-w-3xl px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-4"
      >
        <button
          onClick={() => setAvatarDialogOpen(true)}
          className="group relative shrink-0"
        >
          <Avatar className="h-16 w-16 border-2 border-secondary transition-opacity group-hover:opacity-80">
            <AvatarImage
              src={user?.avatar ? `/avatars/${user.avatar}.png` : undefined}
              alt={user?.name}
            />
            <AvatarFallback className="bg-secondary/20 text-lg font-bold text-foreground">
              {user?.name ? getInitials(user.name) : <User className="h-6 w-6" />}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Pencil className="h-5 w-5 text-white" />
          </div>
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex w-full items-center justify-between gap-2">
            <h1 className="text-3xl font-bold text-foreground">
              {user?.name}
            </h1>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                className="h-6 gap-1 text-[0.6rem] text-destructive hover:bg-destructive hover:text-white"
                onClick={handleSignOut}
              >
                <LogOut className="size-3" />
                Logout
              </Button>
            </motion.div>
          </div>
          <p className="text-muted-foreground text-xs">{user?.email}</p>
        </div>
      </motion.div>

      <div className="flex flex-col gap-6">
        <StatsCard />
        <Separator />
        <ProfileForm />
      </div>

      {/* Avatar Selection Dialog */}
      <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose your avatar</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-3 py-4">
            {avatarOptions.map((avatarId) => (
              <motion.button
                key={avatarId}
                onClick={() => handleAvatarSelect(avatarId)}
                disabled={updateUser.isPending}
                animate={{
                  opacity: updatingAvatar !== null && updatingAvatar !== avatarId ? 0.3 : 1,
                }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-full border-2",
                  user?.avatar === avatarId
                    ? "border-secondary ring-2 ring-secondary/30"
                    : "border-transparent hover:border-muted-foreground/50"
                )}
              >
                <Image
                  src={`/avatars/${avatarId}.png`}
                  alt={`Avatar ${avatarId}`}
                  fill
                  className="object-cover"
                />
                <AnimatePresence>
                  {updatingAvatar === avatarId && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full"
                    >
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
            {/* No avatar option */}
            <motion.button
              onClick={() => handleAvatarSelect("")}
              disabled={updateUser.isPending}
              animate={{
                opacity: updatingAvatar !== null && updatingAvatar !== "" ? 0.3 : 1,
              }}
              transition={{ duration: 0.2 }}
              className={cn(
                "relative aspect-square overflow-hidden rounded-full border-2 bg-muted flex items-center justify-center",
                !user?.avatar
                  ? "border-secondary ring-2 ring-secondary/30"
                  : "border-transparent hover:border-muted-foreground/50"
              )}
            >
              <Ban className="h-8 w-8 text-muted-foreground" />
              <AnimatePresence>
                {updatingAvatar === "" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full"
                  >
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
