"use client";

import { motion } from "framer-motion";

import { TRANSITION_BASE } from "@/lib/motion";

/** Wraps route content so every navigation gets a subtle fade/rise instead of a hard cut. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={TRANSITION_BASE}
    >
      {children}
    </motion.div>
  );
}
