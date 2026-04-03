import { motion } from "framer-motion";
import { AnimatedCounter } from "./AnimatedCounter";
import { Activity, CheckCircle, AlertTriangle, Gauge, Wrench } from "lucide-react";
import type { DashboardMetrics } from "@/lib/mock-data";

interface HeaderMetricsProps {
  metrics: DashboardMetrics;
}

const sparklineData = [40, 55, 35, 60, 45, 70, 50, 65, 55, 75, 60, 80];

function MiniSparkline({ color }: { color: string }) {
  const max = Math.max(...sparklineData);
  const min = Math.min(...sparklineData);
  const h = 24;
  const w = 60;
  const points = sparklineData.map((v, i) => `${(i / (sparklineData.length - 1)) * w},${h - ((v - min) / (max - min)) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
    </svg>
  );
}

export function HeaderMetrics({ metrics }: HeaderMetricsProps) {
  const cards = [
    {
      label: "MTTR",
      icon: Activity,
      value: <AnimatedCounter target={metrics.mttr} suffix="s" decimals={1} className="text-2xl font-bold font-display text-primary" />,
      sparkColor: "hsl(212, 100%, 67%)",
      glow: "glow-blue",
    },
    {
      label: "Success Rate",
      icon: CheckCircle,
      value: <AnimatedCounter target={metrics.successRate} suffix="%" decimals={1} className="text-2xl font-bold font-display text-status-resolved" />,
      sparkColor: "hsl(140, 63%, 48%)",
      glow: "glow-green",
    },
    {
      label: "Incidents",
      icon: AlertTriangle,
      value: <AnimatedCounter target={metrics.incidents} className="text-2xl font-bold font-display text-status-remediating" />,
      sparkColor: "hsl(27, 86%, 59%)",
      glow: "glow-orange",
    },
    {
      label: "Anomalies",
      icon: Gauge,
      value: <AnimatedCounter target={metrics.anomalies} className="text-2xl font-bold font-display text-destructive" />,
      sparkColor: "hsl(2, 91%, 63%)",
      glow: "glow-red",
    },
    {
      label: "Actions",
      icon: Wrench,
      value: <AnimatedCounter target={metrics.actionsTaken} className="text-2xl font-bold font-display text-chart-5" />,
      sparkColor: "hsl(270, 70%, 71%)",
      glow: "glow-blue",
    },
  ];

  return (
    <motion.header
      className="sticky top-0 z-30 backdrop-blur-xl border-b border-border/50 bg-background/60"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div className="w-2.5 h-2.5 rounded-full bg-primary" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            <span className="font-display font-bold text-lg tracking-tight text-foreground">AutoFlow</span>
            <span className="text-xs font-mono-code text-muted-foreground border border-border rounded px-2 py-0.5">LIVE</span>
          </div>

          <div className="flex gap-3">
            {cards.map((card, i) => (
              <motion.div
                key={card.label}
                className={`relative rounded-lg border border-border/50 bg-card/80 backdrop-blur-sm px-4 py-2 ${card.glow}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <card.icon className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{card.label}</span>
                </div>
                <div className="flex items-end gap-2">
                  {card.value}
                  <MiniSparkline color={card.sparkColor} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
