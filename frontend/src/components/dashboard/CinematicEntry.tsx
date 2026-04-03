import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface CinematicEntryProps {
  onComplete: () => void;
}

export function CinematicEntry({ onComplete }: CinematicEntryProps) {
  const [phase, setPhase] = useState(0);
  const title = "AutoFlow — Autonomous Incident Engine";

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 2200);
    const t3 = setTimeout(() => onComplete(), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase < 3 && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Grid behind */}
          <div className="absolute inset-0 grid-overlay opacity-20" />

          {/* Glow center */}
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full"
            style={{ background: "radial-gradient(circle, hsl(212 100% 67% / 0.1) 0%, transparent 70%)" }}
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          <div className="relative z-10 text-center">
            {/* Typewriter title */}
            {phase >= 1 && (
              <motion.h1
                className="font-display text-3xl md:text-5xl font-bold tracking-tight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {title.split("").map((char, i) => (
                  <motion.span
                    key={i}
                    className={char === "—" ? "text-primary" : "text-foreground"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04, duration: 0.1 }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.h1>
            )}

            {/* Subtitle */}
            {phase >= 2 && (
              <motion.p
                className="mt-4 text-muted-foreground text-lg font-mono-code"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Initializing incident engine...
              </motion.p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
