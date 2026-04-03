import { useEffect, useState, useRef, useCallback } from "react";
import { api, wsManager } from "@/lib/api";
import type { DashboardMetrics, LearningWeight, Incident } from "@/lib/mock-data";

// ─── TRANSFORMATION LAYER ────────────────────────────────────────────────────
// Maps backend DB fields → frontend UI structure

const mapBackendIncident = (raw: any): Incident | null => {
    if (!raw) return null;

    // Handle both flat objects and wrapped {event_id, status, updated_data} payloads
    const b = raw.updated_data ? { ...raw.updated_data, event_id: raw.event_id, status: raw.updated_data.status || raw.status } : raw;

    if (!b.event_id) return null;

    const typeMap: Record<string, "cpu" | "disk" | "pod"> = {
        cpu_usage: "cpu",
        memory_usage: "disk",
        disk_usage: "disk",
        error_rate: "pod",
    };

    const mappedType = typeMap[b.metric_type] || "cpu";

    // Normalize status to frontend-supported values
    let status = b.status || "detected";
    if (status === "alerted") status = "evaluating";
    if (status === "escalated") status = "detected";
    if (!["detected", "evaluating", "remediating", "resolved"].includes(status)) {
        status = "detected";
    }

    // Normalize severity
    const severityMap: Record<string, "critical" | "warning" | "info"> = {
        critical: "critical",
        high: "critical",
        medium: "warning",
        low: "info",
        none: "info",
    };

    // Build decision
    const decision = b.decision
        ? (b.decision.toUpperCase() as "REMEDIATE" | "ALERT" | "IGNORE")
        : "IGNORE";

    return {
        id: b.event_id,
        type: mappedType,
        service: b.service_name || "unknown-service",
        metric: b.metric_type || "Unknown",
        value: b.metric_value != null ? `${parseFloat(String(b.metric_value)).toFixed(1).replace(/\.0$/, "")}` : "N/A",
        threshold: "Baseline Exceeded",
        status: status as any,
        severity: severityMap[b.anomaly_severity] || "warning",
        decision,
        finalScore: parseFloat(b.consensus_score) || 0,
        agents: [
            { name: "Anomaly", score: parseFloat(b.anomaly_agent_score) || 0, reasoning: b.anomaly_reasoning || "Analyzing..." },
            { name: "Risk", score: parseFloat(b.risk_agent_score) || 0, reasoning: b.risk_reasoning || "Analyzing..." },
            { name: "SLA", score: parseFloat(b.sla_agent_score) || 0, reasoning: b.sla_reasoning || "Analyzing..." },
            { name: "Context", score: parseFloat(b.context_agent_score) || 0, reasoning: b.context_reasoning || "Analyzing..." }
        ],
        timeline: [
            { stage: "detected" as const, time: b.recorded_at ? "0s" : "-", active: status === "detected" },
            { stage: "evaluating" as const, time: b.consensus_score != null ? "Done" : "-", active: status === "evaluating" },
            { stage: "remediating" as const, time: b.action_type ? "Done" : "-", active: status === "remediating" },
            { stage: "resolved" as const, time: b.mttr_seconds != null ? `${b.mttr_seconds}s` : "-", active: status === "resolved" }
        ],
        timestamp: b.recorded_at ? new Date(b.recorded_at).getTime() : Date.now(),
        node: mappedType === "disk" ? (b.service_name || "node-unknown") : undefined,
        pod: mappedType === "pod" ? (b.service_name || undefined) : undefined,
        disk_usage: mappedType === "disk" ? Math.round(parseFloat(b.metric_value) || 0) : undefined,
        namespace: b.namespace || "default",
        alert_source: "cAdvisor" as const,
    };
};

const mapBackendMetrics = (data: any): DashboardMetrics => ({
    incidents: parseInt(data?.events_24h) || 0,
    anomalies: parseInt(data?.anomalies_24h) || 0,
    actionsTaken: parseInt(data?.actions_taken) || 0,
    mttr: parseFloat(data?.avg_mttr_seconds) || 0,
    successRate: parseFloat(data?.success_rate_percent) || 0,
});

