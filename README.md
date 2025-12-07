# 🌍 Globe-1 - CPEC Intelligence & Visualization Platform

A sophisticated interactive 3D globe visualization application built with **React**, **CesiumJS**, and **TypeScript**. This platform provides intelligence visualization for China-Pakistan Economic Corridor (CPEC) infrastructure, military unit tracking, and mission planning capabilities.

![React](https://img.shields.io/badge/React-18.2.0-blue)
![Cesium](https://img.shields.io/badge/CesiumJS-1.114.0-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue)
![Vite](https://img.shields.io/badge/Vite-5.0.8-purple)

---

## 📋 Table of Contents

1. [Features Overview](#-features-overview)
2. [Tech Stack](#-tech-stack)
3. [Getting Started](#-getting-started)
4. [Project Structure](#-project-structure)
5. [Component Documentation](#-component-documentation)
6. [Data Files](#-data-files)
7. [Feature Guide](#-feature-guide)
8. [Customization Guide](#-customization-guide)
9. [Common Tasks](#-common-tasks)
10. [Troubleshooting](#-troubleshooting)
11. [API Keys & Configuration](#-api-keys--configuration)

---

## 🚀 Features Overview

### Core Features

| Feature | Description | File(s) |
|---------|-------------|---------|
| **3D Globe Visualization** | Interactive Cesium globe with Google 3D tiles | `Globe.tsx` |
| **CPEC Routes** | Three color-coded economic corridor routes | `Globe.tsx`, `CPECSidebarNew.tsx` |
| **Unit Markers** | Military/strategic unit visualization with clustering | `Globe.tsx` |
| **Intel Workspace** | Mission planning and target analysis interface | `IntelWorkspace.tsx` |
| **Key Officials Sidebar** | Interactive cards for key personnel | `KeyOfficialsSidebar.tsx` |
| **Photo Gallery** | CPEC infrastructure image gallery | `PhotoGalleryModal.tsx` |

### Intel Workspace Features

- **Target Rings**: Animated destruction radius visualization with smooth transitions
- **Asset Management**: Air, Surface, and Land asset selection with filtering
- **Timeline Panel**: Resizable mission timeline with drag handle (up/down arrows)
- **Mission Control**: Real-time status indicators and threat assessment
- **Weaponeering**: Auto-calculated weapon-target pairing
- **Unique Destruction Radii**: Each of the 9 assets has a specific destruction radius

### Interactive Elements

- Smooth camera animations with custom easing
- Entity clustering for dense marker areas
- Infobox popups with "Enter Intel Workspace" functionality
- Route legend with visibility toggles
- Minimizable sidebars with slide animations

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework |
| **TypeScript** | Type-safe development |
| **CesiumJS** | 3D Globe rendering engine |
| **Vite** | Build tool & dev server |
| **React Icons** | Icon library (Fa, Gi icons) |
| **Google 3D Tiles** | Photorealistic terrain |

---

## 🏁 Getting Started

### Prerequisites

- **Node.js** v16 or higher
- **npm** or **yarn**
- **Google Maps API Key** (for 3D tiles)
- **Cesium Ion Access Token** (for terrain)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Globe-1

# Install dependencies
npm install
```

### Environment Setup

The application uses API keys configured directly in the source files:

1. **Google Maps API Key**: Located in `Globe.tsx` line ~512
```typescript
GoogleMaps.defaultApiKey = "YOUR_GOOGLE_MAPS_API_KEY";
```

2. **Cesium Ion Token**: Configured in `vite.config.ts` or directly in code

### Running the Application

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

**Development URL**: http://localhost:5173

---

## 📁 Project Structure

```
Globe-1/
├── index.html                    # Entry HTML file
├── package.json                  # Dependencies & scripts
├── vite.config.ts               # Vite configuration with Cesium plugin
├── tsconfig.json                # TypeScript configuration
│
├── data/                        # JSON data files
│   ├── pakistan_army_locations.json    # Pakistan military units
│   └── Ground_Forces_Locations.json    # Chinese military units
│
├── public/
│   └── assets/                  # Static images
│       ├── cpec-*.jpg          # CPEC infrastructure photos
│       └── *.jpg               # Official profile photos
│
└── src/
    ├── main.tsx                 # React entry point
    ├── index.css                # Global styles
    ├── infobox-css.css          # Cesium infobox custom styles
    │
    ├── App.tsx                  # Main application component
    ├── Globe.tsx                # 🌍 Core globe component (~1464 lines)
    ├── IntelWorkspace.tsx       # 🎯 Intel/mission planning UI
    │
    ├── CPECSidebarNew.tsx       # CPEC info sidebar (active)
    ├── CPECSidebar.tsx          # Legacy sidebar v1
    ├── CPECSidebar2.tsx         # Legacy sidebar v2
    │
    ├── KeyOfficialsSidebar.tsx  # Officials directory
    ├── OfficialModal.tsx        # Official detail modal
    ├── PhotoGalleryModal.tsx    # Image gallery modal
    ├── RouteLegend.tsx          # CPEC route legend
    │
    ├── CameraController.ts      # Camera animation utilities
    └── GeocodingService.ts      # Location search service
```

---

## 📦 Component Documentation

### 1. Globe.tsx - Core Globe Component

**Purpose**: Renders the 3D Cesium globe with all entities, routes, and interactions.

**Location**: `src/Globe.tsx` (~1464 lines)

**Key Exports**:

```typescript
interface GlobeRef {
  flyTo: (lon, lat, height?) => void;
  flyToBounds: (bbox) => void;
  showCPECRoute: () => void;
  hideCPECRoute: () => void;
  showSingleRoute: (routeId) => void;
  showAllRoutes: () => void;
  searchUnit: (query) => boolean;
  getScreenPosition: (lon, lat) => {x, y};
  addTargetEntity: (lon, lat, name, radius?) => void;
  updateTargetRings: (radius) => void;
  removeTargetEntity: () => void;
  flyToUnit: (lon, lat, height?) => void;
}
```

**Key Sections by Line Numbers**:

| Lines | Section |
|-------|---------|
| 1-60 | Imports (Cesium, React, Icons, Data) |
| 60-110 | `createCircularIcon()` - Icon generation with caching |
| 200-400 | `getUnitStyle()` - Unit type to color/icon mapping |
| 410-440 | `GlobeRef` interface definition |
| 448-470 | Component refs (viewer, camera, entities) |
| 500-700 | Cesium Viewer initialization |
| 620-700 | Entity data loading and clustering |
| 720-750 | Intel Workspace message listener |
| 770-850 | CPEC route definitions |
| 850-920 | Route rendering functions |
| 920-1150 | `useImperativeHandle` - All exposed methods |
| 1150-1400 | UI rendering (filters, buttons) |

**CPEC Routes** (around line 770):

```typescript
const cpecRoutes = [
  { 
    id: "western", 
    name: "Western Route", 
    color: "#FFFF00",  // Yellow
    coordinates: [[lon, lat], ...] 
  },
  { 
    id: "central", 
    name: "Central Route", 
    color: "#00FF00",  // Lime Green
    coordinates: [[lon, lat], ...] 
  },
  { 
    id: "eastern", 
    name: "Eastern Route", 
    color: "#FFA500",  // Orange
    coordinates: [[lon, lat], ...] 
  }
];
```

---

### 2. IntelWorkspace.tsx - Mission Planning Interface

**Purpose**: Full-screen overlay for target analysis and asset assignment.

**Location**: `src/IntelWorkspace.tsx` (~1100 lines)

**Key Features**:
- Target selection and aimpoints display
- Asset list with filtering (Air/Surface/Land)
- Destruction radius per asset (animated transitions)
- Resizable bottom timeline panel (100px-500px)
- Mission Control sidebar with threat assessment

**Asset Radius Mapping** (lines 32-45):

```typescript
const assetRadiusMap: { [key: string]: number } = {
  // Air Assets
  'dragnet71-11-2': 850,    // E-8C with BGM-109 (24x)
  'magic41-1-2': 680,       // E-3 with BGM-109 (4x)
  'mako61-12-2': 520,       // F-16CM with mixed loadout
  'sentry41-2-1': 180,      // AWACS - surveillance only
  
  // Surface Assets
  'destroyer-cvn-01': 1100, // CVN-68 with Tomahawk (24x)
  'cruiser-cg-01': 920,     // CG-64 with Tomahawk (16x)
  
  // Land Assets
  'armor-tank-01': 280,     // M1A2 Abrams
  'artillery-m777': 650,    // M777A2 with Excalibur
  'mlrs-himars-01': 780,    // HIMARS with ATACMS
};
```

**Props Interface**:

```typescript
interface IntelWorkspaceProps {
  isVisible: boolean;
  onClose: () => void;
  unit: UnitData | null;
  onAssetSelected?: (assetId: string | null, destructionRadius: number) => void;
}
```

**Layout Structure**:

```
┌─────────────────────────────────────────────────────────┐
│                     TOP BAR (50px)                       │
│  [INTEL WORKSPACE]  [Target Badge]  [LIVE]  [EXIT]      │
├──────────────┬─────────────────────────┬────────────────┤
│              │                         │                │
│   LEFT       │      CENTER AREA        │    RIGHT       │
│   SIDEBAR    │    (Transparent -       │    SIDEBAR     │
│   (320px)    │     shows globe)        │    (300px)     │
│              │                         │                │
│  - Target    │   [TARGET LOCKED HUD]   │  MISSION       │
│  - Assets    │   [ASSIGN ASSET BAR]    │  CONTROL       │
│  - Filters   │                         │                │
├──────────────┴─────────────────────────┴────────────────┤
│              BOTTOM TIMELINE PANEL                       │
│  [Resize Handle with ↑↓]                                │
│  - Time markers                                          │
│  - Asset timeline rows                                   │
│  - Mission status indicators                             │
└──────────────────────────────────────────────────────────┘
```

---

### 3. CPECSidebarNew.tsx - CPEC Information Sidebar

**Purpose**: Displays CPEC corridor information with minimize/expand animation.

**Features**:
- Slide-in/out animation (CSS transition)
- Route legend integration
- Route visibility toggles (Western/Central/Eastern)
- Project statistics and metrics
- Minimize button (chevron icon)

---

### 4. KeyOfficialsSidebar.tsx - Officials Directory

**Purpose**: Interactive list of key personnel with profile cards.

**Data Structure**:

```typescript
interface Official {
  id: string;
  name: string;
  role: string;
  image: string;
  country: 'Pakistan' | 'China';
  description: string;
}
```

---

### 5. CameraController.ts - Camera Utilities

**Purpose**: Smooth camera animations and transitions.

**Location**: `src/CameraController.ts` (56 lines)

**Methods**:

```typescript
class CameraController {
  constructor(camera: Camera);
  
  rotateAndZoomTo(
    lon: number, 
    lat: number, 
    options?: { duration?: number; zoomHeight?: number }
  ): void;
  
  flyToBoundingBox(bbox: [minLat, maxLat, minLon, maxLon]): void;
}
```

**Default Options**:
- `duration`: 3.0 seconds
- `zoomHeight`: 2000 meters
- `easingFunction`: QUADRATIC_IN_OUT

---

### 6. App.tsx - Application Shell

**Purpose**: Main layout, state management, sidebar coordination.

**Location**: `src/App.tsx` (~745 lines)

**Key State Variables**:

```typescript
const [showCPECSidebar, setShowCPECSidebar] = useState(false);
const [showKeyOfficialsSidebar, setShowKeyOfficialsSidebar] = useState(false);
const [showIntelWorkspace, setShowIntelWorkspace] = useState(false);
const [selectedUnit, setSelectedUnit] = useState<UnitData | null>(null);
```

---

## 📊 Data Files

### pakistan_army_locations.json

**Location**: `data/pakistan_army_locations.json`

**Structure**:

```json
{
  "name": "General HQ",
  "type": "HQ",
  "locationName": "Rawalpindi, Punjab",
  "coordinates": {
    "lat": 33.589908333333334,
    "lon": 73.05040833333334
  },
  "details": {
    "corps": "I Corps",
    "division": "6th Armoured",
    "remarks": "Additional notes...",
    "phone": "",
    "reference": "Source URL"
  }
}
```

### Ground_Forces_Locations.json

**Location**: `data/Ground_Forces_Locations.json`

**Contains**: Chinese PLA Ground Forces locations (same structure as Pakistan data)

**Source Tags** (added at runtime):
- `"PAK"` - Pakistan units
- `"CHN"` - Chinese units

---

## 🎯 Feature Guide

### Opening Intel Workspace

1. **Enable Markers**: Click the eye icon toggle on the globe UI
2. **Select a Unit**: Click on any unit marker (not a cluster)
3. **View Infobox**: A popup appears with unit details
4. **Enter Workspace**: Click the **"ENTER INTEL WORKSPACE"** button
5. **Loading Animation**: Brief cyber-themed loading screen
6. **Workspace Opens**: Globe zooms to target with animated rings

### Target Ring Animation

- **Three Concentric Rings**: Outer, Middle (70%), Inner (40%)
- **Color**: Pink/Magenta (#ff0064)
- **Animation**: Smooth size transitions using `CallbackProperty`
- **Update**: Rings resize when selecting different assets

### Changing Target Ring Size

1. Open Intel Workspace on any target
2. In the **left sidebar**, view the asset list
3. **Click an asset** (e.g., "Dragnet71-11-2")
4. Rings **animate smoothly** to the asset's destruction radius
5. Click the same asset again to **deselect** (returns to default 500m)

### CPEC Route Visibility

1. **Open CPEC Sidebar**: Click top-left CPEC button
2. **Route Legend**: Shows at bottom of sidebar
3. **Toggle Routes**: Click route name or checkbox
4. **Route Colors**:
   - Western Route: **Yellow** (#FFFF00)
   - Central Route: **Lime** (#00FF00)
   - Eastern Route: **Orange** (#FFA500)

### Camera Navigation

| Action | Control |
|--------|---------|
| Rotate Globe | Left-click + drag |
| Zoom | Mouse scroll |
| Pan | Right-click + drag |
| Tilt | Middle-click + drag |

### Bottom Panel Resize

1. **Locate Handle**: Center of bottom panel top edge
2. **Grab Handle**: Click and hold the ↑↓ icon
3. **Drag**: Move up/down to resize
4. **Constraints**: Min 100px, Max 500px

---

## 🔧 Customization Guide

### Adding New Unit Types

**File**: `Globe.tsx` → `getUnitStyle()` function (around line 200)

```typescript
const getUnitStyle = (unitType: string) => {
  switch (unitType.toLowerCase()) {
    case "special forces":
      return { 
        category: "SPECIAL", 
        color: "#FF00FF",
        icon: FaUserSecret
      };
    // ... existing types
  }
};
```

---

### Adding New Assets to Intel Workspace

**File**: `IntelWorkspace.tsx`

**Step 1**: Add to `generateMockAssets()` array (line ~96):

```typescript
{
  id: 'new-asset-unique-id',
  name: 'Asset Display Name',
  type: 'Platform Type',
  category: 'air' | 'surface' | 'land',
  match: 'TOP MATCH' | 'FAIR MATCH',
  matchColor: '#00ff00' | '#ffaa00',
  munitions: ['Weapon1 (Qty)', 'Weapon2 (Qty)'],
  missionTasks: 5,
  taskType: 'Mission Type Code',
  duration: '1h 30m 00s',
  status: 'LIVE',
  proposed: '3 PROPOSED',
}
```

**Step 2**: Add to `assetRadiusMap` (line ~32):

```typescript
'new-asset-unique-id': 600,  // Radius in meters
```

---

### Modifying CPEC Routes

**File**: `Globe.tsx` → `cpecRoutes` array (around line 780)

```typescript
{
  id: "new_route",
  name: "New Route Name",
  color: "#HEX_COLOR",
  coordinates: [
    [longitude1, latitude1],
    [longitude2, latitude2],
  ]
}
```

---

### Changing Zoom Level for Intel Workspace

**File**: `App.tsx` → `onEnterIntelWorkspace` callback (line ~247)

```typescript
globeRef.current.flyToUnit(
  unit.coordinates.lon,
  unit.coordinates.lat,
  8000  // Change this value (meters above sea level)
);
```

**Recommended Values**:
- `4000`: Close-up (may clip terrain in highlands)
- `8000`: Default - works for all terrains
- `15000`: Regional overview
- `50000`: Wide area view

---

### Adding New Officials

**File**: `KeyOfficialsSidebar.tsx`

```typescript
{
  id: "unique-id",
  name: "Official Full Name",
  role: "Title / Position",
  image: "/assets/official-photo.jpg",
  country: "Pakistan" | "China",
  description: "Brief biography..."
}
```

---

## 📝 Common Tasks

### Task 1: Add a New Military Unit

1. Open `data/pakistan_army_locations.json` or `data/Ground_Forces_Locations.json`
2. Add new entry:

```json
{
  "name": "New Unit Name",
  "type": "Infantry Brigade",
  "locationName": "City, Province",
  "coordinates": {
    "lat": 30.123456,
    "lon": 70.654321
  },
  "details": {
    "corps": "Parent Corps",
    "division": "Parent Division",
    "remarks": "Additional info",
    "reference": "Source URL"
  }
}
```

3. Save and refresh browser

---

### Task 2: Change Route Colors

1. Open `Globe.tsx`
2. Find `cpecRoutes` array (~line 780)
3. Modify the `color` property:

```typescript
{ id: "western", color: "#FF0000", ... }  // Red
```

---

### Task 3: Modify Bottom Panel Constraints

**File**: `IntelWorkspace.tsx` (~line 280)

```typescript
const newHeight = Math.min(
  Math.max(dragStartHeight.current + deltaY, 150),  // Min height
  600   // Max height
);
```

---

## 🐛 Troubleshooting

### Globe Not Loading

**Solutions**:
1. Check browser console (F12) for errors
2. Verify Google Maps API key in `Globe.tsx`
3. Ensure API key has Maps JavaScript API enabled
4. Check for CORS errors in Network tab

### Markers Not Showing

**Solutions**:
1. Click the "Show Markers" eye icon toggle
2. Check if filters are excluding all units
3. Try "ALL" source and "ALL" category filters

### Intel Workspace Not Opening

**Solutions**:
1. Ensure markers are visible (not just clusters)
2. Click directly on a single marker (zoom in if needed)
3. Check console for errors

### Chinese Units Zoom Too Close

**Cause**: Terrain elevation differences (Tibet plateau vs Pakistan lowlands)

**Solution**: Fixed by using 8000m zoom height in `App.tsx`

### Target Rings Not Animating

**Solutions**:
1. Verify `CallbackProperty` is imported in Globe.tsx
2. Check `animationRef` is properly initialized
3. Check browser console for errors

---

## 🔑 API Keys & Configuration

### Google Maps API

**Location**: `Globe.tsx` line ~512

```typescript
GoogleMaps.defaultApiKey = "YOUR_API_KEY";
```

**Required APIs**:
- Maps JavaScript API
- Map Tiles API (for 3D Tiles)

### Cesium Ion

**Getting a Token**:
1. Go to https://cesium.com/ion/
2. Create free account
3. Go to Access Tokens
4. Create new token

---

## 📚 Additional Resources

- [CesiumJS Docs](https://cesium.com/learn/cesiumjs/ref-doc/)
- [Cesium Sandcastle](https://sandcastle.cesium.com/)
- [React Icons Gallery](https://react-icons.github.io/react-icons/)

---

## 🤝 Contributing

1. Create a feature branch from `main`
2. Follow existing code style
3. Test on both Pakistan and Chinese unit data
4. Update this README if adding new features
5. Submit pull request

---

## 📝 Changelog

### December 2024

- Added smooth animated radius transitions for target rings
- Fixed zoom consistency for Chinese/Pakistan units (8000m)
- Added unique destruction radius per asset (9 assets)
- Added resize handle with up/down arrows for bottom panel
- Updated CPEC route colors (Western=Yellow, Central=Lime)

---

## 📜 License

Proprietary - KonectU

---

*Last Updated: December 2024*
