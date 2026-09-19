export type DeviceType = "FIXED_NODE" | "HANDHELD" | "QUADRUPED_MOBILE";

export interface DeviceNode {
  id: string;
  name: string;
  type: DeviceType;
  location: string;
  coordinates: { lat: number; lng: number };
  status: "ONLINE" | "STANDBY" | "ALERTING" | "OFFLINE";
  batteryLevel: number;
  firmwareVersion: string;
  activeSensors: string[];
  lastPing: string;
  meshNodeCount: number;
  networkLatencyMs: number;
}

export type ThreatSeverity = "LOW" | "ELEVATED" | "CRITICAL";
export type ThreatStatus = "DETECTED" | "RPF_DISPATCHED" | "SECONDARY_VERIFIED" | "NEUTRALIZED" | "CLEARED";
export type ThreatCategory = "EXPLOSIVE" | "NARCOTIC" | "RADIATION" | "SUSPICIOUS_HEAT";

export interface ThreatIncident {
  id: string;
  timestamp: string;
  zone: string;
  locationName: string;
  latitude: number;
  longitude: number;
  detectedBy: {
    deviceId: string;
    deviceName: string;
    type: DeviceType;
  };
  threatCategory: ThreatCategory;
  identifiedSubstance: string;
  confidenceScore: number;
  severity: ThreatSeverity;
  status: ThreatStatus;
  associatedEntity?: {
    type: "PERSON" | "UNATTENDED_LUGGAGE" | "COACH_UNDERFRAME" | "CARGO_CRATE";
    description: string;
    visualBoundingBox?: [number, number, number, number];
    confidence: number;
  };
  sensorFusionBreakdown: {
    chemicalScore: number;
    thermalScore: number;
    opticalScore: number;
    radiationScore: number;
  };
  blockchainHash: string;
  previousHash: string;
  verificationDetails?: {
    verifiedByRPFId: string;
    verifiedAt: string;
    swabResult: string;
    actionTaken: string;
  };
}

export interface SensorReading {
  sensorId: string;
  deviceId: string;
  type: "chemical_voc" | "thermal" | "radiation" | "swab_raman" | "optical_cam" | "lidar";
  value: number;
  unit: string;
  baseline: number;
  anomalyDetected: boolean;
  timestamp: string;
}

export interface MicroservicesMetrics {
  totalTelemetryPacketsIngested: number;
  throughputRequestsPerSec: number;
  p99ResponseLatencyMs: number;
  p50ResponseLatencyMs: number;
  activeClusterNodes: number;
  ingestionQueueDepth: number;
  cacheHitRate: string;
  tlsCipherSuite: string;
  edgeComputingLoad: string;
  networkUptime: string;
}

export interface PipelineStage {
  name: string;
  duration: string;
  status: "SUCCESS" | "RUNNING" | "QUEUED" | "FAILED";
  tool: string;
}

export interface CicdPipelineData {
  pipelineId: string;
  branch: string;
  commitSha: string;
  status: string;
  stages: PipelineStage[];
  microservicesDiagram: {
    gateway: string;
    services: string[];
  };
}
