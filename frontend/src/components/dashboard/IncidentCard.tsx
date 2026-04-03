import { motion } from "framer-motion";
import type { Incident } from "@/lib/mock-data";
import { Activity, HardDrive, AlertTriangle } from "lucide-react";

interface IncidentCardProps {
  incident: Incident;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

const statusColors: Record<string, string> = {
  detected: "bg-status-detected",
  evaluating: "bg-status-evaluating",
  remediating: "bg-status-remediating",
  resolved: "bg-status-resolved",
};

const severityBorder: Record<string, string> = {
  critical: "border-l-destructive glow-red",
  warning: "border-l-status-amber glow-amber",
  info: "border-l-primary glow-blue",
};

const typeIcons = {
  cpu: Activity,
  disk: HardDrive,
  pod: AlertTriangle,
};

const typeBadgeColors = {
  cpu: "bg-primary/20 text-primary",
  disk: "bg-status-amber/20 text-status-amber",
  pod: "bg-destructive/20 text-destructive",
};

const typeLabels = { cpu: "CPU", disk: "DISK", pod: "POD" };

export function IncidentCard({ incident, index, isSelected, onClick }: IncidentCardProps) {
  const TypeIcon = typeIcons[incident.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, rotateY: -5 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.01, x: 4 }}
      onClick={onClick}
      className={`
        relative cursor-pointer rounded-lg border border-border/60 bg-card/90 backdrop-blur-sm
        border-l-4 ${severityBorder[incident.severity]}
        ${isSelected ? "ring-1 ring-primary/50" : ""}
        transition-colors
      `}
    >
      {incident.status !== "resolved" && (
        <motion.div
          className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary"
          animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <TypeIcon className="w-4 h-4 text-muted-foreground" />
            <div>
              <span className="font-mono-code text-xs text-muted-foreground">{incident.id}</span>
              <h3 className="font-display font-semibold text-foreground mt-0.5">{incident.service}</h3>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${typeBadgeColors[incident.type]}`}>
              {typeLabels[incident.type]}
            </span>
            <motion.span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-background ${statusColors[incident.status]}`}
              animate={incident.status !== "resolved" ? { opacity: [1, 0.7, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {incident.status}
            </motion.span>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3">
          <div>
            <p className="text-xs text-muted-foreground">{incident.metric}</p>
            <p className="text-xl font-bold font-display text-foreground">{incident.value}</p>
          </div>
          {incident.type === "disk" && incident.node && (
            <div className="text-xs text-muted-foreground">node: {incident.node}</div>
          )}
          {incident.type === "pod" && incident.namespace && (
            <div className="text-xs text-muted-foreground">ns: {incident.namespace}</div>
          )}
          {incident.type === "cpu" && (
            <div className="text-xs text-muted-foreground">threshold: {incident.threshold}</div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-[10px] font-mono-code text-muted-foreground">{incident.alert_source}</span>
          <span
            className={`text-xs font-bold font-mono-code px-2 py-0.5 rounded ${
              incident.decision === "REMEDIATE"
                ? "bg-status-resolved/20 text-status-resolved"
                : incident.decision === "ALERT"
                ? "bg-status-evaluating/20 text-status-evaluating"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {incident.decision}
          </span>
          <span className="text-xs text-muted-foreground ml-auto">
            Score: {incident.finalScore}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
