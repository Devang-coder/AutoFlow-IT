import { motion } from "framer-motion";
import type { IncidentType } from "@/lib/mock-data";

interface GridBackgroundProps {
  pulseType?: IncidentType | null;
}

const pulseColors = {
  cpu: "hsl(212 100% 67% / 0.08)",
  disk: "hsl(38 92% 50% / 0.08)",
  pod: "hsl(2 91% 63% / 0.08)",
};

export function GridBackground({ pulseType }: GridBackgroundProps) {
  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none z-0 ${pulseType === "pod" ? "animate-shake" : ""}`}>
      <div className="absolute inset-0 grid-overlay opacity-40" />

      {/* Ambient glow spots */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, hsl(212 100% 67% / 0.04) 0%, transparent 70%)" }}
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, hsl(270 70% 71% / 0.03) 0%, transparent 70%)" }}
        animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Pulse overlay on simulation */}
      {pulseType && (
        <motion.div
          className="absolute inset-0"
          style={{ background: `radial-gradient(circle at center, ${pulseColors[pulseType]} 0%, transparent 60%)` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          key={Date.now()}
        />
      )}

      <div className="noise-texture absolute inset-0" />
    </div>
  );
}
