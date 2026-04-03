export type IncidentStatus = "detected" | "evaluating" | "remediating" | "resolved";
export type IncidentType = "cpu" | "disk" | "pod";

export interface AgentScore {
  name: string;
  score: number;
  reasoning: string;
}

export interface Incident {
  id: string;
  type: IncidentType;
  service: string;
  metric: string;
  value: string;
  threshold: string;
  status: IncidentStatus;
  severity: "critical" | "warning" | "info";
  decision: "REMEDIATE" | "ALERT" | "IGNORE";
  finalScore: number;
  agents: AgentScore[];
  timeline: { stage: IncidentStatus; time: string; active: boolean }[];
  timestamp: number;
  node?: string;
  pod?: string;
  disk_usage?: number;
  namespace?: string;
  alert_source: "cAdvisor" | "node-exporter" | "kube-state-metrics";
}

export interface LearningWeight {
  agent: string;
  weight: number;
  change: number;
}

export interface ActivityLogEntry {
  timestamp: number;
  level: "DETECT" | "EVALUATE" | "ACTION" | "RESOLVE";
  message: string;
  type: IncidentType;
}

export interface DashboardMetrics {
  incidents: number;
  anomalies: number;
  actionsTaken: number;
  mttr: number;
  successRate: number;
}

const services = ["api-gateway", "payment-svc", "auth-service", "user-db", "cache-layer", "search-engine", "notification-svc", "cdn-edge"];
const nodes = ["node-01", "node-02", "node-03", "node-04", "node-05"];
const pods = ["payment-service", "auth-worker", "order-processor", "inventory-sync", "notification-handler", "search-indexer"];
const namespaces = ["production", "staging", "monitoring", "default"];

let incidentCounter = 0;

function makeAgentScores() {
  const anomalyScore = +(Math.random() * 0.5 + 0.5).toFixed(2);
  const riskScore = +(Math.random() * 0.8 + 0.2).toFixed(2);
  const slaScore = +(Math.random() * 0.7 + 0.3).toFixed(2);
  const contextScore = +(Math.random() * 0.6 + 0.4).toFixed(2);
  const finalScore = +((anomalyScore * 0.3 + riskScore * 0.25 + slaScore * 0.25 + contextScore * 0.2)).toFixed(2);
  const decision = finalScore > 0.65 ? "REMEDIATE" as const : finalScore > 0.4 ? "ALERT" as const : "IGNORE" as const;
  return {
    agents: [
      { name: "Anomaly", score: anomalyScore, reasoning: `Deviation ${(anomalyScore * 100).toFixed(0)}% above baseline pattern` },
      { name: "Risk", score: riskScore, reasoning: `Business impact score: ${(riskScore * 10).toFixed(1)}/10` },
      { name: "SLA", score: slaScore, reasoning: `SLA breach probability: ${(slaScore * 100).toFixed(0)}%` },
      { name: "Context", score: contextScore, reasoning: `${Math.floor(Math.random() * 5)} related events in last hour` },
    ],
    finalScore,
    decision,
  };
}

function makeTimeline(): Incident["timeline"] {
  return [
    { stage: "detected", time: "0s", active: true },
    { stage: "evaluating", time: "-", active: false },
    { stage: "remediating", time: "-", active: false },
    { stage: "resolved", time: "-", active: false },
  ];
}

export function generateCpuIncident(): Incident {
  incidentCounter++;
  const id = `INC-${String(incidentCounter).padStart(4, "0")}`;
  const service = services[Math.floor(Math.random() * services.length)];
  const cpuValue = (Math.random() * 10 + 90).toFixed(1);
  const { agents, finalScore, decision } = makeAgentScores();

  return {
    id, type: "cpu", service, metric: "CPU Usage", value: `${cpuValue}%`,
    threshold: "85%", status: "detected", severity: "critical", decision, finalScore, agents,
    timeline: makeTimeline(), timestamp: Date.now(),
    alert_source: "cAdvisor",
  };
}

