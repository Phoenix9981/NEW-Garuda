// ============================================================================
// GARUD YANTRA - REAL-TIME RPF PATROL COVERAGE HEATMAP & STATION FLOOR PLAN
// Architectural SVG Blueprint, Dynamic Density Gradients, Smooth Motion & Telemetry
// ============================================================================

// State for the Heatmap Component
export const heatmapState = {
  activeLayer: {
    densityHeatmap: true,
    patrolTrails: true,
    sensorNodes: true,
    threatIncidents: true,
    tacticalGrid: true,
    blindspotHighlights: false
  },
  heatmapOpacity: 0.75,
  isSimulationPlaying: true,
  simulationSpeed: 1, // 1x, 2x, 4x
  selectedUnitId: "RPF-PATROL-01",
  hoveredZoneId: null,
  activeFilter: "ALL", // 'ALL' | 'HUMAN' | 'ROBOT' | 'K9'

  // Patrol Units with waypoint paths for smooth interpolation
  patrolUnits: [
    {
      id: "RPF-PATROL-01",
      callsign: "Team Alpha (Insp. V. Kumar)",
      shortName: "RPF Alpha",
      type: "HUMAN_RPF",
      badge: "RPF-7749",
      color: "#06b6d4", // Cyan
      zoneId: "Z-PF1",
      zoneName: "Platform 1 Concourse South",
      deviceId: "GARUD-HH-01",
      battery: 92,
      speedKmh: 4.5,
      lastSniff: "RDX Nitro Alert (Secondary Confirmed)",
      sniffStatus: "ALERT",
      coveragePct: 96.5,
      // Patrol loop waypoints [x, y]
      waypoints: [
        [220, 88],
        [350, 88],
        [480, 88],
        [620, 88],
        [500, 88],
        [335, 120],
        [260, 140],
        [200, 100]
      ],
      currentIdx: 0,
      t: 0, // progress between currentIdx and (currentIdx + 1)
      currentPos: { x: 260, y: 95 },
      heading: 90,
      trail: []
    },
    {
      id: "GARUD-QP-01",
      callsign: "RAKSHAK-Q1 Quadruped Rover",
      shortName: "Rover Q1",
      type: "ROBOT_QUADRUPED",
      badge: "ROBOT-AI-01",
      color: "#818cf8", // Indigo
      zoneId: "Z-SIDING",
      zoneName: "Coach B-4 Exterior Siding Yard",
      deviceId: "GARUD-QP-01",
      battery: 84,
      speedKmh: 6.2,
      lastSniff: "ANFO Precursor Vapor Trace (Elevated)",
      sniffStatus: "ELEVATED",
      coveragePct: 98.2,
      waypoints: [
        [520, 455],
        [640, 455],
        [780, 455],
        [880, 455],
        [790, 435],
        [650, 435],
        [540, 445]
      ],
      currentIdx: 1,
      t: 0.3,
      currentPos: { x: 640, y: 455 },
      heading: 180,
      trail: []
    },
    {
      id: "RPF-PATROL-02",
      callsign: "Team Bravo (K9 Squad - ASI Rathore)",
      shortName: "K9 Bravo",
      type: "K9_SQUAD",
      badge: "K9-NDLS-04",
      color: "#10b981", // Emerald
      zoneId: "Z-PF23",
      zoneName: "Island Platform 2 & 3",
      deviceId: "GARUD-HH-02",
      battery: 89,
      speedKmh: 4.0,
      lastSniff: "Clean Air Baseline (0.05 ppm)",
      sniffStatus: "CLEAR",
      coveragePct: 91.8,
      waypoints: [
        [240, 220],
        [380, 220],
        [520, 220],
        [660, 220],
        [800, 220],
        [670, 220],
        [430, 220],
        [320, 220]
      ],
      currentIdx: 2,
      t: 0.6,
      currentPos: { x: 440, y: 220 },
      heading: 90,
      trail: []
    },
    {
      id: "RPF-PATROL-03",
      callsign: "Team Charlie (Station Marshall)",
      shortName: "Marshall Charlie",
      type: "HUMAN_RPF",
      badge: "RPF-8102",
      color: "#f59e0b", // Amber
      zoneId: "Z-HALLD",
      zoneName: "Waiting Hall Sector D & Food Court",
      deviceId: "GARUD-HH-03",
      battery: 78,
      speedKmh: 3.2,
      lastSniff: "Trace Organic Vapor Monitor",
      sniffStatus: "CLEAR",
      coveragePct: 88.4,
      waypoints: [
        [60, 330],
        [140, 330],
        [140, 420],
        [70, 420],
        [70, 370],
        [120, 370]
      ],
      currentIdx: 0,
      t: 0.8,
      currentPos: { x: 95, y: 360 },
      heading: 270,
      trail: []
    },
    {
      id: "RPF-PATROL-04",
      callsign: "Delta QRT (Quick Reaction Tactical Squad)",
      shortName: "Delta QRT",
      type: "TACTICAL_QRT",
      badge: "QRT-LEAD-09",
      color: "#ec4899", // Rose
      zoneId: "Z-PARCEL",
      zoneName: "North Parcel & Cargo Freight Yard",
      deviceId: "GARUD-HH-04",
      battery: 95,
      speedKmh: 1.5,
      lastSniff: "Clean Baseline (0.0 ppm)",
      sniffStatus: "CLEAR",
      coveragePct: 94.7,
      waypoints: [
        [840, 80],
        [930, 80],
        [930, 120],
        [850, 120],
        [740, 180],
        [740, 240],
        [740, 180]
      ],
      currentIdx: 3,
      t: 0.1,
      currentPos: { x: 880, y: 95 },
      heading: 0,
      trail: []
    }
  ],

  // Station Zones Definition
  zones: [
    {
      id: "Z-PF1",
      name: "Platform 1 & VIP Concourse",
      code: "PF-01",
      threat: "CRITICAL",
      densityPct: 96.4,
      sweepInterval: "2.4 min",
      activeUnits: ["RPF Alpha"],
      fixedNode: "GARUD-FN-01",
      description: "Primary concourse edge with high throughput passenger density. RDX detection active."
    },
    {
      id: "Z-CONCOURSE",
      name: "Main Concourse & Screening Gate 1-2",
      code: "MAIN-CC",
      threat: "CLEAR",
      densityPct: 94.8,
      sweepInterval: "3.1 min",
      activeUnits: ["RPF Alpha", "Marshall Charlie"],
      fixedNode: "GARUD-FN-01",
      description: "Central entry hall with dual X-ray scanners, turnstiles, and PID vapor sniffer."
    },
    {
      id: "Z-PF23",
      name: "Island Platform 2 & 3",
      code: "PF-2/3",
      threat: "CLEAR",
      densityPct: 91.5,
      sweepInterval: "4.2 min",
      activeUnits: ["K9 Bravo"],
      fixedNode: "GARUD-FN-02",
      description: "High-speed Rajdhani / Vande Bharat express platform with overhead thermal array."
    },
    {
      id: "Z-PF45",
      name: "Island Platform 4 & 5",
      code: "PF-4/5",
      threat: "CLEAR",
      densityPct: 86.2,
      sweepInterval: "5.0 min",
      activeUnits: ["Delta QRT"],
      fixedNode: "GARUD-FN-02",
      description: "Suburban and mail express platform connected by FOB North and FOB South."
    },
    {
      id: "Z-SIDING",
      name: "Coach B-4 Exterior Siding Yard",
      code: "SIDING-B4",
      threat: "ELEVATED",
      densityPct: 97.6,
      sweepInterval: "1.8 min",
      activeUnits: ["Rover Q1"],
      fixedNode: "GARUD-QP-01",
      description: "Track inspection yard. Quadruped rover active underframe scanning for magnetic anomalies."
    },
    {
      id: "Z-HALLD",
      name: "Waiting Hall Sector D & Food Court",
      code: "HALL-D",
      threat: "ELEVATED",
      densityPct: 88.4,
      sweepInterval: "4.5 min",
      activeUnits: ["Marshall Charlie"],
      fixedNode: "GARUD-FN-02",
      description: "Long-distance transit passenger hall. Opiate vapor trace under active monitoring."
    },
    {
      id: "Z-PARCEL",
      name: "North Parcel & Cargo Freight Yard",
      code: "PARCEL-N",
      threat: "CLEAR",
      densityPct: 93.1,
      sweepInterval: "3.6 min",
      activeUnits: ["Delta QRT"],
      fixedNode: "GARUD-FN-04",
      description: "Heavy cargo container holding bay and brake-van loading zone."
    },
    {
      id: "Z-FOB",
      name: "Foot Overbridges (North & South)",
      code: "FOB-1/2",
      threat: "CLEAR",
      densityPct: 90.2,
      sweepInterval: "3.5 min",
      activeUnits: ["K9 Bravo", "Delta QRT"],
      fixedNode: "GARUD-FN-02",
      description: "Dual passenger overbridge spans linking all 5 platforms across live track lines."
    }
  ],

  // Threat Incident Map Pins
  incidents: [
    {
      id: "INC-2026-0918-01",
      title: "RDX Nitro Anomaly",
      x: 320,
      y: 95,
      zone: "Platform 1 Entry Gates",
      severity: "CRITICAL",
      substance: "RDX / PETN",
      confidence: 96.4
    },
    {
      id: "INC-2026-0918-02",
      title: "ANFO Precursor Concealment",
      x: 680,
      y: 450,
      zone: "Coach B-4 Exterior Siding",
      severity: "ELEVATED",
      substance: "ANFO Compound",
      confidence: 78.2
    },
    {
      id: "INC-2026-0918-03",
      title: "Narcotic Scent Profile",
      x: 110,
      y: 380,
      zone: "Waiting Hall Sector D",
      severity: "ELEVATED",
      substance: "Opioid Derivative",
      confidence: 84.6
    }
  ],

  // Fixed Nodes
  fixedNodes: [
    { id: "GARUD-FN-01", name: "Concourse Main Gate", x: 100, y: 130, status: "ONLINE", radius: 55 },
    { id: "GARUD-FN-02", name: "Platform 3/4 Overhead", x: 440, y: 220, status: "ONLINE", radius: 50 },
    { id: "GARUD-FN-03", name: "FOB South Span", x: 336, y: 280, status: "ONLINE", radius: 45 },
    { id: "GARUD-FN-04", name: "Parcel North Gate", x: 885, y: 95, status: "ONLINE", radius: 48 }
  ]
};

