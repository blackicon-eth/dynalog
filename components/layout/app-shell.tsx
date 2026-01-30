"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { TopBar } from "./top-bar";
import { BottomNav } from "./bottom-nav";
import { LoadingScreen } from "./loading-screen";
import { useUser } from "@/hooks/use-user";

interface AppShellProps {
  children: ReactNode;
}

const publicPaths = ["/auth"];

export function AppShell({ children }: AppShellProps) {
  const { isLoading, isAuthenticated } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isPublicPath) {
        router.push("/auth");
      } else if (isAuthenticated && isPublicPath) {
        router.push("/");
      }
    }
  }, [isLoading, isAuthenticated, isPublicPath, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show auth pages without shell
  if (isPublicPath && !isAuthenticated) {
    return <>{children}</>;
  }

  // Show loading while redirecting
  if (!isAuthenticated && !isPublicPath) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(#00000009_1px,transparent_1px)] bg-size-[16px_16px]">
      <TopBar />
      <div className="flex-1 pb-20 md:pb-0">
        <AnimatePresence mode="wait">{children}</AnimatePresence>
      </div>
      <BottomNav />
    </div>
  );
}
