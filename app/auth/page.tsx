"use client";

import { motion } from "framer-motion";
import { Dumbbell } from "lucide-react";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function AuthPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-8 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Dumbbell className="h-16 w-16 text-secondary" />
        </motion.div>
        <h1 className="text-3xl font-bold text-foreground">Dynalog</h1>
        <p className="text-muted-foreground">Track your gym progress</p>
      </motion.div>

      <SignInForm />
    </div>
  );
}
