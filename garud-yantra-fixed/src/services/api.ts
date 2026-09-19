import { DeviceNode, ThreatIncident, MicroservicesMetrics, CicdPipelineData } from "../types";
import { getQueuedSyncItems, clearSyncQueue, saveIncidentToLocalDb } from "../utils/indexedDb";

export const API = {
  async getHealth() {
    const res = await fetch("/api/health");
    return res.json();
  },

  async getDevices(): Promise<{ success: boolean; devices: DeviceNode[]; onlineCount: number }> {
    const res = await fetch("/api/devices");
    return res.json();
  },

  async getAlerts(): Promise<{ success: boolean; count: number; incidents: ThreatIncident[] }> {
    const res = await fetch("/api/alerts");
    return res.json();
  },

  async getTelemetryStream() {
    const res = await fetch("/api/telemetry/stream");
    return res.json();
  },

  async calculateThreatScore(payload: {
    chemicalVaporPpm: number;
    thermalDeltaC: number;
    opticalConfidence: number;
    radiationCpm: number;
  }) {
    const res = await fetch("/api/threat-scoring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async verifyIncident(id: string, payload: {
    rpfOfficerId: string;
    swabResult: string;
    actionTaken: string;
    status: string;
  }) {
    const res = await fetch(`/api/alerts/${id}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async getLedger() {
    const res = await fetch("/api/evidence/ledger");
    return res.json();
  },

  async simulateThreat(payload: Partial<ThreatIncident> & { deviceId?: string }) {
    const res = await fetch("/api/simulate/threat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.incident) {
      await saveIncidentToLocalDb(data.incident);
    }
    return data;
  },

  async syncOfflineEvents(deviceId = "GARUD-HH-01") {
    const queued = await getQueuedSyncItems();
    if (queued.length === 0) {
      return { success: true, syncedCount: 0, message: "Sync queue is clean. All events synced." };
    }

    const res = await fetch("/api/offline-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId,
        offlineBatchedEvents: queued
      })
    });
    const result = await res.json();
    if (result.success) {
      await clearSyncQueue();
    }
    return result;
  },

  async getMetrics(): Promise<{ success: boolean; metrics: MicroservicesMetrics }> {
    const res = await fetch("/api/microservices/metrics");
    return res.json();
  },

  async getCicdPipeline(): Promise<CicdPipelineData> {
    const res = await fetch("/api/ci-cd/pipeline");
    return res.json();
  },

  async getOpenApiSpec() {
    const res = await fetch("/api/docs/spec");
    return res.json();
  }
};