// Animation loop reference
let animationFrameId = null;
let lastTimestamp = 0;

// Initialize patrol trails with starting points
heatmapState.patrolUnits.forEach(unit => {
  const [x, y] = unit.waypoints[0];
  unit.currentPos = { x, y };
  unit.trail = [
    { x: x - 10, y: y },
    { x: x - 5, y: y },
    { x: x, y: y }
  ];
});

// ============================================================================
// SVG GENERATOR: High-Tactical Architectural Station Blueprint & Density Mesh
// ============================================================================
export function generateStationFloorPlanSvg() {
  const s = heatmapState;
  const opacity = s.heatmapOpacity;

  return `
    <svg 
      id="station-floorplan-svg" 
      viewBox="0 0 1000 520" 
      class="w-full h-auto select-none overflow-hidden rounded-xl bg-slate-950/95 border border-slate-800 shadow-2xl transition-all duration-300"
      style="filter: drop-shadow(0 20px 30px rgba(2, 6, 23, 0.9));"
    >
      <defs>
        <!-- Gradients for Heatmap Coverage Density -->
        <radialGradient id="heat-high-emerald" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#10b981" stop-opacity="0.85" />
          <stop offset="35%" stop-color="#06b6d4" stop-opacity="0.6" />
          <stop offset="70%" stop-color="#3b82f6" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
        </radialGradient>

        <radialGradient id="heat-high-cyan" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.9" />
          <stop offset="40%" stop-color="#0284c7" stop-opacity="0.55" />
          <stop offset="75%" stop-color="#6366f1" stop-opacity="0.2" />
          <stop offset="100%" stop-color="#6366f1" stop-opacity="0" />
        </radialGradient>

        <radialGradient id="heat-rover-indigo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#818cf8" stop-opacity="0.9" />
          <stop offset="35%" stop-color="#6366f1" stop-opacity="0.6" />
          <stop offset="75%" stop-color="#4f46e5" stop-opacity="0.2" />
          <stop offset="100%" stop-color="#312e81" stop-opacity="0" />
        </radialGradient>

        <radialGradient id="heat-amber-moderate" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.8" />
          <stop offset="45%" stop-color="#d97706" stop-opacity="0.45" />
          <stop offset="80%" stop-color="#b45309" stop-opacity="0.15" />
          <stop offset="100%" stop-color="#78350f" stop-opacity="0" />
        </radialGradient>

        <!-- Sensor Node Coverage Gradient -->
        <radialGradient id="sensor-coverage-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.28" />
          <stop offset="60%" stop-color="#0284c7" stop-opacity="0.12" />
          <stop offset="100%" stop-color="#0369a1" stop-opacity="0" />
        </radialGradient>

        <!-- Threat Hazard Glow -->
        <radialGradient id="hazard-critical-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ef4444" stop-opacity="0.9" />
          <stop offset="40%" stop-color="#dc2626" stop-opacity="0.4" />
          <stop offset="100%" stop-color="#991b1b" stop-opacity="0" />
        </radialGradient>

        <!-- Glow Blur Filter for Heatmap and Radars -->
        <filter id="svg-heat-blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="14" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="svg-unit-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <!-- Background Hatch Pattern for Cold Blindspots -->
        <pattern id="cold-hatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="10" stroke="#f43f5e" stroke-width="1.2" stroke-opacity="0.25" />
        </pattern>

        <!-- Blueprint Tactical Grid Pattern -->
        <pattern id="tactical-grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="0.75" stroke-opacity="0.6" />
          <circle cx="40" cy="40" r="1" fill="#334155" />
        </pattern>

        <!-- Platform Yellow Safety Edge Pattern -->
        <pattern id="safety-edge" width="12" height="4" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="6" height="4" fill="#eab308" />
          <rect x="6" y="0" width="6" height="4" fill="#0f172a" />
        </pattern>
      </defs>

      <!-- LAYER 0: Background Blueprint Grid -->
      <rect width="1000" height="520" fill="#030712" />
      ${s.activeLayer.tacticalGrid ? `
        <rect width="1000" height="520" fill="url(#tactical-grid-pattern)" opacity="0.85" />
      ` : ""}

      <!-- Station Coordinate Labels & North Arrow -->
      <g opacity="0.4" class="text-[9px] font-mono fill-slate-500 select-none">
        <text x="14" y="22">LAT 28°38'35.1"N • LON 77°13'10.9"E</text>
        <text x="14" y="34">NDLS MAIN TERMINAL • ELEV 216m • RAKSHAK-AI GRID</text>
        <!-- North Compass -->
        <g transform="translate(965, 30)">
          <circle cx="0" cy="0" r="14" fill="none" stroke="#334155" stroke-width="1" />
          <path d="M 0 -11 L 3 2 L 0 0 L -3 2 Z" fill="#38bdf8" />
          <text x="0" y="-14" text-anchor="middle" font-size="8" fill="#38bdf8" font-weight="bold">N</text>
        </g>
      </g>

      <!-- ========================================================== -->
      <!-- LAYER 1: ARCHITECTURAL STATION FLOOR PLAN                  -->
      <!-- ========================================================== -->

      <!-- --- RAIL TRACKS & BALLAST BEDS --- -->
      <g id="tracks-group" class="opacity-90">
        <!-- Track Ballast Foundations -->
        <rect x="175" y="118" width="775" height="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <rect x="175" y="248" width="775" height="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <rect x="175" y="278" width="775" height="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <rect x="175" y="378" width="775" height="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <rect x="175" y="408" width="775" height="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
        <!-- Carriage Track Siding B-4 Ballast -->
        <rect x="490" y="445" width="460" height="20" fill="#090d16" stroke="#334155" stroke-width="1" stroke-dasharray="4,4" />

        <!-- Railway Sleepers (Wood/Concrete Ties) -->
        <line x1="175" y1="125" x2="950" y2="125" stroke="#334155" stroke-width="8" stroke-dasharray="2, 6" />
        <line x1="175" y1="255" x2="950" y2="255" stroke="#334155" stroke-width="8" stroke-dasharray="2, 6" />
        <line x1="175" y1="285" x2="950" y2="285" stroke="#334155" stroke-width="8" stroke-dasharray="2, 6" />
        <line x1="175" y1="385" x2="950" y2="385" stroke="#334155" stroke-width="8" stroke-dasharray="2, 6" />
        <line x1="175" y1="415" x2="950" y2="415" stroke="#334155" stroke-width="8" stroke-dasharray="2, 6" />
        <line x1="490" y1="455" x2="950" y2="455" stroke="#475569" stroke-width="10" stroke-dasharray="2, 8" />

        <!-- Steel Rail Lines (Dual Rails) -->
        <!-- Track 1: Platform 1 Down Line -->
        <line x1="175" y1="122" x2="950" y2="122" stroke="#64748b" stroke-width="1.8" />
        <line x1="175" y1="128" x2="950" y2="128" stroke="#64748b" stroke-width="1.8" />
        <!-- Track 2: Platform 2 Line -->
        <line x1="175" y1="252" x2="950" y2="252" stroke="#64748b" stroke-width="1.8" />
        <line x1="175" y1="258" x2="950" y2="258" stroke="#64748b" stroke-width="1.8" />
        <!-- Track 3: Platform 3 Line -->
        <line x1="175" y1="282" x2="950" y2="282" stroke="#64748b" stroke-width="1.8" />
        <line x1="175" y1="288" x2="950" y2="288" stroke="#64748b" stroke-width="1.8" />
        <!-- Track 4: Platform 4 Line -->
        <line x1="175" y1="382" x2="950" y2="382" stroke="#64748b" stroke-width="1.8" />
        <line x1="175" y1="388" x2="950" y2="388" stroke="#64748b" stroke-width="1.8" />
        <!-- Track 5: Platform 5 Line -->
        <line x1="175" y1="412" x2="950" y2="412" stroke="#64748b" stroke-width="1.8" />
        <line x1="175" y1="418" x2="950" y2="418" stroke="#64748b" stroke-width="1.8" />
        <!-- Track Siding B-4 (Underframe Inspection Line) -->
        <line x1="490" y1="452" x2="950" y2="452" stroke="#94a3b8" stroke-width="2" />
        <line x1="490" y1="458" x2="950" y2="458" stroke="#94a3b8" stroke-width="2" />

        <!-- Track Labels -->
        <text x="955" y="126" font-size="8" font-family="'JetBrains Mono', monospace" fill="#64748b">TRK-01 [MAIN VIP]</text>
        <text x="955" y="256" font-size="8" font-family="'JetBrains Mono', monospace" fill="#64748b">TRK-02 [UP EXPRESS]</text>
        <text x="955" y="286" font-size="8" font-family="'JetBrains Mono', monospace" fill="#64748b">TRK-03 [DN EXPRESS]</text>
        <text x="955" y="386" font-size="8" font-family="'JetBrains Mono', monospace" fill="#64748b">TRK-04 [LOOP 1]</text>
        <text x="955" y="456" font-size="8" font-family="'JetBrains Mono', monospace" fill="#38bdf8" font-weight="bold">SIDING B-4 [ROVER]</text>
      </g>

      <!-- --- STATION STRUCTURAL ZONES (Interactive Polygons) --- -->

      <!-- 1. PLATFORM 1 (VIP & Main Concourse Platform) -->
      <g 
        id="zone-Z-PF1" 
        class="station-zone"
        onmouseenter="window.handleZoneHover('Z-PF1')"
        onmouseleave="window.handleZoneHover(null)"
      >
        <rect 
          x="175" y="70" width="775" height="46" 
          fill="#1e293b" 
          fill-opacity="0.85" 
          stroke="${s.hoveredZoneId === 'Z-PF1' ? '#06b6d4' : '#334155'}" 
          stroke-width="${s.hoveredZoneId === 'Z-PF1' ? '2' : '1'}"
          rx="4"
        />
        <!-- Platform Yellow Safety Tactical Edge Line -->
        <rect x="175" y="112" width="775" height="4" fill="url(#safety-edge)" />
        <text x="185" y="88" font-size="11" font-family="'Chakra Petch', sans-serif" font-weight="bold" fill="#f8fafc">
          PLATFORM 1
        </text>
        <text x="185" y="102" font-size="8" font-family="'JetBrains Mono', monospace" fill="#94a3b8">
          VIP EXPRESS / RAJDHANI DEPARTURE • DENSITY: ${s.zones.find(z => z.id === 'Z-PF1').densityPct}%
        </text>
      </g>

      <!-- 2. ISLAND PLATFORM 2 & 3 -->
      <g 
        id="zone-Z-PF23" 
        class="station-zone"
        onmouseenter="window.handleZoneHover('Z-PF23')"
        onmouseleave="window.handleZoneHover(null)"
      >
        <rect 
          x="175" y="140" width="775" height="100" 
          fill="#1e293b" 
          fill-opacity="0.8" 
          stroke="${s.hoveredZoneId === 'Z-PF23' ? '#06b6d4' : '#334155'}" 
          stroke-width="${s.hoveredZoneId === 'Z-PF23' ? '2' : '1'}"
          rx="4"
        />
        <!-- Both edges yellow safety markings -->
        <rect x="175" y="140" width="775" height="3" fill="url(#safety-edge)" />
        <rect x="175" y="237" width="775" height="3" fill="url(#safety-edge)" />
        <text x="185" y="160" font-size="11" font-family="'Chakra Petch', sans-serif" font-weight="bold" fill="#f8fafc">
          ISLAND PLATFORM 2 & 3
        </text>
        <text x="185" y="174" font-size="8" font-family="'JetBrains Mono', monospace" fill="#94a3b8">
          THROUGH TRAFFIC • CANOPY SECTOR B • DENSITY: ${s.zones.find(z => z.id === 'Z-PF23').densityPct}%
        </text>
        <!-- Seating Benches / Pillars -->
        <circle cx="280" cy="190" r="4" fill="#475569" />
        <circle cx="480" cy="190" r="4" fill="#475569" />
        <circle cx="680" cy="190" r="4" fill="#475569" />
        <circle cx="860" cy="190" r="4" fill="#475569" />
      </g>

      <!-- 3. ISLAND PLATFORM 4 & 5 -->
      <g 
        id="zone-Z-PF45" 
        class="station-zone"
        onmouseenter="window.handleZoneHover('Z-PF45')"
        onmouseleave="window.handleZoneHover(null)"
      >
        <rect 
          x="175" y="300" width="775" height="70" 
          fill="#1e293b" 
          fill-opacity="0.75" 
          stroke="${s.hoveredZoneId === 'Z-PF45' ? '#06b6d4' : '#334155'}" 
          stroke-width="${s.hoveredZoneId === 'Z-PF45' ? '2' : '1'}"
          rx="4"
        />
        <rect x="175" y="300" width="775" height="3" fill="url(#safety-edge)" />
        <rect x="175" y="367" width="775" height="3" fill="url(#safety-edge)" />
        <text x="185" y="322" font-size="11" font-family="'Chakra Petch', sans-serif" font-weight="bold" fill="#f8fafc">
          ISLAND PLATFORM 4 & 5
        </text>
        <text x="185" y="336" font-size="8" font-family="'JetBrains Mono', monospace" fill="#94a3b8">
          SUBURBAN & INTERCITY CORRIDOR • DENSITY: ${s.zones.find(z => z.id === 'Z-PF45').densityPct}%
        </text>
      </g>

      <!-- 4. CARRIAGE SIDING B-4 (Quadruped Rover Patrol Arena) -->
      <g 
        id="zone-Z-SIDING" 
        class="station-zone"
        onmouseenter="window.handleZoneHover('Z-SIDING')"
        onmouseleave="window.handleZoneHover(null)"
      >
        <rect 
          x="480" y="435" width="470" height="60" 
          fill="#0c1322" 
          fill-opacity="0.9" 
          stroke="${s.hoveredZoneId === 'Z-SIDING' ? '#818cf8' : '#3730a3'}" 
          stroke-width="${s.hoveredZoneId === 'Z-SIDING' ? '2' : '1.2'}"
          rx="6"
        />
        <text x="495" y="475" font-size="10" font-family="'Chakra Petch', sans-serif" font-weight="bold" fill="#818cf8">
          CARRIAGE UNDERFRAME SIDING (COACH B-4)
        </text>
        <text x="495" y="488" font-size="8" font-family="'JetBrains Mono', monospace" fill="#c7d2fe">
          ROBOTIC SWEEP ARENA • DENSITY: 97.6% (RAKSHAK-Q1 ACTIVE)
        </text>
      </g>

      <!-- 5. MAIN TERMINAL CONCOURSE & SCREENING GATES (Left Wing) -->
      <g 
        id="zone-Z-CONCOURSE" 
        class="station-zone"
        onmouseenter="window.handleZoneHover('Z-CONCOURSE')"
        onmouseleave="window.handleZoneHover(null)"
      >
        <rect 
          x="15" y="40" width="145" height="175" 
          fill="#111827" 
          fill-opacity="0.92" 
          stroke="${s.hoveredZoneId === 'Z-CONCOURSE' ? '#06b6d4' : '#1f2937'}" 
          stroke-width="${s.hoveredZoneId === 'Z-CONCOURSE' ? '2' : '1.2'}"
          rx="6"
        />
        <text x="25" y="60" font-size="10" font-family="'Chakra Petch', sans-serif" font-weight="bold" fill="#38bdf8">
          MAIN CONCOURSE
        </text>
        <text x="25" y="73" font-size="8" font-family="'JetBrains Mono', monospace" fill="#94a3b8">
          SCREENING GATE 1-2
        </text>

        <!-- Turnstile Gates Iconography -->
        <g stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round" fill="none">
          <line x1="30" y1="90" x2="45" y2="90" />
          <line x1="55" y1="90" x2="70" y2="90" />
          <line x1="80" y1="90" x2="95" y2="90" />
          <line x1="105" y1="90" x2="120" y2="90" />
        </g>
        <!-- Luggage X-ray Scanners -->
        <rect x="35" y="105" width="28" height="16" fill="#1e293b" stroke="#06b6d4" stroke-width="1" rx="2" />
        <rect x="80" y="105" width="28" height="16" fill="#1e293b" stroke="#06b6d4" stroke-width="1" rx="2" />
        <text x="38" y="116" font-size="6.5" font-family="'JetBrains Mono', monospace" fill="#38bdf8">SCAN 1</text>
        <text x="83" y="116" font-size="6.5" font-family="'JetBrains Mono', monospace" fill="#38bdf8">SCAN 2</text>

        <!-- RPF Terminal Security Outpost -->
        <rect x="25" y="145" width="125" height="55" fill="#0f172a" stroke="#0284c7" stroke-width="1" rx="3" />
        <text x="32" y="162" font-size="8" font-family="'JetBrains Mono', monospace" font-weight="bold" fill="#38bdf8">
          RPF TACTICAL HUB
        </text>
        <text x="32" y="174" font-size="7.5" font-family="'JetBrains Mono', monospace" fill="#64748b">
          WEAPON LOCKERS • CCTV
        </text>
        <text x="32" y="186" font-size="7.5" font-family="'JetBrains Mono', monospace" fill="#10b981">
          STATUS: ACTIVE READY
        </text>
      </g>

      <!-- 6. WAITING HALL SECTOR D & FOOD COURT -->
      <g 
        id="zone-Z-HALLD" 
        class="station-zone"
        onmouseenter="window.handleZoneHover('Z-HALLD')"
        onmouseleave="window.handleZoneHover(null)"
      >
        <rect 
          x="15" y="230" width="145" height="265" 
          fill="#111827" 
          fill-opacity="0.92" 
          stroke="${s.hoveredZoneId === 'Z-HALLD' ? '#f59e0b' : '#1f2937'}" 
          stroke-width="${s.hoveredZoneId === 'Z-HALLD' ? '2' : '1.2'}"
          rx="6"
        />
        <text x="25" y="250" font-size="10" font-family="'Chakra Petch', sans-serif" font-weight="bold" fill="#f59e0b">
          WAITING HALL D
        </text>
        <text x="25" y="263" font-size="8" font-family="'JetBrains Mono', monospace" fill="#94a3b8">
          FOOD COURT & SEATING
        </text>

        <!-- Seating Rows -->
        <g fill="#1e293b" stroke="#334155" stroke-width="0.8">
          <rect x="25" y="280" width="55" height="8" rx="2" />
          <rect x="90" y="280" width="55" height="8" rx="2" />
          <rect x="25" y="300" width="55" height="8" rx="2" />
          <rect x="90" y="300" width="55" height="8" rx="2" />
          <rect x="25" y="320" width="55" height="8" rx="2" />
          <rect x="90" y="320" width="55" height="8" rx="2" />
        </g>

        <!-- Ticket Counters Strip -->
        <rect x="25" y="360" width="125" height="40" fill="#0f172a" stroke="#d97706" stroke-width="1" rx="3" />
        <text x="32" y="377" font-size="8" font-family="'JetBrains Mono', monospace" font-weight="bold" fill="#f59e0b">
          TICKET COUNTERS 1-8
        </text>
        <text x="32" y="390" font-size="7.5" font-family="'JetBrains Mono', monospace" fill="#94a3b8">
          NARCOTIC ANOMALY ZONE
        </text>
      </g>

      <!-- 7. NORTH PARCEL & CARGO BAY (Top Right Wing) -->
      <g 
        id="zone-Z-PARCEL" 
        class="station-zone"
        onmouseenter="window.handleZoneHover('Z-PARCEL')"
        onmouseleave="window.handleZoneHover(null)"
      >
        <rect 
          x="820" y="30" width="165" height="36" 
          fill="#111827" 
          fill-opacity="0.9" 
          stroke="${s.hoveredZoneId === 'Z-PARCEL' ? '#ec4899' : '#1f2937'}" 
          stroke-width="${s.hoveredZoneId === 'Z-PARCEL' ? '2' : '1'}"
          rx="4"
        />
        <text x="830" y="47" font-size="9" font-family="'Chakra Petch', sans-serif" font-weight="bold" fill="#f472b6">
          PARCEL & FREIGHT WING
        </text>
        <text x="830" y="58" font-size="7" font-family="'JetBrains Mono', monospace" fill="#94a3b8">
          CARGO PALLETS • DENSITY: 93.1%
        </text>
      </g>

      <!-- 8. FOOT OVERBRIDGES (FOB 1 - South, FOB 2 - North) -->
      <!-- FOB 1 (South) Spanning Across Tracks -->
      <g id="fob-south" class="station-zone" opacity="0.95">
        <rect x="320" y="45" width="28" height="380" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5" rx="3" />
        <!-- Cross hatching walkway pattern -->
        <line x1="320" y1="50" x2="348" y2="50" stroke="#0284c7" stroke-width="2" stroke-dasharray="2, 4" />
        <line x1="320" y1="420" x2="348" y2="420" stroke="#0284c7" stroke-width="2" stroke-dasharray="2, 4" />
        <text 
          x="334" y="240" 
          transform="rotate(-90 334 240)" 
          text-anchor="middle" 
          font-size="9" 
          font-family="'JetBrains Mono', monospace" 
          font-weight="bold" 
          fill="#38bdf8"
          letter-spacing="2"
        >
          FOOT OVERBRIDGE 1 [SOUTH]
        </text>
        <!-- Staircases to platforms -->
        <rect x="305" y="90" width="15" height="18" fill="#1e293b" stroke="#38bdf8" stroke-width="1" />
        <rect x="348" y="160" width="15" height="18" fill="#1e293b" stroke="#38bdf8" stroke-width="1" />
        <rect x="348" y="320" width="15" height="18" fill="#1e293b" stroke="#38bdf8" stroke-width="1" />
      </g>

      <!-- FOB 2 (North) Spanning Across Tracks -->
      <g id="fob-north" class="station-zone" opacity="0.95">
        <rect x="720" y="45" width="28" height="380" fill="#0f172a" stroke="#6366f1" stroke-width="1.5" rx="3" />
        <text 
          x="734" y="240" 
          transform="rotate(-90 734 240)" 
          text-anchor="middle" 
          font-size="9" 
          font-family="'JetBrains Mono', monospace" 
          font-weight="bold" 
          fill="#818cf8"
          letter-spacing="2"
        >
          FOOT OVERBRIDGE 2 [NORTH]
        </text>
        <rect x="705" y="90" width="15" height="18" fill="#1e293b" stroke="#818cf8" stroke-width="1" />
        <rect x="748" y="160" width="15" height="18" fill="#1e293b" stroke="#818cf8" stroke-width="1" />
        <rect x="748" y="320" width="15" height="18" fill="#1e293b" stroke="#818cf8" stroke-width="1" />
      </g>

      <!-- ========================================================== -->
      <!-- LAYER 2: RPF PATROL COVERAGE DENSITY HEATMAP OVERLAY       -->
      <!-- ========================================================== -->
      ${s.activeLayer.densityHeatmap ? `
        <g id="density-heatmap-overlay" opacity="${opacity}" filter="url(#svg-heat-blur)">
          <!-- Dynamic Patrol Coverage Density Blobs (Smoothly follow the 5 Units) -->
          ${s.patrolUnits.map(unit => `
            <circle 
              id="heat-unit-${unit.id}" 
              cx="${unit.currentPos.x}" 
              cy="${unit.currentPos.y}" 
              r="75" 
              fill="url(#${unit.type === 'ROBOT_QUADRUPED' ? 'heat-rover-indigo' : unit.type === 'K9_SQUAD' ? 'heat-high-emerald' : unit.type === 'TACTICAL_QRT' ? 'heat-high-cyan' : 'heat-high-cyan'})" 
              class="heat-blob-pulse" 
            />
          `).join("")}

          <!-- Ambient Station Heat Gradient Bases -->
          <circle cx="340" cy="95" r="70" fill="url(#heat-high-emerald)" class="heat-blob-pulse" style="animation-delay: -2s;" />
          <circle cx="680" cy="455" r="80" fill="url(#heat-rover-indigo)" class="heat-blob-pulse" style="animation-delay: -3s;" />
          <circle cx="480" cy="220" r="75" fill="url(#heat-high-emerald)" class="heat-blob-pulse" style="animation-delay: -1.5s;" />
          <circle cx="95" cy="360" r="70" fill="url(#heat-amber-moderate)" class="heat-blob-pulse" style="animation-delay: -4s;" />

          <!-- Overbridge transit corridor ribbons -->
          <line x1="334" y1="60" x2="334" y2="400" stroke="#06b6d4" stroke-width="24" stroke-linecap="round" opacity="0.6" />
          <line x1="734" y1="60" x2="734" y2="400" stroke="#818cf8" stroke-width="20" stroke-linecap="round" opacity="0.5" />
        </g>
      ` : ""}

      <!-- LAYER 2B: Cold Blindspot Highlights (Optional layer) -->
      ${s.activeLayer.blindspotHighlights ? `
        <g id="cold-blindspots-group" opacity="0.85">
          <!-- Buffer end of Platform 5 -->
          <rect x="910" y="300" width="40" height="70" fill="url(#cold-hatch)" stroke="#f43f5e" stroke-width="1.5" rx="3" />
          <text x="930" y="340" text-anchor="middle" font-size="8" font-family="'JetBrains Mono', monospace" fill="#f43f5e" font-weight="bold">BLINDSPOT</text>
          <text x="930" y="352" text-anchor="middle" font-size="7" font-family="'JetBrains Mono', monospace" fill="#fda4af">&lt; 45% COV</text>
        </g>
      ` : ""}

      <!-- ========================================================== -->
      <!-- LAYER 3: FIXED SENSOR NODES & DETECTION FIELDS             -->
      <!-- ========================================================== -->
      ${s.activeLayer.sensorNodes ? `
        <g id="fixed-sensor-nodes-group">
          ${s.fixedNodes.map(node => `
            <g transform="translate(${node.x}, ${node.y})">
              <!-- Detection Radius Halo -->
              <circle cx="0" cy="0" r="${node.radius}" fill="url(#sensor-coverage-glow)" stroke="#0ea5e9" stroke-width="0.8" stroke-dasharray="3,3" opacity="0.75" />
              <!-- Outer Ping Ring -->
              <circle cx="0" cy="0" r="14" fill="none" stroke="#38bdf8" stroke-width="1" class="radar-sonar-ring" />
              <!-- Fixed Node Marker -->
              <rect x="-8" y="-8" width="16" height="16" fill="#0369a1" stroke="#e0f2fe" stroke-width="1.5" rx="3" />
              <text x="0" y="3" text-anchor="middle" font-size="7" font-family="'JetBrains Mono', monospace" font-weight="bold" fill="#ffffff">FN</text>
              <!-- Label -->
              <rect x="-35" y="12" width="70" height="13" fill="#020617" stroke="#1e293b" stroke-width="0.8" rx="2" />
              <text x="0" y="21" text-anchor="middle" font-size="7.5" font-family="'JetBrains Mono', monospace" fill="#38bdf8">${node.id}</text>
            </g>
          `).join("")}
        </g>
      ` : ""}

      <!-- ========================================================== -->
      <!-- LAYER 4: THREAT INCIDENT HAZARD PINS                       -->
      <!-- ========================================================== -->
      ${s.activeLayer.threatIncidents ? `
        <g id="threat-incidents-group">
          ${s.incidents.map(inc => `
            <g 
              transform="translate(${inc.x}, ${inc.y})" 
              class="cursor-pointer"
              onclick="window.selectIncident('${inc.id}')"
            >
              <!-- Pulsing Critical Danger Zone -->
              <circle cx="0" cy="0" r="28" fill="url(#hazard-critical-glow)" class="heat-blob-pulse" />
              <circle cx="0" cy="0" r="18" fill="none" stroke="#ef4444" stroke-width="1.8" class="radar-sonar-ring" />
              <!-- Diamond Threat Pin -->
              <polygon points="0,-12 12,0 0,12 -12,0" fill="#dc2626" stroke="#fecaca" stroke-width="2" />
              <text x="0" y="3" text-anchor="middle" font-size="9" font-family="'JetBrains Mono', monospace" font-weight="bold" fill="#ffffff">!</text>
              <!-- Threat Badge HUD -->
              <g transform="translate(16, -12)">
                <rect x="0" y="0" width="115" height="24" fill="#020617" stroke="#ef4444" stroke-width="1" rx="4" />
                <text x="6" y="10" font-size="7.5" font-family="'JetBrains Mono', monospace" font-weight="bold" fill="#f87171">${inc.id}</text>
                <text x="6" y="20" font-size="7" font-family="'JetBrains Mono', monospace" fill="#fca5a5">${inc.title} (${inc.confidence}%)</text>
              </g>
            </g>
          `).join("")}
        </g>
      ` : ""}

      <!-- ========================================================== -->
      <!-- LAYER 5: PATROL BREADCRUMB TRAILS (Animated Dashes)        -->
      <!-- ========================================================== -->
      ${s.activeLayer.patrolTrails ? `
        <g id="patrol-trails-group">
          ${s.patrolUnits.map(unit => {
            if (s.activeFilter !== "ALL" && !unit.type.includes(s.activeFilter)) return "";
            // Build SVG path from waypoints
            const pathD = unit.waypoints.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt[0]} ${pt[1]}`).join(" ") + " Z";
            return `
              <g id="trail-${unit.id}">
                <!-- Waypoint Route Guide Line -->
                <path d="${pathD}" fill="none" stroke="${unit.color}" stroke-width="1.5" stroke-opacity="0.35" class="patrol-trail-animated" />
                <!-- Historical Fading Trail -->
                ${unit.trail.map((t, idx) => `
                  <circle cx="${t.x}" cy="${t.y}" r="${Math.max(2, idx * 0.8)}" fill="${unit.color}" fill-opacity="${(idx + 1) * 0.08}" />
                `).join("")}
              </g>
            `;
          }).join("")}
        </g>
      ` : ""}

      <!-- ========================================================== -->
      <!-- LAYER 6: REAL-TIME RPF PATROL UNITS (Live Animated Nodes)  -->
      <!-- ========================================================== -->
      <g id="patrol-units-layer">
        ${s.patrolUnits.map(unit => {
          if (s.activeFilter !== "ALL" && !unit.type.includes(s.activeFilter)) return "";
          const isSelected = s.selectedUnitId === unit.id;
          const pos = unit.currentPos;
          const isRobot = unit.type === "ROBOT_QUADRUPED";
          const isK9 = unit.type === "K9_SQUAD";

          return `
            <g 
              id="unit-marker-${unit.id}" 
              transform="translate(${pos.x}, ${pos.y})" 
              class="cursor-pointer"
              onclick="window.selectPatrolUnit('${unit.id}')"
            >
              <!-- Selected Unit Focus Ring -->
              ${isSelected ? `
                <circle cx="0" cy="0" r="22" fill="none" stroke="${unit.color}" stroke-width="1.5" stroke-dasharray="4,3" class="radar-sonar-ring" />
                <circle cx="0" cy="0" r="16" fill="${unit.color}" fill-opacity="0.2" />
              ` : ""}

              <!-- Radar Directional Cone / Field of Vision (40 degree arc) -->
              <g transform="rotate(${unit.heading})">
                <path d="M 0 0 L 22 -10 A 24 24 0 0 1 22 10 Z" fill="${unit.color}" fill-opacity="0.28" stroke="${unit.color}" stroke-width="0.8" stroke-opacity="0.6" />
                <line x1="0" y1="0" x2="24" y2="0" stroke="${unit.color}" stroke-width="1.5" />
              </g>

              <!-- Central Unit Avatar Badge -->
              <circle cx="0" cy="0" r="9" fill="#020617" stroke="${unit.color}" stroke-width="${isSelected ? '2.5' : '1.8'}" filter="url(#svg-unit-glow)" />
              
              <!-- Unit Glyph / Icon -->
              <text x="0" y="3.5" text-anchor="middle" font-size="8" font-family="'Chakra Petch', sans-serif" font-weight="bold" fill="#ffffff">
                ${isRobot ? '🤖' : isK9 ? '🐕' : '👮'}
              </text>

              <!-- Unit Call-sign HUD Pill -->
              <g transform="translate(13, -11)">
                <rect x="0" y="0" width="76" height="18" fill="#020617" fill-opacity="0.9" stroke="${unit.color}" stroke-width="1" rx="3" />
                <circle cx="6" cy="9" r="2.5" fill="${unit.sniffStatus === 'ALERT' ? '#ef4444' : unit.sniffStatus === 'ELEVATED' ? '#f59e0b' : '#10b981'}" />
                <text x="13" y="12" font-size="7.5" font-family="'JetBrains Mono', monospace" font-weight="bold" fill="#ffffff">
                  ${unit.shortName}
                </text>
              </g>
            </g>
          `;
        }).join("")}
      </g>
    </svg>
  `;
}

// ============================================================================
// SIMULATION ENGINE: Smooth requestAnimationFrame Waypoint Interpolation
// ============================================================================
export function startHeatmapSimulation() {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);

  function step(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const dt = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (heatmapState.isSimulationPlaying) {
      updatePatrolPositions(dt);
      renderPatrolSvgElements();
    }

    animationFrameId = requestAnimationFrame(step);
  }

  animationFrameId = requestAnimationFrame(step);
}

export function stopHeatmapSimulation() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

// Advance patrol coordinates smoothly and slowly along their waypoint vectors
function updatePatrolPositions(dt) {
  // Clamp delta time to avoid unexpected leaps when returning to tab
  const safeDt = Math.min(0.04, Math.max(0.001, dt));

  // Base steady patrol speed: ~12 to 14 coordinate pixels per second
  // Multiplied by user's speed setting (0.5x, 1x, 1.5x)
  const baseSpeedPxPerSec = 12 * (heatmapState.simulationSpeed || 1);

  heatmapState.patrolUnits.forEach(unit => {
    const p1 = unit.waypoints[unit.currentIdx];
    const nextIdx = (unit.currentIdx + 1) % unit.waypoints.length;
    const p2 = unit.waypoints[nextIdx];

    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const segmentLength = Math.hypot(dx, dy) || 60;

    // Advance progress t by the physical distance divided by segment length
    const stepT = (baseSpeedPxPerSec * safeDt) / segmentLength;
    unit.t += stepT;

    if (unit.t >= 1) {
      unit.t = 0;
      unit.currentIdx = nextIdx;
    }

    // Smooth linear interpolation along current segment
    const curX = p1[0] + dx * unit.t;
    const curY = p1[1] + dy * unit.t;

    // Calculate heading angle in degrees
    const targetHeading = (Math.atan2(dy, dx) * 180) / Math.PI;

    // Smooth heading rotation interpolation so units turn gently around corners
    if (unit.heading === undefined) {
      unit.heading = targetHeading;
    } else {
      let diff = (targetHeading - unit.heading + 180) % 360 - 180;
      if (diff < -180) diff += 360;
      unit.heading += diff * Math.min(1, safeDt * 4.5);
    }

    unit.currentPos = { x: Math.round(curX * 10) / 10, y: Math.round(curY * 10) / 10 };

    // Update gentle breadcrumb trail (at distance steps > 18px)
    if (!unit.lastTrailPos || Math.hypot(unit.currentPos.x - unit.lastTrailPos.x, unit.currentPos.y - unit.lastTrailPos.y) > 18) {
      unit.lastTrailPos = { ...unit.currentPos };
      unit.trail.push({ ...unit.currentPos });
      if (unit.trail.length > 8) unit.trail.shift();
    }
  });
}

// Fast DOM update for markers and heat blobs without re-rendering entire SVG structure
function renderPatrolSvgElements() {
  heatmapState.patrolUnits.forEach(unit => {
    const el = document.getElementById(`unit-marker-${unit.id}`);
    if (el) {
      el.setAttribute("transform", `translate(${unit.currentPos.x}, ${unit.currentPos.y})`);
      // Update heading cone
      const cone = el.querySelector("g[transform^='rotate']");
      if (cone) {
        cone.setAttribute("transform", `rotate(${unit.heading})`);
      }
    }

    // Also update dynamic heat coverage blob attached to this patrol unit
    const heatBlob = document.getElementById(`heat-unit-${unit.id}`);
    if (heatBlob) {
      heatBlob.setAttribute("cx", unit.currentPos.x);
      heatBlob.setAttribute("cy", unit.currentPos.y);
    }
  });

  // Update Telemetry Panel HUD coordinates live
  const activeUnit = heatmapState.patrolUnits.find(u => u.id === heatmapState.selectedUnitId);
  if (activeUnit) {
    const coordsEl = document.getElementById("hud-unit-coords");
    if (coordsEl) {
      coordsEl.innerText = `X: ${activeUnit.currentPos.x.toFixed(1)}m | Y: ${activeUnit.currentPos.y.toFixed(1)}m (Heading ${Math.round(activeUnit.heading)}°)`;
    }
  }
}

// ============================================================================
// MAIN COMPONENT RENDERER: SVG Floor Plan + Interactive Controls + Telemetry HUD
// ============================================================================
export function renderStationHeatmapComponent(containerEl) {
  const s = heatmapState;
  const selectedUnit = s.patrolUnits.find(u => u.id === s.selectedUnitId) || s.patrolUnits[0];
  const hoveredZone = s.zones.find(z => z.id === s.hoveredZoneId);

  containerEl.innerHTML = `
    <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
      <!-- Header & Real-Time Coverage Telemetry KPIs -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/40">
            <i data-lucide="map-pin" class="w-4 h-4"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-bold text-white font-['Chakra_Petch'] tracking-wide">
                STATION FLOOR PLAN • REAL-TIME RPF PATROL COVERAGE HEATMAP
              </h2>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                93.4% STATION COVERED
              </span>
            </div>
            <p class="text-[11px] text-slate-400 font-mono">
              NDLS Terminal Mesh • 5 Patrol Teams On-Grid • Mean Sweep Interval: 3.8 min
            </p>
          </div>
        </div>

        <!-- Quick Metrics Bar -->
        <div class="flex items-center gap-2 text-xs font-mono">
          <div class="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <span class="text-slate-500">Units Active:</span>
            <strong class="text-cyan-400">5 / 5 Units</strong>
          </div>
          <div class="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <span class="text-slate-500">Blindspots:</span>
            <strong class="text-emerald-400">&lt; 2.6% (Low Risk)</strong>
          </div>
          <div class="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <span class="text-slate-500">Avg Speed:</span>
            <strong class="text-indigo-400">3.8 km/h</strong>
          </div>
        </div>
      </div>

      <!-- Tactical Controls Ribbon: Heatmap Layers, Filters & Simulation Speed -->
      <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-xs font-mono">
        <!-- Layer Toggles -->
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="text-slate-500 text-[11px] mr-1">LAYERS:</span>
          
          <button 
            id="btn-toggle-density" 
            class="px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${s.activeLayer.densityHeatmap ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'}"
          >
            <i data-lucide="flame" class="w-3 h-3 text-cyan-400"></i>
            <span>Density Heatmap</span>
          </button>

          <button 
            id="btn-toggle-trails" 
            class="px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${s.activeLayer.patrolTrails ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'}"
          >
            <i data-lucide="navigation" class="w-3 h-3 text-indigo-400"></i>
            <span>Patrol Trails</span>
          </button>

          <button 
            id="btn-toggle-sensors" 
            class="px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${s.activeLayer.sensorNodes ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'}"
          >
            <i data-lucide="radio" class="w-3 h-3 text-blue-400"></i>
            <span>Fixed Nodes</span>
          </button>

          <button 
            id="btn-toggle-incidents" 
            class="px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${s.activeLayer.threatIncidents ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'}"
          >
            <i data-lucide="alert-circle" class="w-3 h-3 text-red-400"></i>
            <span>Active Threats</span>
          </button>

          <button 
            id="btn-toggle-blindspots" 
            class="px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${s.activeLayer.blindspotHighlights ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'}"
          >
            <i data-lucide="eye-off" class="w-3 h-3 text-rose-400"></i>
            <span>Blindspots</span>
          </button>
        </div>

        <!-- Heatmap Opacity Slider & Simulation Controls -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
            <span class="text-[11px] text-slate-400">Opacity:</span>
            <input 
              type="range" 
              id="slider-heat-opacity" 
              min="0.2" 
              max="1" 
              step="0.05" 
              value="${s.heatmapOpacity}" 
              class="w-20 accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
            />
            <span id="label-heat-opacity" class="text-[11px] text-cyan-300 w-7 text-right">${Math.round(s.heatmapOpacity * 100)}%</span>
          </div>

          <!-- Play / Pause & Speed Controls (Slow, Normal) -->
          <div class="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
            <button 
              id="btn-toggle-play" 
              class="p-1 rounded text-slate-300 hover:text-white transition-colors"
              title="${s.isSimulationPlaying ? 'Pause Simulation' : 'Resume Simulation'}"
            >
              <i data-lucide="${s.isSimulationPlaying ? 'pause' : 'play'}" class="w-3.5 h-3.5"></i>
            </button>
            <span class="text-slate-500 pl-1">Speed:</span>
            <button 
              id="btn-speed-slow" 
              class="px-2 py-0.5 rounded transition-all ${s.simulationSpeed === 0.5 ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-white'}"
              title="Very Slow & Gentle Patrol Speed"
            >
              0.5x Slow
            </button>
            <button 
              id="btn-speed-norm" 
              class="px-2 py-0.5 rounded transition-all ${s.simulationSpeed === 1 ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-white'}"
              title="Normal Standard Patrol Speed"
            >
              1x Normal
            </button>
          </div>

          <!-- Dispatch Nearest Patrol Button -->
          <button 
            id="btn-dispatch-nearest" 
            class="px-3 py-1 rounded-lg bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-semibold text-[11px] flex items-center gap-1.5 shadow-md shadow-red-950/50 transition-all"
            title="Auto-route nearest patrol to highest priority threat"
          >
            <i data-lucide="zap" class="w-3 h-3"></i>
            <span>Vector Intercept</span>
          </button>
        </div>
      </div>

      <!-- MAIN SVG FLOOR PLAN CONTAINER -->
      <div id="svg-floorplan-container" class="relative">
        ${generateStationFloorPlanSvg()}

        <!-- Zone Inspection Hover HUD Badge (Overlaid on SVG) -->
        <div 
          id="zone-hover-hud" 
          class="absolute bottom-4 left-4 pointer-events-none transition-all duration-300 ${hoveredZone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}"
        >
          ${hoveredZone ? `
            <div class="bg-slate-950/95 border border-cyan-500/50 rounded-xl p-3 shadow-2xl backdrop-blur-md max-w-sm text-xs font-mono space-y-1">
              <div class="flex items-center justify-between text-slate-400">
                <span class="text-cyan-400 font-bold">${hoveredZone.code}: ${hoveredZone.name}</span>
                <span class="px-1.5 py-0.5 rounded text-[10px] ${hoveredZone.threat === 'CRITICAL' ? 'bg-red-500/20 text-red-300' : hoveredZone.threat === 'ELEVATED' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}">
                  ${hoveredZone.threat}
                </span>
              </div>
              <p class="text-slate-300 text-[11px]">${hoveredZone.description}</p>
              <div class="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                <span>Coverage: <strong class="text-emerald-400">${hoveredZone.densityPct}%</strong></span>
                <span>Sweep: <strong class="text-slate-200">${hoveredZone.sweepInterval}</strong></span>
                <span>Sensor: <strong class="text-cyan-300">${hoveredZone.fixedNode}</strong></span>
              </div>
            </div>
          ` : ""}
        </div>
      </div>

      <!-- Bottom Split: Selected Unit Telemetry HUD + All Active Units Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1">
        <!-- Selected Patrol Unit Live Dossier (5 cols) -->
        <div class="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5 text-xs font-mono">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${selectedUnit.color};"></span>
              <span class="text-white font-bold tracking-wide">${selectedUnit.callsign}</span>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              ${selectedUnit.type}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-[11px]">
            <div class="p-2 rounded bg-slate-900 border border-slate-800">
              <span class="text-slate-500 block">Assigned Sector:</span>
              <span class="text-white font-bold truncate block">${selectedUnit.zoneName}</span>
            </div>
            <div class="p-2 rounded bg-slate-900 border border-slate-800">
              <span class="text-slate-500 block">Device Hardware:</span>
              <span class="text-cyan-300 font-bold block">${selectedUnit.deviceId} (${selectedUnit.battery}%)</span>
            </div>
          </div>

          <div class="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1 text-[11px]">
            <div class="flex justify-between text-slate-400">
              <span>RTLS Indoor GPS:</span>
              <span id="hud-unit-coords" class="text-slate-200 font-bold">X: ${selectedUnit.currentPos.x.toFixed(1)}m | Y: ${selectedUnit.currentPos.y.toFixed(1)}m</span>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>Coverage Density Score:</span>
              <span class="text-emerald-400 font-bold">${selectedUnit.coveragePct}% (Optimal)</span>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>Sniffer / Raman Status:</span>
              <span class="${selectedUnit.sniffStatus === 'ALERT' ? 'text-red-400 font-bold' : selectedUnit.sniffStatus === 'ELEVATED' ? 'text-amber-400 font-bold' : 'text-emerald-400'}">
                ${selectedUnit.lastSniff}
              </span>
            </div>
          </div>

          <div class="flex items-center justify-between text-[10px] text-slate-400">
            <span>Badge: <strong class="text-slate-200">${selectedUnit.badge}</strong></span>
            <span>Speed: <strong class="text-indigo-300">${selectedUnit.speedKmh} km/h</strong></span>
            <button 
              onclick="window.recenterOnUnit('${selectedUnit.id}')" 
              class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
            >
              Focus Unit
            </button>
          </div>
        </div>

        <!-- All 5 Active Patrol Units Quick Selector (7 cols) -->
        <div class="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs font-mono">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <span class="text-slate-400 font-bold uppercase">RPF STATION PATROL FLEET (${s.patrolUnits.length})</span>
            <div class="flex items-center gap-1 text-[10px]">
              <button onclick="window.filterPatrolUnits('ALL')" class="px-2 py-0.5 rounded ${s.activeFilter === 'ALL' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}">All</button>
              <button onclick="window.filterPatrolUnits('HUMAN')" class="px-2 py-0.5 rounded ${s.activeFilter === 'HUMAN' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}">RPF</button>
              <button onclick="window.filterPatrolUnits('ROBOT')" class="px-2 py-0.5 rounded ${s.activeFilter === 'ROBOT' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}">Quadruped</button>
              <button onclick="window.filterPatrolUnits('K9')" class="px-2 py-0.5 rounded ${s.activeFilter === 'K9' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}">K9</button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            ${s.patrolUnits.map(unit => {
              if (s.activeFilter !== "ALL" && !unit.type.includes(s.activeFilter)) return "";
              const isSelected = unit.id === s.selectedUnitId;
              return `
                <div 
                  onclick="window.selectPatrolUnit('${unit.id}')"
                  class="p-2 rounded-lg border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-500/10' 
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900'
                  }"
                >
                  <div class="flex items-center justify-between text-[11px]">
                    <div class="flex items-center gap-1.5 truncate">
                      <span class="w-2 h-2 rounded-full" style="background-color: ${unit.color};"></span>
                      <strong class="text-white truncate">${unit.shortName}</strong>
                    </div>
                    <span class="text-[10px] text-slate-400">${unit.battery}%</span>
                  </div>
                  <div class="text-[10px] text-slate-400 truncate mt-0.5">${unit.zoneName}</div>
                  <div class="flex items-center justify-between text-[10px] mt-1 pt-1 border-t border-slate-800/60">
                    <span class="${unit.sniffStatus === 'ALERT' ? 'text-red-400 font-bold' : unit.sniffStatus === 'ELEVATED' ? 'text-amber-400 font-bold' : 'text-emerald-400'}">
                      ● ${unit.sniffStatus}
                    </span>
                    <span class="text-slate-500">${unit.coveragePct}% cov</span>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind UI Event Handlers
  bindHeatmapEventHandlers(containerEl);

  // Start continuous smooth movement animation
  startHeatmapSimulation();
}

// ============================================================================
// EVENT HANDLERS & INTERACTIONS
// ============================================================================
function bindHeatmapEventHandlers(containerEl) {
  // Layer Toggles
  const btnDensity = document.getElementById("btn-toggle-density");
  const btnTrails = document.getElementById("btn-toggle-trails");
  const btnSensors = document.getElementById("btn-toggle-sensors");
  const btnIncidents = document.getElementById("btn-toggle-incidents");
  const btnBlindspots = document.getElementById("btn-toggle-blindspots");
  const sliderOpacity = document.getElementById("slider-heat-opacity");
  const labelOpacity = document.getElementById("label-heat-opacity");
  const btnPlay = document.getElementById("btn-toggle-play");
  const btnSpeed = document.getElementById("btn-speed-toggle");
  const btnDispatch = document.getElementById("btn-dispatch-nearest");

  if (btnDensity) {
    btnDensity.onclick = () => {
      heatmapState.activeLayer.densityHeatmap = !heatmapState.activeLayer.densityHeatmap;
      refreshSvgOnly();
    };
  }

  if (btnTrails) {
    btnTrails.onclick = () => {
      heatmapState.activeLayer.patrolTrails = !heatmapState.activeLayer.patrolTrails;
      refreshSvgOnly();
    };
  }

  if (btnSensors) {
    btnSensors.onclick = () => {
      heatmapState.activeLayer.sensorNodes = !heatmapState.activeLayer.sensorNodes;
      refreshSvgOnly();
    };
  }

  if (btnIncidents) {
    btnIncidents.onclick = () => {
      heatmapState.activeLayer.threatIncidents = !heatmapState.activeLayer.threatIncidents;
      refreshSvgOnly();
    };
  }

  if (btnBlindspots) {
    btnBlindspots.onclick = () => {
      heatmapState.activeLayer.blindspotHighlights = !heatmapState.activeLayer.blindspotHighlights;
      refreshSvgOnly();
    };
  }

  if (sliderOpacity) {
    sliderOpacity.oninput = (e) => {
      const val = parseFloat(e.target.value);
      heatmapState.heatmapOpacity = val;
      if (labelOpacity) labelOpacity.innerText = `${Math.round(val * 100)}%`;
      const overlay = document.getElementById("density-heatmap-overlay");
      if (overlay) overlay.setAttribute("opacity", val);
    };
  }

  if (btnPlay) {
    btnPlay.onclick = () => {
      heatmapState.isSimulationPlaying = !heatmapState.isSimulationPlaying;
      renderStationHeatmapComponent(containerEl);
    };
  }

  const btnSpeedSlow = document.getElementById("btn-speed-slow");
  const btnSpeedNorm = document.getElementById("btn-speed-norm");

  if (btnSpeedSlow) {
    btnSpeedSlow.onclick = () => {
      heatmapState.simulationSpeed = 0.5;
      renderStationHeatmapComponent(containerEl);
      if (window.showToast) {
        window.showToast("Patrol movement speed set to 0.5x (Slow)");
      }
    };
  }

  if (btnSpeedNorm) {
    btnSpeedNorm.onclick = () => {
      heatmapState.simulationSpeed = 1;
      renderStationHeatmapComponent(containerEl);
      if (window.showToast) {
        window.showToast("Patrol movement speed set to 1x (Normal)");
      }
    };
  }

  if (btnDispatch) {
    btnDispatch.onclick = () => {
      // Dispatch RPF Alpha and Rover to critical incident
      const rpf = heatmapState.patrolUnits.find(u => u.id === "RPF-PATROL-01");
      const rover = heatmapState.patrolUnits.find(u => u.id === "GARUD-QP-01");
      if (rpf) {
        rpf.currentPos = { x: 318, y: 92 };
        rpf.zoneName = "Platform 1 INC-01 Perimeter Containment";
        rpf.sniffStatus = "ALERT";
      }
      if (rover) {
        rover.currentPos = { x: 678, y: 448 };
        rover.zoneName = "Coach B-4 INC-02 Chassis Secure";
        rover.sniffStatus = "ALERT";
      }
      refreshSvgOnly();
      if (window.showToast) {
        window.showToast("RPF Patrols auto-routed to Active Incident Coordinates (Platform 1 & Coach B-4)", true);
      }
    };
  }
}

// Re-inject SVG only to keep smooth animations
function refreshSvgOnly() {
  const container = document.getElementById("svg-floorplan-container");
  if (container) {
    container.innerHTML = `
      ${generateStationFloorPlanSvg()}
      <div 
        id="zone-hover-hud" 
        class="absolute bottom-4 left-4 pointer-events-none transition-all duration-300 ${heatmapState.hoveredZoneId ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}"
      >
      </div>
    `;
  }
}

// Global window hooks for direct SVG element onclick/onhover
window.handleZoneHover = function(zoneId) {
  heatmapState.hoveredZoneId = zoneId;
  const hud = document.getElementById("zone-hover-hud");
  if (!hud) return;

  if (!zoneId) {
    hud.className = "absolute bottom-4 left-4 pointer-events-none transition-all duration-300 opacity-0 translate-y-2";
    return;
  }

  const zone = heatmapState.zones.find(z => z.id === zoneId);
  if (!zone) return;

  hud.className = "absolute bottom-4 left-4 pointer-events-none transition-all duration-300 opacity-100 translate-y-0";
  hud.innerHTML = `
    <div class="bg-slate-950/95 border border-cyan-500/50 rounded-xl p-3 shadow-2xl backdrop-blur-md max-w-sm text-xs font-mono space-y-1">
      <div class="flex items-center justify-between text-slate-400">
        <span class="text-cyan-400 font-bold">${zone.code}: ${zone.name}</span>
        <span class="px-1.5 py-0.5 rounded text-[10px] ${zone.threat === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : zone.threat === 'ELEVATED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}">
          ${zone.threat}
        </span>
      </div>
      <p class="text-slate-300 text-[11px]">${zone.description}</p>
      <div class="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
        <span>Coverage: <strong class="text-emerald-400">${zone.densityPct}%</strong></span>
        <span>Sweep: <strong class="text-slate-200">${zone.sweepInterval}</strong></span>
        <span>Sensor: <strong class="text-cyan-300">${zone.fixedNode}</strong></span>
      </div>
    </div>
  `;
};

window.selectPatrolUnit = function(unitId) {
  heatmapState.selectedUnitId = unitId;
  const container = document.getElementById("main-tab-content");
  if (container && heatmapState.activeTab === "command") {
    // Re-render
    const wrapper = document.getElementById("station-heatmap-root");
    if (wrapper) renderStationHeatmapComponent(wrapper);
  }
};

window.filterPatrolUnits = function(filter) {
  heatmapState.activeFilter = filter;
  const wrapper = document.getElementById("station-heatmap-root");
  if (wrapper) renderStationHeatmapComponent(wrapper);
};

window.recenterOnUnit = function(unitId) {
  const unit = heatmapState.patrolUnits.find(u => u.id === unitId);
  if (unit && window.showToast) {
    window.showToast(`Centered Tactical HUD on ${unit.callsign} [${unit.zoneName}]`);
  }
};
