import { createIcons, icons } from "lucide";
import { 
  renderStationHeatmapComponent, 
  startHeatmapSimulation, 
  stopHeatmapSimulation, 
  heatmapState 
} from "./stationHeatmap.js";

// --- STATE MANAGEMENT ---
const state = {
  activeTab: "command",
  incidents: [],
  devices: [],
  selectedIncident: null,
  isOfflineMode: false,
  isSyncing: false,
  visionMode: "optical", // 'optical' | 'thermal' | 'undercarriage'
  scoringInputs: {
    chemicalVaporPpm: 14.5,
    thermalDeltaC: 16.8,
    opticalConfidence: 0.94,
    radiationCpm: 24
  },
  tamperedBlock: null
};

// --- INDEXED DB ENGINE (Offline-First Storage) ---
const DB_NAME = "garud_yantra_db";
const DB_VERSION = 1;
const STORE_NAME = "cached_incidents";

function initIndexedDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      console.warn("IndexedDB not supported in this browser");
      return resolve(null);
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveToIndexedDb(incidents) {
  try {
    const db = await initIndexedDb();
    if (!db) return;
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    for (const inc of incidents) {
      store.put(inc);
    }
  } catch (err) {
    console.error("IndexedDB save error:", err);
  }
}

async function getFromIndexedDb() {
  try {
    const db = await initIndexedDb();
    if (!db) return [];
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch (err) {
    console.error("IndexedDB get error:", err);
    return [];
  }
}

// --- UI TOAST HELPER ---
export function showToast(message, isAlert = false) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `p-3 rounded-xl border text-xs font-mono shadow-2xl flex items-center gap-3 transition-all duration-300 animate-bounce ${
    isAlert 
      ? "bg-red-950/90 border-red-500 text-red-200" 
      : "bg-slate-900/95 border-cyan-500 text-cyan-200"
  }`;
  toast.innerHTML = `
    <span class="w-2 h-2 rounded-full ${isAlert ? "bg-red-400" : "bg-cyan-400"} animate-ping"></span>
    <span class="flex-1">${message}</span>
    <button class="text-slate-400 hover:text-white">&times;</button>
  `;
  toast.querySelector("button").onclick = () => toast.remove();
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Expose toast globally for component integrations
window.showToast = showToast;

// --- API CLIENT (Node.js + Express backend) ---
const API = {
  async getHealth() {
    const res = await fetch("/api/health");
    return res.json();
  },
  async getDevices() {
    const res = await fetch("/api/devices");
    return res.json();
  },
  async getAlerts() {
    const res = await fetch("/api/alerts");
    return res.json();
  },
  async getPatrols() {
    const res = await fetch("/api/station/patrols");
    return res.json();
  },
  async calculateScore(payload) {
    const res = await fetch("/api/threat-scoring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return res.json();
  },
  async verifyAlert(id, payload) {
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
  async getMetrics() {
    const res = await fetch("/api/microservices/metrics");
    return res.json();
  },
  async simulateThreat(payload) {
    const res = await fetch("/api/simulate/threat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return res.json();
  },
  async syncOffline(deviceId) {
    const res = await fetch("/api/offline/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId })
    });
    return res.json();
  }
};

// --- DATA FETCHING & SYNCHRONIZATION ---
async function loadInitialData(renderUI = true) {
  try {
    if (!state.isOfflineMode) {
      const [devData, alertData, patrolData] = await Promise.all([
        API.getDevices(),
        API.getAlerts(),
        API.getPatrols().catch(() => ({ patrols: [] }))
      ]);

      if (devData.devices) {
        state.devices = devData.devices;
      }
      if (alertData.incidents) {
        state.incidents = alertData.incidents;
        if (!state.selectedIncident && alertData.incidents.length > 0) {
          state.selectedIncident = alertData.incidents[0];
        }
        // Sync incidents onto SVG heatmap
        heatmapState.incidents = alertData.incidents.map((inc, idx) => ({
          id: inc.id,
          title: inc.identifiedSubstance || inc.threatCategory,
          x: inc.zone?.includes("Concourse") || inc.locationName?.includes("Platform 1") ? 320 : inc.locationName?.includes("Coach B-4") ? 680 : 110 + (idx * 160),
          y: inc.zone?.includes("Concourse") || inc.locationName?.includes("Platform 1") ? 95 : inc.locationName?.includes("Coach B-4") ? 450 : 380,
          zone: inc.locationName || inc.zone,
          severity: inc.severity,
          substance: inc.identifiedSubstance,
          confidence: inc.confidenceScore
        }));
        // Cache to IndexedDB for offline resilience
        saveToIndexedDb(alertData.incidents);
      }
      if (patrolData && patrolData.patrols && patrolData.patrols.length > 0) {
        // Sync active patrols from backend into heatmap
        patrolData.patrols.forEach(p => {
          const match = heatmapState.patrols.find(local => local.id === p.id);
          if (match) {
            match.name = p.name;
            match.zone = p.zone;
            match.status = p.status;
            match.officer = p.officer;
            match.battery = p.battery;
          }
        });
      }
    } else {
      // Offline fallback: load from browser IndexedDB
      const cached = await getFromIndexedDb();
      if (cached && cached.length > 0) {
        state.incidents = cached;
        state.selectedIncident = cached[0];
      }
    }
  } catch (err) {
    console.warn("Express backend fetch failed, using IndexedDB offline store:", err);
    const cached = await getFromIndexedDb();
    if (cached && cached.length > 0) {
      state.incidents = cached;
      state.selectedIncident = cached[0];
    }
  }

  updateNavbarBadges();
  if (renderUI) {
    renderActiveTab();
  }
}

// --- NAVBAR BADGES UPDATE ---
function updateNavbarBadges() {
  const critEl = document.getElementById("badge-critical");
  const elevEl = document.getElementById("badge-elevated");
  const quadEl = document.getElementById("badge-quad");
  const handEl = document.getElementById("badge-handheld");
  const fixdEl = document.getElementById("badge-fixed");

  const criticals = state.incidents.filter(i => i.severity === "CRITICAL" && i.status !== "NEUTRALIZED").length;
  const elevated = state.incidents.filter(i => i.severity === "ELEVATED").length;
  const quads = state.devices.filter(d => d.type === "QUADRUPED_MOBILE").length;
  const handhelds = state.devices.filter(d => d.type === "HANDHELD").length;
  const fixed = state.devices.filter(d => d.type === "FIXED_NODE").length;

  if (critEl) critEl.innerText = criticals;
  if (elevEl) elevEl.innerText = elevated;
  if (quadEl) quadEl.innerText = quads;
  if (handEl) handEl.innerText = handhelds;
  if (fixdEl) fixdEl.innerText = fixed;
}

// --- TACTICAL VISION STREAM CANVAS ---
function renderTacticalVisionCanvas() {
  const canvas = document.getElementById("tactical-vision-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  // Clear background
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, w, h);

  if (state.visionMode === "thermal") {
    // Thermal IR False-Color Map
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, "#030712");
    gradient.addColorStop(0.3, "#1e1b4b");
    gradient.addColorStop(0.7, "#431407");
    gradient.addColorStop(1, "#7f1d1d");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Grid crosshairs
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Hotspot Anomaly Circle (Exothermic chemical reaction / battery)
    const time = Date.now() * 0.003;
    const pulse = 4 + Math.sin(time) * 3;
    const hx = w * 0.62;
    const hy = h * 0.52;

    const radGrad = ctx.createRadialGradient(hx, hy, 5, hx, hy, 45 + pulse);
    radGrad.addColorStop(0, "#ffffff");
    radGrad.addColorStop(0.3, "#facc15");
    radGrad.addColorStop(0.6, "#ea580c");
    radGrad.addColorStop(1, "rgba(220, 38, 38, 0)");
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(hx, hy, 45 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Hotspot Label
    ctx.fillStyle = "#fef08a";
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.fillText("HOTSPOT: 68.4°C [ΔT +16.2°C]", hx - 65, hy - 35);
    ctx.strokeStyle = "#facc15";
    ctx.strokeRect(hx - 30, hy - 25, 60, 50);

  } else if (state.visionMode === "undercarriage") {
    // Quadruped Rover Under-Carriage Inspection Camera
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, w, h);

    // Railway steel tracks perspective
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(w * 0.2, h); ctx.lineTo(w * 0.42, h * 0.3);
    ctx.moveTo(w * 0.8, h); ctx.lineTo(w * 0.58, h * 0.3);
    ctx.stroke();

    // Coach Axle & Bogie Outline
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(w * 0.3, h * 0.25, w * 0.4, h * 0.25);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 10px 'JetBrains Mono', monospace";
    ctx.fillText("COACH B-4 CHASSIS BOGIE 2 (OBSTACLE DETECTED)", w * 0.31, h * 0.23);

    // Magnetic attachment package detection
    const mx = w * 0.52;
    const my = h * 0.36;
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    ctx.strokeRect(mx - 25, my - 15, 50, 30);
    ctx.fillStyle = "#f87171";
    ctx.fillText("CONCEALED PACKAGE [MAGNETIC]", mx - 40, my + 30);

  } else {
    // 4K Optical AI with ByteTrack Bounding Boxes
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, w, h);

    // Simulated concourse CCTV frame background
    ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
    }
    for (let j = 0; j < h; j += 40) {
      ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(w, j); ctx.stroke();
    }

    // Unattended Luggage Target Bounding Box
    const bx = w * 0.55;
    const by = h * 0.45;
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, 110, 80);

    // Corner targeting reticles
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bx - 4, by + 10); ctx.lineTo(bx - 4, by - 4); ctx.lineTo(bx + 10, by - 4);
    ctx.moveTo(bx + 114, by + 10); ctx.lineTo(bx + 114, by - 4); ctx.lineTo(bx + 100, by - 4);
    ctx.stroke();

    ctx.fillStyle = "#ef4444";
    ctx.fillRect(bx, by - 20, 110, 20);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.fillText("TARGET #01: 96.4%", bx + 4, by - 6);

    ctx.fillStyle = "#fca5a5";
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.fillText("Unattended Rucksack (12m+)", bx, by + 95);
  }

  // Common HUD Overlays
  ctx.fillStyle = "#22d3ee";
  ctx.font = "10px 'JetBrains Mono', monospace";
  ctx.fillText(`CAM-NODE: ${state.selectedIncident ? state.selectedIncident.deviceId : "GARUD-FN-01"} • 1080p 60FPS`, 15, 22);

  ctx.fillStyle = "#a855f7";
  ctx.fillText(`EDGE AI: YOLOv8-Custom + ByteTrack (Latency: 14.8ms)`, 15, 38);

  ctx.fillStyle = "#ef4444";
  ctx.fillText(`THREAT SCORE: ${state.selectedIncident ? state.selectedIncident.confidenceScore : 96.4}% [CRITICAL]`, w - 210, 22);
}

