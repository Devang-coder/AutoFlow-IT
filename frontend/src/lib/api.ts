import { io, Socket } from "socket.io-client";

// Backend API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const api = {
    // Fetch incidents from backend
    getIncidents: async () => {
        const response = await fetch(`${API_BASE_URL}/incidents`);
        if (!response.ok) throw new Error("Failed to fetch incidents");
        return response.json();
    },

    // Fetch dashboard metrics
    getMetrics: async () => {
        const response = await fetch(`${API_BASE_URL}/metrics`);
        if (!response.ok) throw new Error("Failed to fetch metrics");
        return response.json();
    },

    // Fetch agent weights
    getWeights: async () => {
        const response = await fetch(`${API_BASE_URL}/weights`);
        if (!response.ok) throw new Error("Failed to fetch weights");
        return response.json();
    },

    // Trigger incident simulation
    // type: "cpu" | "disk" | "pod" — mapped to proper payloads on backend
    triggerSimulation: async (type: string) => {
        const response = await fetch(`${API_BASE_URL}/simulate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type }),
        });
        if (!response.ok) throw new Error("Failed to trigger simulation");
        return response.json();
    },
};

// ─── WebSocket Manager ─────────────────────────────────────────────────────
// Singleton pattern: one socket connection shared across all hooks

class WebSocketManager {
    private socket: Socket | null = null;
    private connectionAttempted = false;

    connect(): Socket {
        if (this.socket?.connected) {
            return this.socket;
        }

        if (this.socket && !this.socket.connected) {
            // Socket exists but disconnected — try reconnecting
            this.socket.connect();
            return this.socket;
        }

        this.socket = io(API_BASE_URL, {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: Infinity,
            timeout: 10000,
        });

        this.socket.on("connect", () => {
            console.log("✓ WebSocket connected to", API_BASE_URL, "| id:", this.socket?.id);
        });

        this.socket.on("disconnect", (reason) => {
            console.log("✗ WebSocket disconnected:", reason);
        });

        this.socket.on("connect_error", (error) => {
            console.error("WebSocket connection error:", error.message);
        });

        this.socket.on("reconnect", (attemptNumber) => {
            console.log("↻ WebSocket reconnected after", attemptNumber, "attempts");
        });

        this.connectionAttempted = true;
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connectionAttempted = false;
        }
    }

    on(event: string, callback: (...args: any[]) => void) {
        const s = this.connect();
        s.on(event, callback);
    }

    off(event: string, callback?: (...args: any[]) => void) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    getSocket(): Socket | null {
        return this.socket;
    }
}

export const wsManager = new WebSocketManager();