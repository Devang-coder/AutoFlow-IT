import { motion } from "framer-motion";
import { useRef, useEffect } from "react";
import type { ActivityLogEntry } from "@/lib/mock-data";

interface ActivityLogProps {
  entries: ActivityLogEntry[];
}

const levelColors: Record<string, string> = {
  DETECT: "text-primary",
  EVALUATE: "text-status-evaluating",
  ACTION: "text-status-remediating",
  RESOLVE: "text-status-resolved",
};

const typeIndicator: Record<string, string> = {
  cpu: "bg-primary",
  disk: "bg-status-amber",
  pod: "bg-destructive",
};

export function ActivityLog({ entries }: ActivityLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries.length]);

  return (
    <motion.div
      className="rounded-lg border border-border/60 bg-card/90 backdrop-blur-sm p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <motion.div
          className="w-2 h-2 rounded-full bg-status-resolved"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">System Activity</h3>
        <span className="ml-auto text-xs font-mono-code text-muted-foreground">{entries.length} events</span>
      </div>

      <div ref={scrollRef} className="max-h-[200px] overflow-y-auto space-y-1 font-mono-code text-xs">
        {entries.slice(-30).map((entry, i) => {
          const time = new Date(entry.timestamp).toLocaleTimeString("en-US", { hour12: false });
          return (
            <motion.div
              key={`${entry.timestamp}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-2 py-0.5"
            >
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${typeIndicator[entry.type]}`} />
              <span className="text-muted-foreground shrink-0">[{time}]</span>
              <span className={`shrink-0 font-bold ${levelColors[entry.level]}`}>[{entry.level}]</span>
              <span className="text-foreground/80">{entry.message}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
