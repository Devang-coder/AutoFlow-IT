import { motion } from "framer-motion";

interface TimelineNode {
  stage: string;
  time: string;
  active: boolean;
}

const stageColors: Record<string, string> = {
  detected: "bg-status-detected",
  evaluating: "bg-status-evaluating",
  remediating: "bg-status-remediating",
  resolved: "bg-status-resolved",
};

const stageLabels: Record<string, string> = {
  detected: "Detected",
  evaluating: "Evaluating",
  remediating: "Remediating",
  resolved: "Resolved",
};

export function TimelineFlow({ timeline }: { timeline: TimelineNode[] }) {
  const activeIndex = timeline.findIndex((n) => n.active);

  return (
    <div className="flex items-center justify-between">
      {timeline.map((node, i) => {
        const isPast = i < activeIndex || (activeIndex === -1 && node.time !== "-");
        const isActive = node.active;

        return (
          <div key={node.stage} className="flex items-center flex-1 last:flex-none">
            {/* Node */}
            <div className="flex flex-col items-center">
              <motion.div
                className={`w-4 h-4 rounded-full border-2 ${
                  isActive
                    ? `${stageColors[node.stage]} border-transparent`
                    : isPast
                    ? `${stageColors[node.stage]} border-transparent opacity-70`
                    : "bg-secondary border-border"
                }`}
                animate={
                  isActive
                    ? { scale: [1, 1.4, 1], boxShadow: ["0 0 0px transparent", "0 0 12px currentColor", "0 0 0px transparent"] }
                    : {}
                }
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className={`text-xs mt-1.5 font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                {stageLabels[node.stage]}
              </span>
              <span className="text-[10px] font-mono-code text-muted-foreground">{node.time}</span>
            </div>

            {/* Connector */}
            {i < timeline.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 rounded-full overflow-hidden bg-secondary">
                {(isPast || isActive) && (
                  <motion.div
                    className={`h-full ${stageColors[node.stage]}`}
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.6, delay: i * 0.2, ease: "easeOut" }}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