// --- SPECTROGRAM CANVAS ---
function renderSpectrogramCanvas() {
  const canvas = document.getElementById("spectrogram-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = "#050b14";
  ctx.fillRect(0, 0, w, h);

  // Frequency/mz grid lines
  ctx.strokeStyle = "rgba(51, 65, 85, 0.4)";
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 45) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h - 25); ctx.stroke();
  }
  for (let y = 0; y < h - 25; y += 25) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // Simulated Ion Mobility Spectrometry (IMS) Drift Time / Raman Shift Peak
  const peaks = [
    { x: w * 0.18, height: h * 0.35, label: "Solvent Matrix (182 cm⁻¹)", color: "#64748b" },
    { x: w * 0.36, height: h * 0.52, label: "Nitro Group -NO₂ (842 cm⁻¹)", color: "#f59e0b" },
    { x: w * 0.62, height: h * 0.88, label: "RDX / PETN Molecular (1264 cm⁻¹)", color: "#ef4444" },
    { x: w * 0.82, height: h * 0.42, label: "Aliphatic C-H (2950 cm⁻¹)", color: "#06b6d4" }
  ];

  peaks.forEach(peak => {
    // Peak curve
    ctx.fillStyle = peak.color;
    ctx.beginPath();
    ctx.moveTo(peak.x - 18, h - 25);
    ctx.quadraticCurveTo(peak.x, h - 25 - peak.height, peak.x + 18, h - 25);
    ctx.fill();

    // Vertical indicator line
    ctx.strokeStyle = peak.color;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(peak.x, h - 25 - peak.height);
    ctx.lineTo(peak.x, 25);
    ctx.stroke();
    ctx.setLineDash([]);

    // Peak label
    ctx.fillStyle = "#ffffff";
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.fillText(peak.label, Math.max(10, peak.x - 55), 18);
  });

  // Base axis line
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, h - 25);
  ctx.lineTo(w, h - 25);
  ctx.stroke();

  ctx.fillStyle = "#94a3b8";
  ctx.font = "10px 'JetBrains Mono', monospace";
  ctx.fillText("DRIFT TIME (ms) / RAMAN SHIFT (cm⁻¹) →", w * 0.35, h - 8);
}

