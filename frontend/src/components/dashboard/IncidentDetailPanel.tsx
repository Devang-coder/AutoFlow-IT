import { motion, AnimatePresence } from "framer-motion";
import type { Incident } from "@/lib/mock-data";
import { TimelineFlow } from "./TimelineFlow";
import { Activity, HardDrive, AlertTriangle } from "lucide-react";

interface IncidentDetailPanelProps {
  incident: Incident | null;
}

const typeIcons = { cpu: Activity, disk: HardDrive, pod: AlertTriangle };
const typeLabels = { cpu: "CPU", disk: "DISK", pod: "POD" };
const layerLabels = { cpu: "Application", disk: "Host", pod: "Infrastructure" };

function ScoreBar({ name, score, reasoning, delay }: { name: string; score: number; reasoning: string; delay: number }) {
  const color = score > 0.7 ? "bg-destructive" : score > 0.5 ? "bg-status-remediating" : "bg-primary";
  const glowColor = score > 0.7 ? "shadow-[0_0_12px_hsl(2,91%,63%,0.3)]" : score > 0.5 ? "shadow-[0_0_12px_hsl(27,86%,59%,0.3)]" : "shadow-[0_0_12px_hsl(212,100%,67%,0.3)]";

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay, duration: 0.4 }} className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-foreground">{name}</span>
        <span className="font-mono-code font-bold text-foreground">{(score * 100).toFixed(0)}%</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <motion.div className={`h-full rounded-full ${color} ${glowColor}`} initial={{ width: 0 }} animate={{ width: `${score * 100}%` }} transition={{ delay: delay + 0.2, duration: 0.8, ease: "easeOut" }} />
      </div>
      <motion.p className="text-xs text-muted-foreground mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.5 }}>{reasoning}</motion.p>
    </motion.div>
  );
}

function RadialGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45;
  const filled = circumference * score;
  const color = score > 0.65 ? "hsl(140, 63%, 48%)" : score > 0.4 ? "hsl(40, 72%, 49%)" : "hsl(215, 10%, 58%)";

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(215, 14%, 15%)" strokeWidth="6" />
        <motion.circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: circumference - filled }} transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="text-2xl font-bold font-display text-foreground" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8, duration: 0.4 }}>
          {(score * 100).toFixed(0)}
        </motion.span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</span>
      </div>
    </div>
  );
}

export function IncidentDetailPanel({ incident }: IncidentDetailPanelProps) {
  if (!incident) return null;
  const TypeIcon = typeIcons[incident.type];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={incident.id}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.4 }}
        className="rounded-lg border border-border/60 bg-card/90 backdrop-blur-sm p-6 glow-blue"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TypeIcon className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono-code text-xs text-muted-foreground">{incident.id}</span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {typeLabels[incident.type]}
              </span>
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">{incident.service}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{incident.metric}: {incident.value}</p>
            
            {/* Type-specific details */}
            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
              <span>Source: <span className="font-mono-code text-foreground">{incident.alert_source}</span></span>
              <span>Layer: <span className="font-mono-code text-foreground">{layerLabels[incident.type]}</span></span>
            </div>
            {incident.type === "disk" && incident.node && (
              <p className="text-xs text-muted-foreground mt-1">Node: <span className="text-foreground font-mono-code">{incident.node}</span> · Disk: <span className="text-foreground font-mono-code">{incident.disk_usage}%</span></p>
            )}
            {incident.type === "pod" && (
              <p className="text-xs text-muted-foreground mt-1">
                Pod: <span className="text-foreground font-mono-code">{incident.pod}</span> · NS: <span className="text-foreground font-mono-code">{incident.namespace}</span>
                <br /><span className="text-destructive text-[10px]">Scheduler failed to assign pod</span>
              </p>
            )}
          </div>
          <motion.div
            className={`text-lg font-bold font-display px-4 py-2 rounded-lg ${
              incident.decision === "REMEDIATE"
                ? "bg-status-resolved/10 text-status-resolved border border-status-resolved/30"
                : incident.decision === "ALERT"
                ? "bg-status-evaluating/10 text-status-evaluating border border-status-evaluating/30"
                : "bg-muted text-muted-foreground border border-border"
            }`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-[10px] text-muted-foreground mr-2 font-normal tracking-wide">DECISION:</span>
            {incident.decision}
          </motion.div>
        </div>

        {/* Score gauge + agents */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Final Score</h3>
            <RadialGauge score={incident.finalScore} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Agent Scores</h3>
            {incident.agents.map((agent, i) => (
              <ScoreBar key={agent.name} name={agent.name} score={agent.score} reasoning={agent.reasoning} delay={0.1 + i * 0.15} />
            ))}
          </div>
        </div>

        {/* Timeline */}
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Incident Timeline</h3>
        <TimelineFlow timeline={incident.timeline} />
      </motion.div>
    </AnimatePresence>
  );
}