export function generateDiskIncident(): Incident {
  incidentCounter++;
  const id = `INC-${String(incidentCounter).padStart(4, "0")}`;
  const node = nodes[Math.floor(Math.random() * nodes.length)];
  const diskUsage = Math.floor(Math.random() * 14 + 85); // 85-98%
  const freePercent = 100 - diskUsage;
  const severity = freePercent < 5 ? "critical" as const : "warning" as const;
  const { agents, finalScore, decision } = makeAgentScores();

  return {
    id, type: "disk", service: node, metric: "Disk Usage", value: `${diskUsage}%`,
    threshold: "90%", status: "detected", severity, decision, finalScore, agents,
    timeline: makeTimeline(), timestamp: Date.now(),
    node, disk_usage: diskUsage,
    alert_source: "node-exporter",
  };
}

export function generatePodIncident(): Incident {
  incidentCounter++;
  const id = `INC-${String(incidentCounter).padStart(4, "0")}`;
  const pod = pods[Math.floor(Math.random() * pods.length)];
  const ns = namespaces[Math.floor(Math.random() * namespaces.length)];
  const { agents, finalScore, decision } = makeAgentScores();

  return {
    id, type: "pod", service: pod, metric: "Scheduling Failure", value: "FAILED",
    threshold: "scheduled=true", status: "detected", severity: "critical", decision, finalScore, agents,
    timeline: makeTimeline(), timestamp: Date.now(),
    pod, namespace: ns,
    alert_source: "kube-state-metrics",
  };
}

// Legacy compat
export function generateIncident(): Incident {
  const r = Math.random();
  if (r < 0.33) return generateCpuIncident();
  if (r < 0.66) return generateDiskIncident();
  return generatePodIncident();
}

export const initialIncidents: Incident[] = [
  generateCpuIncident(),
  generateDiskIncident(),
  generatePodIncident(),
];

// Pre-advance some
initialIncidents[0].status = "remediating";
initialIncidents[0].timeline[0].active = false;
initialIncidents[0].timeline[1] = { stage: "evaluating", time: "1.2s", active: false };
initialIncidents[0].timeline[2] = { stage: "remediating", time: "3.4s", active: true };

initialIncidents[1].status = "evaluating";
initialIncidents[1].timeline[0].active = false;
initialIncidents[1].timeline[1] = { stage: "evaluating", time: "0.8s", active: true };

export const initialLearningWeights: LearningWeight[] = [
  { agent: "Anomaly Detection", weight: 0.30, change: 0.02 },
  { agent: "Risk Assessment", weight: 0.25, change: -0.01 },
  { agent: "SLA Analysis", weight: 0.25, change: 0.03 },
  { agent: "Context Engine", weight: 0.20, change: 0.01 },
];

export function generateLogEntries(incident: Incident): ActivityLogEntry[] {
  const base = incident.timestamp;
  const entries: ActivityLogEntry[] = [];
  
  if (incident.type === "cpu") {
    entries.push(
      { timestamp: base, level: "DETECT", message: `CPU spike detected in ${incident.service} (${incident.value})`, type: "cpu" },
      { timestamp: base + 2000, level: "EVALUATE", message: `Consensus score: ${incident.finalScore} → ${incident.decision}`, type: "cpu" },
    );
    if (incident.decision === "REMEDIATE") {
      entries.push(
        { timestamp: base + 4000, level: "ACTION", message: `Scaling service ${incident.service}`, type: "cpu" },
        { timestamp: base + 8000, level: "RESOLVE", message: `MTTR: ${(Math.random() * 5 + 3).toFixed(1)}s — recovered`, type: "cpu" },
      );
    }
  } else if (incident.type === "disk") {
    const freePercent = incident.disk_usage ? 100 - incident.disk_usage : 5;
    entries.push(
      { timestamp: base, level: "DETECT", message: `Node disk usage ${incident.severity} (${freePercent}% free) on ${incident.node}`, type: "disk" },
      { timestamp: base + 2000, level: "EVALUATE", message: `Severity: ${incident.severity.toUpperCase()} — threshold breached`, type: "disk" },
      { timestamp: base + 4000, level: "ACTION", message: `Cleaning disk / rescheduling pods on ${incident.node}`, type: "disk" },
    );
  } else {
    entries.push(
      { timestamp: base, level: "DETECT", message: `Pod not scheduled: ${incident.pod} (${incident.namespace})`, type: "pod" },
      { timestamp: base + 2000, level: "EVALUATE", message: `Scheduler failed to assign pod — resource constraints`, type: "pod" },
      { timestamp: base + 4000, level: "ACTION", message: `Node reallocation triggered for ${incident.pod}`, type: "pod" },
    );
  }

  return entries;
}