// --- TAB SWITCHER ---
export function switchTab(tabName) {
  state.activeTab = tabName;

  // Update tab button styles
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach(btn => {
    const isThis = btn.getAttribute("data-tab") === tabName;
    if (isThis) {
      btn.className = "tab-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md shadow-cyan-500/10";
    } else {
      btn.className = "tab-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent";
    }
  });

  renderActiveTab();
}

// --- RENDER ACTIVE TAB CONTENT ---
function renderActiveTab() {
  const container = document.getElementById("main-tab-content");
  if (!container) return;

  // Manage Heatmap Simulation loop when switching away from Command Center
  if (state.activeTab !== "command") {
    stopHeatmapSimulation();
  }

  switch (state.activeTab) {
    case "command":
      renderCommandCenter(container);
      break;
    case "fleet":
      renderFleetManager(container);
      break;
    case "fusion":
      renderSensorFusion(container);
      break;
    case "ledger":
      renderEvidenceLedger(container);
      break;
    case "microservices":
      renderMicroservices(container);
      break;
    case "cicd":
      renderCicd(container);
      break;
    case "docs":
      renderApiDocs(container);
      break;
  }

  // Re-run lucide icons whenever DOM updates
  createIcons({ icons });
}

// ==========================================
// TAB 1: COMMAND CENTER
// ==========================================
function renderCommandCenter(container) {
  const inc = state.selectedIncident || state.incidents[0];

  container.innerHTML = `
    <div class="space-y-4">
      <!-- Interactive SVG Station Floor Plan & Real-Time RPF Patrol Density Heatmap -->
      <div id="station-heatmap-root"></div>

      <!-- Main Operational Split: Tactical Vision + Incident Details -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <!-- Left: Live Tactical Vision & Spectrogram (7 cols) -->
        <div class="lg:col-span-7 space-y-4">
          <!-- Tactical Vision Stream Box -->
          <div class="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  <i data-lucide="video" class="w-3.5 h-3.5 text-cyan-400"></i>
                  LIVE EDGE AI TACTICAL VISION STREAM
                </span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
                  ● LIVE FEED
                </span>
              </div>

              <!-- Stream Mode Switcher -->
              <div class="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
                <button id="btn-mode-optical" class="px-2 py-1 rounded transition-colors ${state.visionMode === "optical" ? "bg-cyan-600 text-white font-bold" : "text-slate-400 hover:text-white"}">
                  4K Optical AI
                </button>
                <button id="btn-mode-thermal" class="px-2 py-1 rounded transition-colors ${state.visionMode === "thermal" ? "bg-red-600 text-white font-bold" : "text-slate-400 hover:text-white"}">
                  Thermal IR
                </button>
                <button id="btn-mode-undercarriage" class="px-2 py-1 rounded transition-colors ${state.visionMode === "undercarriage" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:text-white"}">
                  Rover Under-Carriage
                </button>
              </div>
            </div>

            <!-- Canvas Container -->
            <div class="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
              <canvas id="tactical-vision-canvas" width="640" height="340" class="w-full h-auto block"></canvas>
            </div>
          </div>

          <!-- Real-Time IMS / Raman Spectrogram Chart -->
          <div class="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  <i data-lucide="activity" class="w-3.5 h-3.5 text-amber-400"></i>
                  RAMAN & IMS SPECTROMETRY DECONVOLUTION
                </span>
                <span class="text-[10px] font-mono text-slate-400">Ion Mobility Drift Time Spectra</span>
              </div>
              <span class="text-[10px] font-mono text-emerald-400 font-bold">FORENSIC MATCH: 96.4%</span>
            </div>

            <div class="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
              <canvas id="spectrogram-canvas" width="640" height="180" class="w-full h-auto block"></canvas>
            </div>
          </div>
        </div>

        <!-- Right: Incident Dossier & Action Dispatch (5 cols) -->
        <div class="lg:col-span-5 space-y-4">
          <!-- Active Incident Selector Card -->
          <div class="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
              <span class="text-xs font-mono font-bold text-white">INCIDENT THREAT DOSSIER</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded ${
                inc?.severity === "CRITICAL" 
                  ? "bg-red-500/20 text-red-300 border border-red-500/40" 
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              }">
                ${inc ? inc.severity : "STANDBY"}
              </span>
            </div>

            ${inc ? `
              <div class="space-y-2 text-xs">
                <div class="flex items-center justify-between text-slate-400 font-mono">
                  <span>Incident ID:</span>
                  <span class="text-white font-bold">${inc.id}</span>
                </div>
                <div class="flex items-center justify-between text-slate-400 font-mono">
                  <span>Threat Category:</span>
                  <span class="${inc.threatCategory === "EXPLOSIVE" ? "text-red-400 font-bold" : "text-amber-400 font-bold"}">
                    ${inc.threatCategory}
                  </span>
                </div>
                <div class="p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                  <div class="text-slate-400 text-[10px]">Identified Compound:</div>
                  <div class="text-white font-bold text-sm mt-0.5">${inc.identifiedSubstance}</div>
                </div>

                <div class="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div class="p-2 rounded bg-slate-950 border border-slate-800">
                    <span class="text-slate-500 block">Confidence:</span>
                    <span class="text-emerald-400 font-bold text-sm">${inc.confidenceScore}%</span>
                  </div>
                  <div class="p-2 rounded bg-slate-950 border border-slate-800">
                    <span class="text-slate-500 block">Location:</span>
                    <span class="text-slate-200 font-bold text-xs truncate block">${inc.locationName}</span>
                  </div>
                </div>

                <!-- Associated Entity Tracking -->
                ${inc.associatedEntity ? `
                  <div class="p-2.5 rounded bg-slate-950 border border-slate-800/90 text-[11px] font-mono space-y-1">
                    <span class="text-cyan-400 font-bold">ASSOCIATED PHYSICAL TARGET:</span>
                    <div class="text-slate-200">${inc.associatedEntity.description}</div>
                    <div class="text-slate-500 text-[10px]">Type: ${inc.associatedEntity.type} • AI Visual Confidence: ${Math.round(inc.associatedEntity.confidence * 100)}%</div>
                  </div>
                ` : ""}

                <!-- Verification Status -->
                <div class="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span class="text-slate-400">Status:</span>
                  <span class="font-bold ${inc.status === "SECONDARY_VERIFIED" ? "text-emerald-400" : "text-amber-400"}">
                    ${inc.status}
                  </span>
                </div>

                ${inc.handheldVerification ? `
                  <div class="p-2.5 rounded bg-emerald-950/20 border border-emerald-500/40 text-[11px] font-mono text-emerald-300">
                    <div class="font-bold">✔ RPF SECONDARY SWAB CONFIRMED</div>
                    <div>Officer: ${inc.handheldVerification.officerId}</div>
                    <div>Result: ${inc.handheldVerification.swabResult}</div>
                    <div class="text-[10px] text-slate-400 mt-1">Audit Ledger Hash: ${inc.handheldVerification.blockchainHash.slice(0, 24)}...</div>
                  </div>
                ` : `
                  <!-- RPF Secondary Action Button -->
                  <button id="btn-open-verify-modal" class="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs shadow-lg shadow-red-950/60 transition-colors flex items-center justify-center gap-1.5">
                    <i data-lucide="shield-check" class="w-4 h-4"></i>
                    <span>Execute RPF Handheld Secondary Swab Verification</span>
                  </button>
                `}
              </div>
            ` : `
              <p class="text-xs text-slate-400 font-mono">No active incidents selected.</p>
            `}
          </div>

          <!-- All Live Incidents Feed -->
          <div class="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-2">
            <div class="text-xs font-mono font-bold text-slate-400 uppercase">
              ACTIVE DETECTIONS & ALERTS (${state.incidents.length})
            </div>

            <div class="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              ${state.incidents.map(i => `
                <div
                  onclick="window.selectIncident('${i.id}')"
                  class="p-2 rounded-lg border cursor-pointer transition-all ${
                    state.selectedIncident?.id === i.id 
                      ? "bg-slate-800 border-cyan-500 shadow-md shadow-cyan-500/10" 
                      : "bg-slate-950/60 border-slate-800 hover:bg-slate-900"
                  }"
                >
                  <div class="flex items-center justify-between text-[11px] font-mono">
                    <span class="font-bold ${i.severity === "CRITICAL" ? "text-red-400" : "text-amber-400"}">${i.id}</span>
                    <span class="text-slate-400">${i.confidenceScore}%</span>
                  </div>
                  <div class="text-xs text-white truncate font-medium mt-0.5">${i.identifiedSubstance}</div>
                  <div class="text-[10px] text-slate-500 font-mono truncate">${i.locationName}</div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Mount Station SVG Heatmap Component
  const heatmapRoot = document.getElementById("station-heatmap-root");
  if (heatmapRoot) {
    renderStationHeatmapComponent(heatmapRoot);
  }

  // Attach canvas renderers
  renderTacticalVisionCanvas();
  renderSpectrogramCanvas();

  // Attach mode switcher buttons
  const btnOpt = document.getElementById("btn-mode-optical");
  const btnThm = document.getElementById("btn-mode-thermal");
  const btnUnd = document.getElementById("btn-mode-undercarriage");

  if (btnOpt) btnOpt.onclick = () => { state.visionMode = "optical"; renderTacticalVisionCanvas(); };
  if (btnThm) btnThm.onclick = () => { state.visionMode = "thermal"; renderTacticalVisionCanvas(); };
  if (btnUnd) btnUnd.onclick = () => { state.visionMode = "undercarriage"; renderTacticalVisionCanvas(); };

  // Attach verify modal open
  const btnVerify = document.getElementById("btn-open-verify-modal");
  if (btnVerify && inc) {
    btnVerify.onclick = () => openVerifyModal(inc);
  }
}