const mapBackendWeights = (data: any): LearningWeight[] => {
    if (!Array.isArray(data)) return [];
    return data.map((item: any) => ({
        agent: item?.agent_name
            ? item.agent_name.charAt(0).toUpperCase() + item.agent_name.slice(1) + " Agent"
            : "Unknown Agent",
        weight: parseFloat(item?.current_weight) || 0,
        change: Math.round(((parseFloat(item?.current_weight) || 0) - (parseFloat(item?.initial_weight) || 0)) * 100) / 100,
    }));
};


// ─── HOOKS ────────────────────────────────────────────────────────────────────

export function useRealTimeMetrics() {
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        incidents: 0,
        anomalies: 0,
        actionsTaken: 0,
        mttr: 0,
        successRate: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const fetchMetrics = async () => {
            try {
                setLoading(true);
                const data = await api.getMetrics();
                if (!cancelled) {
                    setMetrics(mapBackendMetrics(data));
                    setError(null);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to load metrics");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchMetrics();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        const socket = wsManager.connect();

        const handleMetricsUpdate = (data: any) => {
            // Use data directly if it has the expected shape, otherwise re-fetch
            if (data && (data.events_24h !== undefined || data.anomalies_24h !== undefined)) {
                setMetrics(mapBackendMetrics(data));
            } else {
                api.getMetrics().then(d => setMetrics(mapBackendMetrics(d))).catch(console.error);
            }
        };

        socket.on("metrics_update", handleMetricsUpdate);

        return () => {
            socket.off("metrics_update", handleMetricsUpdate);
        };
    }, []);

    return { metrics, loading, error };
}

export function useRealTimeWeights() {
    const [weights, setWeights] = useState<LearningWeight[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const fetchWeights = async () => {
            try {
                setLoading(true);
                const data = await api.getWeights();
                if (!cancelled) {
                    setWeights(mapBackendWeights(data));
                    setError(null);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to load weights");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchWeights();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        const socket = wsManager.connect();

        const handleWeightsUpdate = (data: any) => {
            // Use data directly if array, otherwise re-fetch
            if (Array.isArray(data) && data.length > 0) {
                setWeights(mapBackendWeights(data));
            } else {
                api.getWeights().then(d => setWeights(mapBackendWeights(d))).catch(console.error);
            }
        };

        socket.on("weights_update", handleWeightsUpdate);

        return () => {
            socket.off("weights_update", handleWeightsUpdate);
        };
    }, []);

    return { weights, loading, error };
}

export function useRealTimeIncidents() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const incidentsRef = useRef<Incident[]>([]);

    // Keep ref in sync to avoid stale closures inside socket handler
    useEffect(() => {
        incidentsRef.current = incidents;
    }, [incidents]);

    useEffect(() => {
        let cancelled = false;
        const fetchIncidents = async () => {
            try {
                setLoading(true);
                const data = await api.getIncidents();
                if (!cancelled && Array.isArray(data)) {
                    const mapped = data.map(mapBackendIncident).filter(Boolean) as Incident[];
                    setIncidents(mapped.sort((a, b) => b.timestamp - a.timestamp));
                    setError(null);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to load incidents");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchIncidents();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        const socket = wsManager.connect();

        const handleIncidentUpdate = (payload: any) => {
            if (!payload) return;

            const mapped = mapBackendIncident(payload);
            if (!mapped) {
                // Couldn't map — re-fetch full list as fallback
                api.getIncidents().then(data => {
                    if (Array.isArray(data)) {
                        const result = data.map(mapBackendIncident).filter(Boolean) as Incident[];
                        setIncidents(result.sort((a, b) => b.timestamp - a.timestamp));
                    }
                }).catch(console.error);
                return;
            }

            setIncidents(prev => {
                const existingIdx = prev.findIndex(i => i.id === mapped.id);
                let updated: Incident[];
                if (existingIdx >= 0) {
                    // Update existing incident in place
                    updated = [...prev];
                    updated[existingIdx] = mapped;
                } else {
                    // Add new incident at top
                    updated = [mapped, ...prev];
                }
                return updated.sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
            });
        };

        socket.on("incident_update", handleIncidentUpdate);

        return () => {
            socket.off("incident_update", handleIncidentUpdate);
        };
    }, []);

    return { incidents, loading, error };
}