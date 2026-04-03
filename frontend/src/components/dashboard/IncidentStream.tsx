import { motion } from "framer-motion";
import type { Incident } from "@/lib/mock-data";
import { IncidentCard } from "./IncidentCard";

interface IncidentStreamProps {
  incidents: Incident[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function IncidentStream({ incidents, selectedId, onSelect }: IncidentStreamProps) {
  return (
    <motion.div
      className="rounded-lg border border-border/60 bg-card/40 backdrop-blur-sm p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <motion.div
          className="w-2 h-2 rounded-full bg-destructive"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Live Incident Stream</h2>
        <span className="ml-auto text-xs font-mono-code text-muted-foreground">{incidents.length} active</span>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        {incidents.map((inc, i) => (
          <IncidentCard
            key={inc.id}
            incident={inc}
            index={i}
            isSelected={selectedId === inc.id}
            onClick={() => onSelect(inc.id)}
          />
        ))}
      </div>
    </motion.div>
  );
}
