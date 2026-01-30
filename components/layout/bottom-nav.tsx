"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, User, History, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/use-user";

const navLinks = [
  { href: "/", label: "Routines", icon: Home },
  { href: "/history", label: "History", icon: History },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) return null;

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 rounded-full bg-black/10 shadow-lg backdrop-blur-sm md:hidden">
      <div className="flex h-14 items-center justify-around">
        {navLinks.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/" && pathname.startsWith(link.href));
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-1 items-center justify-center"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "flex items-center justify-center rounded-full p-3",
                  isActive ? "text-secondary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-6 w-6" />
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
