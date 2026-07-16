import type { Transition, Variants } from "framer-motion";

/** Signature easing curve — reused by every hand-authored animation so motion feels like one system. */
export const EASE_BRAND: Transition["ease"] = [0.16, 1, 0.3, 1];

export const TRANSITION_BASE: Transition = { duration: 0.3, ease: EASE_BRAND };
export const TRANSITION_SLOW: Transition = { duration: 0.5, ease: EASE_BRAND };

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: TRANSITION_SLOW },
};

export const staggerChildren: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/** Cards lift slightly on hover — used by RideCard-style tiles across the app. */
export const hoverLift = {
  whileHover: { y: -4, transition: TRANSITION_BASE },
  whileTap: { y: 0, scale: 0.99 },
};
