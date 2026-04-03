import { motion } from "framer-motion";
import type { LearningWeight } from "@/lib/mock-data";
import { TrendingUp, TrendingDown } from "lucide-react";

interface LearningPanelProps {
  weights: LearningWeight[];
  typeStats: { cpu: number; disk: number; pod: number };
}

export function LearningPanel({ weights, typeStats }: LearningPanelProps) {
  return (
    <motion.div
      className="rounded-lg border border-border/60 bg-card/90 backdrop-blur-sm p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
    >
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
        <motion.div className="w-2 h-2 rounded-full bg-chart-5" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
        Learning System
      </h3>

      {/* Per-type stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "CPU", count: typeStats.cpu, color: "text-primary" },
          { label: "Disk", count: typeStats.disk, color: "text-status-amber" },
          { label: "Pod", count: typeStats.pod, color: "text-destructive" },
        ].map((s) => (
          <div key={s.label} className="text-center rounded bg-secondary/50 py-1.5">
            <div className={`text-lg font-bold font-display ${s.color}`}>{s.count}</div>
            <div className="text-[10px] text-muted-foreground uppercase">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {weights.map((w, i) => (
          <motion.div
            key={w.agent}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
            className="flex items-center gap-3"
          >
            <span className="text-sm text-foreground w-36 truncate">{w.agent}</span>
            <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-chart-5"
                initial={{ width: 0 }}
                animate={{ width: `${w.weight * 100 * 3}%` }}
                transition={{ delay: 1 + i * 0.15, duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <motion.span className="font-mono-code text-sm font-bold text-foreground w-12 text-right" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 + i * 0.1 }}>
              {(w.weight * 100).toFixed(0)}%
            </motion.span>
            <motion.div
              className={`flex items-center gap-0.5 text-xs w-16 ${w.change > 0 ? "text-status-resolved" : "text-destructive"}`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + i * 0.1 }}
            >
              {w.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span className="font-mono-code">{w.change > 0 ? "+" : ""}{(w.change * 100).toFixed(0)}%</span>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