// Global hook to select incident
window.selectIncident = function(id) {
  const target = state.incidents.find(i => i.id === id);
  if (target) {
    state.selectedIncident = target;
    renderActiveTab();
    showToast(`Focused on Incident ${id} [${target.identifiedSubstance}]`, target.severity === "CRITICAL");
  }
};

// ==========================================
// TAB 2: HARDWARE FLEET MANAGER
// ==========================================
function renderFleetManager(container) {
  container.innerHTML = `
    <div class="space-y-4">
      <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-base font-bold text-white font-['Chakra_Petch']">
            GARUD IOT HARDWARE FLEET TELEMETRY REGISTRY
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            Real-time status of deployed Fixed Sniffer Nodes, Handheld Scanners, and Autonomous Quadruped Rovers
          </p>
        </div>
        <div class="flex items-center gap-2 font-mono text-xs text-emerald-400">
          <i data-lucide="radio" class="w-4 h-4"></i>
          <span>ALL ${state.devices.length} NODES ACTIVE (MESH ONLINE)</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${state.devices.map(dev => `
          <div class="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <span class="text-xs font-mono font-bold text-cyan-400">${dev.id}</span>
                <h4 class="text-xs font-bold text-white mt-0.5">${dev.name}</h4>
              </div>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ${dev.status}
              </span>
            </div>

            <div class="space-y-1.5 text-xs font-mono text-slate-300">
              <div class="flex justify-between">
                <span class="text-slate-500">Node Type:</span>
                <span class="text-white font-semibold">${dev.type}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Location:</span>
                <span class="text-slate-300 truncate max-w-[180px]">${dev.location}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Zone:</span>
                <span class="text-white">${dev.zone}</span>
              </div>

              ${dev.batteryPercentage !== undefined ? `
                <div class="pt-1">
                  <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-slate-500">Battery Level:</span>
                    <span class="text-emerald-400 font-bold">${dev.batteryPercentage}%</span>
                  </div>
                  <div class="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div class="bg-emerald-500 h-full rounded-full" style="width: ${dev.batteryPercentage}%"></div>
                  </div>
                </div>
              ` : ""}

              ${dev.sensors ? `
                <div class="pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                  <span class="text-slate-500 block">Sensor Array:</span>
                  <div class="flex flex-wrap gap-1 mt-1">
                    ${dev.sensors.map(s => `
                      <span class="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">${s}</span>
                    `).join("")}
                  </div>
                </div>
              ` : ""}
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

// ==========================================
// TAB 3: SENSOR FUSION SIMULATOR
// ==========================================
function renderSensorFusion(container) {
  const { chemicalVaporPpm, thermalDeltaC, opticalConfidence, radiationCpm } = state.scoringInputs;

  // Local calculation based on published formula
  const chemScore = Math.min(100, (chemicalVaporPpm / 20) * 100) * 0.40;
  const optScore = (opticalConfidence * 100) * 0.25;
  const thmScore = Math.min(100, (thermalDeltaC / 25) * 100) * 0.20;
  const radScore = Math.min(100, (radiationCpm / 150) * 100) * 0.15;
  const totalScore = Math.round((chemScore + optScore + thmScore + radScore) * 10) / 10;
  const severity = totalScore >= 75 ? "CRITICAL" : totalScore >= 45 ? "ELEVATED" : "BASELINE";

  container.innerHTML = `
    <div class="space-y-4">
      <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-base font-bold text-white font-['Chakra_Petch']">
            MULTI-SENSOR FUSION & 0-100 THREAT CONFIDENCE ENGINE
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            Mathematically deconvolutes Chemical VOCs, AI Vision, Thermal IR, and Scintillation to eliminate single-sensor false alarms
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <!-- Sliders Form (7 cols) -->
        <div class="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <h3 class="text-xs font-mono font-bold text-cyan-400 uppercase">
            LIVE SENSOR INPUT CHANNELS
          </h3>

          <div class="space-y-4 text-xs font-mono">
            <!-- 1. Chemical VOC -->
            <div class="space-y-1.5">
              <div class="flex justify-between">
                <span class="text-slate-300">1. Chemical Vapor / Nitro-Trace (Weight 40%)</span>
                <span class="text-cyan-400 font-bold">${chemicalVaporPpm} ppm</span>
              </div>
              <input type="range" min="0" max="25" step="0.5" value="${chemicalVaporPpm}" id="slider-chem" class="w-full accent-cyan-500" />
            </div>

            <!-- 2. Optical Vision -->
            <div class="space-y-1.5">
              <div class="flex justify-between">
                <span class="text-slate-300">2. YOLOv8 Visual Bounding Box AI (Weight 25%)</span>
                <span class="text-cyan-400 font-bold">${Math.round(opticalConfidence * 100)}%</span>
              </div>
              <input type="range" min="0" max="1" step="0.02" value="${opticalConfidence}" id="slider-opt" class="w-full accent-cyan-500" />
            </div>

            <!-- 3. Thermal Delta -->
            <div class="space-y-1.5">
              <div class="flex justify-between">
                <span class="text-slate-300">3. Thermal IR Exothermic Differential ΔT (Weight 20%)</span>
                <span class="text-cyan-400 font-bold">+${thermalDeltaC} °C</span>
              </div>
              <input type="range" min="0" max="30" step="0.5" value="${thermalDeltaC}" id="slider-thm" class="w-full accent-cyan-500" />
            </div>

            <!-- 4. Radiation Scintillator -->
            <div class="space-y-1.5">
              <div class="flex justify-between">
                <span class="text-slate-300">4. Gamma / Neutron Scintillation (Weight 15%)</span>
                <span class="text-cyan-400 font-bold">${radiationCpm} CPM</span>
              </div>
              <input type="range" min="10" max="200" step="5" value="${radiationCpm}" id="slider-rad" class="w-full accent-cyan-500" />
            </div>
          </div>
        </div>

        <!-- Output Score Card (5 cols) -->
        <div class="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <span class="text-xs font-mono text-slate-400 uppercase">COMPOSITE THREAT CONFIDENCE SCORE</span>
            <div class="mt-2 text-4xl font-bold font-mono ${
              severity === "CRITICAL" ? "text-red-400" : severity === "ELEVATED" ? "text-amber-400" : "text-emerald-400"
            }">
              ${totalScore} <span class="text-base text-slate-400 font-normal">/ 100</span>
            </div>
            <div class="mt-1 text-xs font-mono font-bold ${
              severity === "CRITICAL" ? "text-red-400" : severity === "ELEVATED" ? "text-amber-400" : "text-emerald-400"
            }">
              SEVERITY LEVEL: ${severity}
            </div>
          </div>

          <div class="space-y-2 text-[11px] font-mono text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div class="font-bold text-slate-400">MATHEMATICAL BREAKDOWN:</div>
            <div class="flex justify-between">
              <span>Chemical Contribution (40%):</span>
              <span class="text-white">${chemScore.toFixed(1)} pts</span>
            </div>
            <div class="flex justify-between">
              <span>Optical Vision (25%):</span>
              <span class="text-white">${optScore.toFixed(1)} pts</span>
            </div>
            <div class="flex justify-between">
              <span>Thermal Exothermic (20%):</span>
              <span class="text-white">${thmScore.toFixed(1)} pts</span>
            </div>
            <div class="flex justify-between">
              <span>Radiation Scintillator (15%):</span>
              <span class="text-white">${radScore.toFixed(1)} pts</span>
            </div>
          </div>

          <div class="p-3 rounded-lg bg-slate-950 border border-cyan-500/40 text-xs font-mono text-cyan-300">
            <strong>Decision Rule:</strong> ${
              severity === "CRITICAL" 
                ? "RED ALERT: Immediate RPF intercept and automated BDS alert triggered." 
                : severity === "ELEVATED" 
                  ? "AMBER ALERT: Cue nearest GARUD Handheld officer for secondary trace swab confirmation." 
                  : "BASELINE: Normal background environmental fluctuations. 0 action required."
            }
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach slider listeners
  const sChem = document.getElementById("slider-chem");
  const sOpt = document.getElementById("slider-opt");
  const sThm = document.getElementById("slider-thm");
  const sRad = document.getElementById("slider-rad");

  if (sChem) sChem.oninput = (e) => { state.scoringInputs.chemicalVaporPpm = parseFloat(e.target.value); renderSensorFusion(container); };
  if (sOpt) sOpt.oninput = (e) => { state.scoringInputs.opticalConfidence = parseFloat(e.target.value); renderSensorFusion(container); };
  if (sThm) sThm.oninput = (e) => { state.scoringInputs.thermalDeltaC = parseFloat(e.target.value); renderSensorFusion(container); };
  if (sRad) sRad.oninput = (e) => { state.scoringInputs.radiationCpm = parseFloat(e.target.value); renderSensorFusion(container); };
}

// ==========================================
// TAB 4: TAMPER-PROOF EVIDENCE LEDGER
// ==========================================
async function renderEvidenceLedger(container) {
  let ledgerData = { ledger: [], currentMerkleRoot: "f891a2c89b..." };
  try {
    ledgerData = await API.getLedger();
  } catch (err) {
    console.error(err);
  }

  container.innerHTML = `
    <div class="space-y-4">
      <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-base font-bold text-white font-['Chakra_Petch']">
            IMMUTABLE SHA-256 FORENSIC AUDIT LEDGER (INDIAN EVIDENCE ACT §65B)
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            Cryptographically sealed blocks for court-admissible narcotics & explosive evidence verification
          </p>
        </div>

        <button id="btn-simulate-tamper" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold shadow-lg transition-colors">
          <i data-lucide="alert-triangle" class="w-3.5 h-3.5"></i>
          <span>Simulate Illegal Log Tampering</span>
        </button>
      </div>

      <div class="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono">
        <span class="text-slate-400">Current Cryptographic Merkle Root:</span>
        <span class="text-emerald-400 font-bold">${ledgerData.currentMerkleRoot}</span>
      </div>

      <!-- Chronological Blocks -->
      <div class="space-y-3">
        ${ledgerData.ledger.map((block, idx) => {
          const isTampered = state.tamperedBlock === block.blockNumber;
          return `
            <div class="p-4 rounded-xl border transition-all ${
              isTampered 
                ? "bg-red-950/40 border-red-500 shadow-xl shadow-red-500/20" 
                : "bg-slate-900/90 border-slate-800"
            }">
              <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <span class="text-xs font-mono font-bold text-cyan-400">BLOCK #${block.blockNumber} • ${block.incidentId}</span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded ${
                  isTampered 
                    ? "bg-red-500 text-white font-bold animate-pulse" 
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                }">
                  ${isTampered ? "🚨 TAMPERING DETECTED: HASH MISMATCH" : "VERIFIED TAMPER-EVIDENT"}
                </span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs font-mono">
                <div>
                  <div class="text-slate-400 text-[10px]">Identified Contraband / Explosive:</div>
                  <div class="text-white font-bold text-sm mt-0.5">${block.substance}</div>
                  <div class="text-slate-500 text-[11px] mt-1">Location: ${block.location}</div>
                </div>

                <div class="space-y-1 bg-slate-950 p-2.5 rounded border border-slate-800/80 text-[11px]">
                  <div class="text-slate-400 truncate">Previous Hash: <span class="text-slate-500">${block.previousHash.slice(0, 24)}...</span></div>
                  <div class="text-emerald-400 truncate font-bold">Block Hash: ${isTampered ? "INVALID_HASH_COMPROMISED" : block.hash}</div>
                  <div class="text-indigo-400 truncate text-[10px]">ECDSA Signature: ${block.verifiedSignature}</div>
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;

  const btnTamper = document.getElementById("btn-simulate-tamper");
  if (btnTamper) {
    btnTamper.onclick = () => {
      state.tamperedBlock = state.tamperedBlock ? null : 2; // toggle Block 2
      showToast(state.tamperedBlock ? "🚨 Forensic Alert: Block #2 contents altered! Hash validation failed." : "✔ Ledger recalculated & cryptographic consensus restored.");
      renderEvidenceLedger(container);
    };
  }
}

// ==========================================
// TAB 5: MICROSERVICES ARCHITECTURE
// ==========================================
async function renderMicroservices(container) {
  let metrics = { throughputRequestsPerSec: 1240, p99ResponseLatencyMs: 14.8, cacheHitRate: "96.4%", networkUptime: "99.994%" };
  try {
    const res = await API.getMetrics();
    if (res.metrics) metrics = res.metrics;
  } catch (err) {
    console.error(err);
  }

  container.innerHTML = `
    <div class="space-y-4">
      <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-base font-bold text-white font-['Chakra_Petch']">
            HIGH-TRAFFIC MICROSERVICES TOPOLOGY (KUBERNETES)
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            Engineered to scale across 7,300+ stations, 13,000+ trains, and commuter peak hours
          </p>
        </div>

        <button id="btn-burst" class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 text-white text-xs font-semibold shadow-lg">
          <i data-lucide="zap" class="w-3.5 h-3.5"></i>
          <span>Simulate 5,000 Req/s Burst</span>
        </button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div class="text-slate-400 text-xs font-mono">Throughput</div>
          <div class="text-xl font-bold font-mono text-white mt-1">${metrics.throughputRequestsPerSec} req/sec</div>
          <div class="text-[10px] text-emerald-400 font-mono mt-0.5">Active Ingestion</div>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div class="text-slate-400 text-xs font-mono">p99 Latency</div>
          <div class="text-xl font-bold font-mono text-emerald-400 mt-1">${metrics.p99ResponseLatencyMs} ms</div>
          <div class="text-[10px] text-slate-400 font-mono mt-0.5">Target: &lt;20ms</div>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div class="text-slate-400 text-xs font-mono">Cache Hit Rate</div>
          <div class="text-xl font-bold font-mono text-purple-300 mt-1">${metrics.cacheHitRate}</div>
          <div class="text-[10px] text-slate-400 font-mono mt-0.5">Redis Cluster</div>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div class="text-slate-400 text-xs font-mono">Uptime</div>
          <div class="text-xl font-bold font-mono text-blue-300 mt-1">${metrics.networkUptime}</div>
          <div class="text-[10px] text-slate-400 font-mono mt-0.5">High-Availability HA</div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="p-4 rounded-xl border border-cyan-500/40 bg-cyan-950/20 space-y-2">
          <div class="text-xs font-bold text-white">API Gateway & Ingress Mesh</div>
          <div class="text-[11px] text-slate-300">TLS Termination & Rate Limiting</div>
          <div class="text-[10px] font-mono text-cyan-400 bg-slate-950/80 p-1.5 rounded">Tech: Kong + Envoy Proxy • 4 Pods</div>
        </div>
        <div class="p-4 rounded-xl border border-blue-500/40 bg-blue-950/20 space-y-2">
          <div class="text-xs font-bold text-white">Sensor Ingestion Service</div>
          <div class="text-[11px] text-slate-300">High-Throughput Telemetry Buffer</div>
          <div class="text-[10px] font-mono text-blue-400 bg-slate-950/80 p-1.5 rounded">Tech: gRPC + Kafka Stream • 6 Pods</div>
        </div>
        <div class="p-4 rounded-xl border border-amber-500/40 bg-amber-950/20 space-y-2">
          <div class="text-xs font-bold text-white">Sensor Fusion Engine</div>
          <div class="text-[11px] text-slate-300">0-100 Multi-Sensor Confidence</div>
          <div class="text-[10px] font-mono text-amber-400 bg-slate-950/80 p-1.5 rounded">Tech: Quantized TensorRT • 4 Pods</div>
        </div>
      </div>
    </div>
  `;

  const btnBurst = document.getElementById("btn-burst");
  if (btnBurst) {
    btnBurst.onclick = () => {
      showToast("Injecting burst: 5,000 req/sec from 400 Indian Railway nodes...");
      setTimeout(() => {
        showToast("✔ Traffic handled! Autoscaler spun 4 new pods. p99 held at 16.2ms.");
      }, 1500);
    };
  }
}

// ==========================================
// TAB 6: CI/CD PIPELINE
// ==========================================
function renderCicd(container) {
  container.innerHTML = `
    <div class="space-y-4">
      <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-base font-bold text-white font-['Chakra_Petch']">
            AUTOMATED CI/CD PIPELINE & DEVOPS LIFECYCLE
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            Continuous integration and edge deployment pipeline with container security scans
          </p>
        </div>

        <button id="btn-run-pipeline" class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg">
          <i data-lucide="play" class="w-3.5 h-3.5"></i>
          <span>Trigger Automated CI/CD Run</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div class="p-3.5 rounded-xl border border-emerald-500/40 bg-slate-900/80">
          <div class="text-[10px] font-mono text-slate-400">STAGE 01</div>
          <div class="text-xs font-bold text-white mt-1">Lint & Static Check</div>
          <div class="text-[10px] text-emerald-400 font-mono mt-2">✔ Passed (18s)</div>
        </div>
        <div class="p-3.5 rounded-xl border border-emerald-500/40 bg-slate-900/80">
          <div class="text-[10px] font-mono text-slate-400">STAGE 02</div>
          <div class="text-xs font-bold text-white mt-1">Sensor Fusion Test</div>
          <div class="text-[10px] text-emerald-400 font-mono mt-2">✔ Passed (45s)</div>
        </div>
        <div class="p-3.5 rounded-xl border border-emerald-500/40 bg-slate-900/80">
          <div class="text-[10px] font-mono text-slate-400">STAGE 03</div>
          <div class="text-xs font-bold text-white mt-1">Distroless Docker</div>
          <div class="text-[10px] text-emerald-400 font-mono mt-2">✔ 48 MB (1m 12s)</div>
        </div>
        <div class="p-3.5 rounded-xl border border-emerald-500/40 bg-slate-900/80">
          <div class="text-[10px] font-mono text-slate-400">STAGE 04</div>
          <div class="text-xs font-bold text-white mt-1">Trivy Vulnerability</div>
          <div class="text-[10px] text-emerald-400 font-mono mt-2">✔ 0 CVEs (32s)</div>
        </div>
        <div class="p-3.5 rounded-xl border border-emerald-500/40 bg-slate-900/80">
          <div class="text-[10px] font-mono text-slate-400">STAGE 05</div>
          <div class="text-xs font-bold text-white mt-1">Canary K8s Rollout</div>
          <div class="text-[10px] text-emerald-400 font-mono mt-2">✔ Promoted 100%</div>
        </div>
      </div>

      <div class="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-1 text-slate-300">
        <div class="text-slate-500">[INFO] Checking 142 modules across Indian Railways microservices...</div>
        <div class="text-emerald-400 font-semibold">[SUCCESS] 0 errors. Test coverage: 94.8%</div>
        <div class="text-slate-300">[TEST] Multi-sensor fusion deconvolution benchmarks: passed (actual: 96.4%).</div>
        <div class="text-cyan-300">[DOCKER] Image: asia.gcr.io/garud-rail/edge-api:v2.4.0 (Distroless non-root UID 10001)</div>
        <div class="text-emerald-400 font-bold pt-2 border-t border-slate-900">
          ✔ PIPELINE SUCCESS: All 5 stages finished in 3m 05s. Edge nodes synchronized.
        </div>
      </div>
    </div>
  `;

  const btnRun = document.getElementById("btn-run-pipeline");
  if (btnRun) {
    btnRun.onclick = () => {
      showToast("Executing automated CI/CD pipeline tests...");
      setTimeout(() => {
        showToast("✔ Pipeline passed! Distroless container deployed with 0 downtime.");
      }, 1500);
    };
  }
}

// ==========================================
// TAB 7: OPENAPI 3.1 REST API DOCS
// ==========================================
function renderApiDocs(container) {
  container.innerHTML = `
    <div class="space-y-4">
      <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-base font-bold text-white font-['Chakra_Petch']">
            INTERACTIVE OPENAPI 3.1 REST API EXPLORER
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            Test live endpoints directly on the running Node.js + Express backend
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">GET</span>
            <code class="text-xs font-mono text-white">/api/health</code>
          </div>
          <p class="text-xs text-slate-300">Returns cluster health, microservice replicas, and node uptime.</p>
          <button onclick="window.testApiEndpoint('/api/health')" class="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs">
            Execute Call
          </button>
        </div>

        <div class="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">GET</span>
            <code class="text-xs font-mono text-white">/api/devices</code>
          </div>
          <p class="text-xs text-slate-300">Lists all registered Fixed Nodes, Handhelds, and Quadruped Rovers.</p>
          <button onclick="window.testApiEndpoint('/api/devices')" class="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs">
            Execute Call
          </button>
        </div>

        <div class="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">GET</span>
            <code class="text-xs font-mono text-white">/api/evidence/ledger</code>
          </div>
          <p class="text-xs text-slate-300">Fetches chronological SHA-256 evidence blocks and Merkle root.</p>
          <button onclick="window.testApiEndpoint('/api/evidence/ledger')" class="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs">
            Execute Call
          </button>
        </div>

        <div class="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">GET</span>
            <code class="text-xs font-mono text-white">/api/microservices/metrics</code>
          </div>
          <p class="text-xs text-slate-300">Fetches throughput, p99 latencies, and cache metrics.</p>
          <button onclick="window.testApiEndpoint('/api/microservices/metrics')" class="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs">
            Execute Call
          </button>
        </div>
      </div>

      <!-- Live Output Console -->
      <div class="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
        <div class="text-xs font-mono text-slate-400 font-bold">RESPONSE CONSOLE:</div>
        <pre id="api-output-pre" class="text-[11px] font-mono text-slate-200 overflow-x-auto max-h-56 p-2 bg-slate-900/60 rounded">Click "Execute Call" on any endpoint above to test the live Node.js Express backend.</pre>
      </div>
    </div>
  `;
}

window.testApiEndpoint = async function(path) {
  const pre = document.getElementById("api-output-pre");
  if (!pre) return;
  pre.innerText = `Sending request to ${path}...`;
  try {
    const start = performance.now();
    const res = await fetch(path);
    const data = await res.json();
    const end = performance.now();
    pre.innerText = `HTTP ${res.status} OK (Latency: ${Math.round(end - start)} ms)\n\n` + JSON.stringify(data, null, 2);
  } catch (err) {
    pre.innerText = `Error: ${err.message}`;
  }
};

// ==========================================
// MODALS LOGIC
// ==========================================
function openVerifyModal(incident) {
  const modal = document.getElementById("verify-modal");
  if (!modal) return;
  modal.classList.remove("hidden");

  document.getElementById("vm-incident-id").innerText = incident.id;
  document.getElementById("vm-substance").innerText = incident.identifiedSubstance;
  document.getElementById("vm-location").innerText = incident.locationName;

  const form = document.getElementById("verify-form");
  form.onsubmit = async (e) => {
    e.preventDefault();
    const officerId = document.getElementById("vm-officer-id").value;
    const swabResult = document.getElementById("vm-swab-result").value;
    const actionTaken = document.getElementById("vm-action-taken").value;

    try {
      const res = await API.verifyAlert(incident.id, {
        rpfOfficerId: officerId,
        swabResult,
        actionTaken,
        status: "SECONDARY_VERIFIED"
      });
      if (res.incident) {
        state.incidents = state.incidents.map(i => i.id === incident.id ? res.incident : i);
        state.selectedIncident = res.incident;
        modal.classList.add("hidden");
        showToast(`✔ Incident ${incident.id} verified by ${officerId} and sealed to SHA-256 blockchain ledger!`);
        renderActiveTab();
      }
    } catch (err) {
      showToast("Failed to commit verification", true);
    }
  };
}

// Threat Simulation Modal Setup
function setupModals() {
  // Verify modal close
  const btnCloseVerify = document.getElementById("btn-close-verify");
  if (btnCloseVerify) {
    btnCloseVerify.onclick = () => {
      document.getElementById("verify-modal").classList.add("hidden");
    };
  }

  // Simulate Threat modal
  const btnOpenSim = document.getElementById("btn-open-simulate");
  const modalSim = document.getElementById("simulate-modal");
  const btnCloseSim = document.getElementById("btn-close-simulate");

  if (btnOpenSim && modalSim) {
    btnOpenSim.onclick = () => modalSim.classList.remove("hidden");
  }
  if (btnCloseSim && modalSim) {
    btnCloseSim.onclick = () => modalSim.classList.add("hidden");
  }

  const simForm = document.getElementById("simulate-form");
  if (simForm) {
    simForm.onsubmit = async (e) => {
      e.preventDefault();
      const threatCategory = document.getElementById("sim-category").value;
      const identifiedSubstance = document.getElementById("sim-substance").value;
      const locationName = document.getElementById("sim-location").value;
      const description = document.getElementById("sim-description").value;
      const deviceId = document.getElementById("sim-device").value;

      try {
        const res = await API.simulateThreat({
          threatCategory,
          identifiedSubstance,
          locationName,
          deviceId,
          confidenceScore: threatCategory === "EXPLOSIVE" ? 96.8 : 88.4,
          severity: "CRITICAL",
          associatedEntity: {
            type: "UNATTENDED_LUGGAGE",
            description,
            visualBoundingBox: [100, 150, 300, 420],
            confidence: 0.95
          }
        });

        if (res.incident) {
          state.incidents.unshift(res.incident);
          state.selectedIncident = res.incident;
          modalSim.classList.add("hidden");
          showToast(`🚨 Simulated Threat Generated: ${res.incident.identifiedSubstance} at ${res.incident.locationName}`);
          updateNavbarBadges();
          renderActiveTab();
        }
      } catch (err) {
        showToast("Simulation dispatch error", true);
      }
    };
  }

  // Offline toggle switch
  const toggleOffline = document.getElementById("toggle-offline");
  if (toggleOffline) {
    toggleOffline.onchange = (e) => {
      state.isOfflineMode = e.target.checked;
      const statusText = document.getElementById("offline-status-text");
      if (statusText) {
        statusText.innerText = state.isOfflineMode ? "OFFLINE (IndexedDB Active)" : "ONLINE (Live Mesh)";
        statusText.className = state.isOfflineMode ? "text-amber-400 font-bold" : "text-emerald-400 font-bold";
      }
      showToast(state.isOfflineMode ? "Switched to OFFLINE MODE: Events stored in browser IndexedDB." : "Reconnected ONLINE: Live network synchronization active.");
      loadInitialData();
    };
  }

  // Sync button
  const btnSync = document.getElementById("btn-sync-offline");
  if (btnSync) {
    btnSync.onclick = async () => {
      showToast("Synchronizing local IndexedDB cache with Central Indian Railways Node...");
      try {
        const res = await API.syncOffline("GARUD-HH-01");
        showToast(`✔ ${res.message || "Offline events synchronized!"}`);
        state.isOfflineMode = false;
        if (toggleOffline) toggleOffline.checked = false;
        loadInitialData();
      } catch (err) {
        showToast("Sync failed", true);
      }
    };
  }

  // Tab navigation clicks
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach(btn => {
    btn.onclick = () => {
      const tab = btn.getAttribute("data-tab");
      if (tab) switchTab(tab);
    };
  });
}

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  setupModals();
  loadInitialData();
  createIcons({ icons });

  // Periodic poll for updates if online
  setInterval(() => {
    if (!state.isOfflineMode) {
      loadInitialData(false);
    }
  }, 10000);
});
