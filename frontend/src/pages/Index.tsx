import { useState, useCallback, useEffect } from "react";
import { CinematicEntry } from "@/components/dashboard/CinematicEntry";
import { GridBackground } from "@/components/dashboard/GridBackground";
import { HeaderMetrics } from "@/components/dashboard/HeaderMetrics";
import { IncidentStream } from "@/components/dashboard/IncidentStream";
import { IncidentDetailPanel } from "@/components/dashboard/IncidentDetailPanel";
import { LearningPanel } from "@/components/dashboard/LearningPanel";
import { SimulationTrigger } from "@/components/dashboard/SimulationTrigger";
import { ActivityLog } from "@/components/dashboard/ActivityLog";
import { generateLogEntries } from "@/lib/mock-data";
import type { Incident, LearningWeight, IncidentType, ActivityLogEntry, DashboardMetrics } from "@/lib/mock-data";

// Real API + real-time hooks
import { useRealTimeIncidents, useRealTimeMetrics, useRealTimeWeights } from "@/hooks/useRealTimeData";
import { api } from "@/lib/api";

const statusOrder = ["detected", "evaluating", "remediating", "resolved"] as const;

export default function Index() {
  const [showIntro, setShowIntro] = useState(true);

  // Real data hooks — fetch on mount, update via WebSocket
  const { incidents, loading: incidentsLoading, error: incidentsError } = useRealTimeIncidents();
  const { metrics, loading: metricsLoading, error: metricsError } = useRealTimeMetrics();
  const { weights, loading: weightsLoading, error: weightsError } = useRealTimeWeights();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [pulseType, setPulseType] = useState<IncidentType | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const selectedIncident = incidents.find((i) => i.id === selectedId) ?? null;

  // Type breakdown for the learning panel
  const typeStats = {
    cpu: incidents.filter((i) => i.type === "cpu").length,
    disk: incidents.filter((i) => i.type === "disk").length,
    pod: incidents.filter((i) => i.type === "pod").length,
  };

  const [lastTopIncidentId, setLastTopIncidentId] = useState<string | null>(null);

  // Auto-select the most recent incident, or track when a new one arrives
  useEffect(() => {
    if (incidents.length > 0) {
      const currentTopId = incidents[0].id;
      // If nothing is selected, or a brand-new incident appeared at top
      if (!selectedId || (lastTopIncidentId !== currentTopId && lastTopIncidentId !== null)) {
        setSelectedId(currentTopId);
      }
      if (lastTopIncidentId !== currentTopId) {
        setLastTopIncidentId(currentTopId);
      }
    }
  }, [incidents, selectedId, lastTopIncidentId]);

  // Handle simulation via real API
  const handleSimulate = useCallback(async (type: IncidentType) => {
    if (isSimulating) return; // Prevent spam
    try {
      setIsSimulating(true);
      await api.triggerSimulation(type);

      // Trigger visual pulse feedback
      setPulseType(type);
      setTimeout(() => setPulseType(null), 1500);

      // The new incident will arrive automatically via WebSocket
    } catch (error) {
      console.error("Failed to trigger simulation:", error);
    } finally {
      // Allow new simulations after a brief cooldown
      setTimeout(() => setIsSimulating(false), 2000);
    }
  }, [isSimulating]);

  // Generate activity log entries when incidents arrive or change
  useEffect(() => {
    if (incidents.length > 0) {
      const latestIncident = incidents[0];
      setActivityLog((prev) => {
        const logs = generateLogEntries(latestIncident);
        // Deduplicate by checking timestamp + level
        const newLogs = logs.filter(
          (l) => !prev.some((p) => p.timestamp === l.timestamp && p.level === l.level)
        );
        if (newLogs.length === 0) return prev;
        return [...newLogs, ...prev].slice(0, 50);
      });
    }
  }, [incidents]);

  // Show loading spinner while initial data loads
  if (incidentsLoading || metricsLoading || weightsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D1117]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Connecting to AutoFlow Backend...</p>
          <p className="text-sm text-gray-500 mt-2">Make sure backend is running on port 3001</p>
        </div>
      </div>
    );
  }

  // Show error if backend is unreachable
  if (incidentsError || metricsError || weightsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D1117]">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️ Connection Error</div>
          <p className="text-gray-400">Could not connect to backend</p>
          <p className="text-sm text-gray-500 mt-2">
            {incidentsError || metricsError || weightsError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {showIntro && <CinematicEntry onComplete={() => setShowIntro(false)} />}

      <GridBackground pulseType={pulseType} />

      {!showIntro && (
        <div className="relative z-10">
          <HeaderMetrics metrics={metrics} />

          <main className="container mx-auto px-6 py-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Left: Incident Stream */}
              <div className="col-span-4">
                <IncidentStream
                  incidents={incidents}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              </div>

              {/* Center: Detail Panel + Activity Log */}
              <div className="col-span-5 space-y-6">
                <IncidentDetailPanel incident={selectedIncident} />
                <ActivityLog entries={activityLog} />
              </div>

              {/* Right: Simulation + Learning */}
              <div className="col-span-3 space-y-6">
                <SimulationTrigger onTrigger={handleSimulate} />
                <LearningPanel weights={weights} typeStats={typeStats} />
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}