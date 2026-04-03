import { motion } from "framer-motion";
import { Zap, HardDrive, AlertTriangle } from "lucide-react";
import { useState } from "react";
import type { IncidentType } from "@/lib/mock-data";

interface SimulationTriggerProps {
  onTrigger: (type: IncidentType) => void;
}

const buttons = [
  {
    type: "cpu" as IncidentType,
    label: "Simulate CPU Spike",
    icon: Zap,
    glowClass: "glow-blue",
    borderColor: "border-primary/30",
    bgColor: "bg-primary/10",
    textColor: "text-primary",
    hoverBg: "hsl(212, 100%, 67%, 0.15)",
  },
  {
    type: "disk" as IncidentType,
    label: "Simulate Disk Alert",
    icon: HardDrive,
    glowClass: "glow-amber",
    borderColor: "border-status-amber/30",
    bgColor: "bg-status-amber/10",
    textColor: "text-status-amber",
    hoverBg: "hsl(38, 92%, 50%, 0.15)",
  },
  {
    type: "pod" as IncidentType,
    label: "Simulate Pod Failure",
    icon: AlertTriangle,
    glowClass: "glow-red",
    borderColor: "border-destructive/30",
    bgColor: "bg-destructive/10",
    textColor: "text-destructive",
    hoverBg: "hsl(2, 91%, 63%, 0.15)",
  },
];

export function SimulationTrigger({ onTrigger }: SimulationTriggerProps) {
  const [rippleIdx, setRippleIdx] = useState<number | null>(null);

  const handleClick = (type: IncidentType, idx: number) => {
    setRippleIdx(idx);
    onTrigger(type);
    setTimeout(() => setRippleIdx(null), 800);
  };

  return (
    <motion.div
      className="rounded-lg border border-border/60 bg-card/90 backdrop-blur-sm p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
    >
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Simulation Controls</h3>

      <div className="space-y-3">
        {buttons.map((btn, idx) => (
          <div key={btn.type} className="relative">
            {rippleIdx === idx && (
              <motion.div
                className={`absolute inset-0 rounded-lg border-2 ${btn.borderColor}`}
                initial={{ opacity: 0.8, scale: 1 }}
                animate={{ opacity: 0, scale: 1.3 }}
                transition={{ duration: 0.8 }}
              />
            )}

            <motion.button
              onClick={() => handleClick(btn.type, idx)}
              className={`relative group w-full py-3 rounded-lg ${btn.bgColor} border ${btn.borderColor} ${btn.textColor} font-display font-bold text-sm
                flex items-center justify-center gap-2 overflow-hidden ${btn.glowClass}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <btn.icon className="w-4 h-4" />
              <span className="relative z-10">{btn.label}</span>
            </motion.button>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-3">
        Each triggers a unique incident through the remediation pipeline
      </p>
    </motion.div>
  );
}
