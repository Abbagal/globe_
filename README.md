# 🌍 Globe-1 - CPEC Intelligence & Visualization PlatformA sophisticated interactive 3D globe visualization application built with **React**, **CesiumJS**, and **TypeScript**. This platform provides intelligence visualization for China-Pakistan Economic Corridor (CPEC) infrastructure, military unit tracking, and mission planning capabilities.![Tech Stack](https://img.shields.io/badge/React-18.2.0-blue) ![Cesium](https://img.shields.io/badge/CesiumJS-1.114.0-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue) ![Vite](https://img.shields.io/badge/Vite-5.0.8-purple)---## 📋 Table of Contents1. [Features Overview](#-features-overview)2. [Tech Stack](#-tech-stack)3. [Getting Started](#-getting-started)4. [Project Structure](#-project-structure)5. [Component Documentation](#-component-documentation)6. [Data Files](#-data-files)7. [Feature Guide](#-feature-guide)8. [Customization Guide](#-customization-guide)9. [Common Tasks](#-common-tasks)10. [Troubleshooting](#-troubleshooting)11. [API Keys & Configuration](#-api-keys--configuration)---## 🚀 Features Overview### Core Features| Feature | Description | File(s) ||---------|-------------|---------|| **3D Globe Visualization** | Interactive Cesium globe with Google 3D tiles | `Globe.tsx` || **CPEC Routes** | Three color-coded economic corridor routes | `Globe.tsx`, `CPECSidebarNew.tsx` || **Unit Markers** | Military/strategic unit visualization with clustering | `Globe.tsx` || **Intel Workspace** | Mission planning and target analysis interface | `IntelWorkspace.tsx` || **Key Officials Sidebar** | Interactive cards for key personnel | `KeyOfficialsSidebar.tsx` || **Photo Gallery** | CPEC infrastructure image gallery | `PhotoGalleryModal.tsx` |### Intel Workspace Features- **Target Rings**: Animated destruction radius visualization with smooth transitions- **Asset Management**: Air, Surface, and Land asset selection with filtering- **Timeline Panel**: Resizable mission timeline with drag handle (up/down arrows)- **Mission Control**: Real-time status indicators and threat assessment- **Weaponeering**: Auto-calculated weapon-target pairing- **Unique Destruction Radii**: Each of the 9 assets has a specific destruction radius### Interactive Elements- Smooth camera animations with custom easing- Entity clustering for dense marker areas- Infobox popups with "Enter Intel Workspace" functionality- Route legend with visibility toggles- Minimizable sidebars with slide animations---## 🛠 Tech Stack| Technology | Purpose ||------------|---------|| **React 18** | UI Framework || **TypeScript** | Type-safe development || **CesiumJS** | 3D Globe rendering engine || **Vite** | Build tool & dev server || **React Icons** | Icon library (Fa, Gi icons) || **Google 3D Tiles** | Photorealistic terrain |
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

**Development URL**: [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```
Globe-1/
├── index.html              # Entry HTML file
├── package.json            # Dependencies & scripts
├── vite.config.ts          # Vite configuration with Cesium plugin
├── tsconfig.json           # TypeScript configuration
│
├── data/                   # JSON data files
│   ├── pakistan_army_locations.json    # Pakistan military units (~2338 lines)
│   └── Ground_Forces_Locations.json    # Chinese military units (~5154 lines)
│
├── public/
│   └── assets/             # Static images
│       ├── cpec-*.jpg      # CPEC infrastructure photos
│       └── *.jpg           # Official profile photos
│
└── src/
    ├── main.tsx            # React entry point
    ├── index.css           # Global styles
    ├── infobox-css.css     # Cesium infobox custom styles
    │
    ├── App.tsx             # Main application component (state management)
    ├── Globe.tsx           # 🌍 Core globe component (~1464 lines)
    ├── IntelWorkspace.tsx  # 🎯 Intel/mission planning UI (~1100 lines)
    │
    ├── CPECSidebarNew.tsx  # CPEC info sidebar (active version)
    ├── CPECSidebar.tsx     # Legacy sidebar v1 (deprecated)
    ├── CPECSidebar2.tsx    # Legacy sidebar v2 (deprecated)
    │
    ├── KeyOfficialsSidebar.tsx  # Officials directory
    ├── OfficialModal.tsx        # Official detail modal with documents
    ├── PhotoGalleryModal.tsx    # Image gallery modal
    ├── RouteLegend.tsx          # CPEC route legend component
    │
    ├── CameraController.ts      # Camera animation utilities
    └── GeocodingService.ts      # Location search service (Nominatim)
```

---

## 📦 Component Documentation

### 1. `Globe.tsx` - Core Globe Component

**Purpose**: Renders the 3D Cesium globe with all entities, routes, and interactions.

**Location**: `/src/Globe.tsx` (~1464 lines)

**Key Exports**:
```typescript
interface GlobeRef {
  flyTo: (lon, lat, height?) => void;           // Fly to coordinates
  flyToBounds: (bbox) => void;                  // Fly to bounding box
  showCPECRoute: () => void;                    // Show all CPEC routes
  hideCPECRoute: () => void;                    // Hide all CPEC routes
  showSingleRoute: (routeId) => void;           // Show specific route
  showAllRoutes: () => void;                    // Show all routes
  searchUnit: (query) => boolean;               // Search for unit
  getScreenPosition: (lon, lat) => {x, y};      // World to screen coords
  addTargetEntity: (lon, lat, name, radius?) => void;  // Add target rings
  updateTargetRings: (radius) => void;          // Animate ring size change
  removeTargetEntity: () => void;               // Remove target
  flyToUnit: (lon, lat, height?) => void;       // Fly to unit location
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

**Target Ring Animation** (lines 1028-1120):
- Uses `CallbackProperty` for smooth radius updates
- Animation duration: 400ms with ease-out cubic easing
- Three concentric rings: outer (100%), middle (70%), inner (40%)

---

### 2. `IntelWorkspace.tsx` - Mission Planning Interface

**Purpose**: Full-screen overlay for target analysis and asset assignment.

**Location**: `/src/IntelWorkspace.tsx` (~1100 lines)

**Key Features**:
- Target selection and aimpoints display
- Asset list with filtering (Air/Surface/Land)
- Destruction radius per asset (animated transitions)
- Resizable bottom timeline panel (100px-500px)
- Mission Control sidebar with threat assessment

**Important Functions**:

```typescript
// Calculate unique destruction radius per asset (lines 27-90)
const getDestructionRadius = (assetId: string, assetType: string, munitions: string[]): number

// Asset radius mapping (lines 32-45)
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
  isVisible: boolean;                    // Show/hide workspace
  onClose: () => void;                   // Exit callback
  unit: UnitData | null;                 // Selected target unit
  onAssetSelected?: (                    // Asset selection callback
    assetId: string | null, 
    destructionRadius: number
  ) => void;
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
│              │                         │  - Threat      │
│              │                         │  - Parameters  │
│              │                         │  - Weaponeering│
├──────────────┴─────────────────────────┼────────────────┤
│           BOTTOM TIMELINE PANEL         │    (extends)   │
│  [Resize Handle with ↑↓]               │                │
│  - Time markers                         │                │
│  - Asset timeline rows                  │                │
│  - Mission status indicators            │                │
└─────────────────────────────────────────┴────────────────┘
```

**Resize Handle Implementation** (lines 260-310):
```typescript
// Min/Max constraints
const newHeight = Math.min(Math.max(height, 100), 500);

// Drag state
const [bottomPanelHeight, setBottomPanelHeight] = useState(220);
const [isDragging, setIsDragging] = useState(false);
```

---

### 3. `CPECSidebarNew.tsx` - CPEC Information Sidebar

**Purpose**: Displays CPEC corridor information with minimize/expand animation.

**Features**:
- Slide-in/out animation (CSS transition)
- Route legend integration
- Route visibility toggles (Western/Central/Eastern)
- Project statistics and metrics
- Minimize button (chevron icon)

**Props**:
```typescript
interface CPECSidebarNewProps {
  isVisible: boolean;
  onClose: () => void;
  globeRef: React.RefObject<GlobeRef>;
}
```

---

### 4. `KeyOfficialsSidebar.tsx` - Officials Directory

**Purpose**: Interactive list of key personnel with profile cards.

**Data Structure**:
```typescript
interface Official {
  id: string;
  name: string;
  role: string;
  image: string;           // Path to /public/assets/
  country: 'Pakistan' | 'China';
  description: string;
  documents?: Document[];  // Associated documents
}
```

---

### 5. `CameraController.ts` - Camera Utilities

**Purpose**: Smooth camera animations and transitions.

**Location**: `/src/CameraController.ts` (56 lines)

**Methods**:
```typescript
class CameraController {
  constructor(camera: Camera);
  
  // Smooth fly-to with easing
  rotateAndZoomTo(
    lon: number, 
    lat: number, 
    options?: { duration?: number; zoomHeight?: number }
  ): void;
  
  // Fly to bounding box region
  flyToBoundingBox(bbox: [minLat, maxLat, minLon, maxLon]): void;
}
```

**Default Options**:
- `duration`: 3.0 seconds
- `zoomHeight`: 2000 meters
- `easingFunction`: QUADRATIC_IN_OUT

---

### 6. `App.tsx` - Application Shell

**Purpose**: Main layout, state management, sidebar coordination.

**Location**: `/src/App.tsx` (~745 lines)

**Key State Variables**:
```typescript
const [showCPECSidebar, setShowCPECSidebar] = useState(false);
const [showKeyOfficialsSidebar, setShowKeyOfficialsSidebar] = useState(false);
const [showIntelWorkspace, setShowIntelWorkspace] = useState(false);
const [selectedUnit, setSelectedUnit] = useState<UnitData | null>(null);
const [cpecLoading, setCpecLoading] = useState(false);
const [intelLoading, setIntelLoading] = useState(false);
```

**Intel Workspace Entry Point** (lines 235-260):
```typescript
onEnterIntelWorkspace={async (unit) => {
  setSelectedUnit(unit);
  setShowCPECSidebar(false);
  await animateIntelLoading();
  setShowIntelWorkspace(true);
  
  // Fly to unit with consistent zoom
  globeRef.current.flyToUnit(
    unit.coordinates.lon,
    unit.coordinates.lat,
    8000  // Consistent height for all terrains
  );
  
  // Add target rings
  globeRef.current.addTargetEntity(
    unit.coordinates.lon,
    unit.coordinates.lat,
    unit.name
  );
}}
```

---

## 📊 Data Files

### `pakistan_army_locations.json`

**Location**: `/data/pakistan_army_locations.json`

**Size**: ~2338 lines

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

**Unit Types Available**:
- HQ, Strike Corps, Infantry Division
- Armoured Brigade, Artillery Regiment
- Air Defence, Signal Corps
- And many more...

---

### `Ground_Forces_Locations.json`

**Location**: `/data/Ground_Forces_Locations.json`

**Size**: ~5154 lines

**Contains**: Chinese PLA Ground Forces locations

**Same Structure** as Pakistan data with additional:
- Theater Command (TC) information
- More detailed remarks about deployments

**Source Tags** (added at runtime):
- `"PAK"` - Pakistan units (from pakistan_army_locations.json)
- `"CHN"` - Chinese units (from Ground_Forces_Locations.json)

---

## 🎯 Feature Guide

### How to Open Intel Workspace

1. **Enable Markers**: Click the eye icon toggle on the globe UI
2. **Select a Unit**: Click on any unit marker (not a cluster)
3. **View Infobox**: A popup appears with unit details
4. **Enter Workspace**: Click the **"ENTER INTEL WORKSPACE"** button
5. **Loading Animation**: Brief cyber-themed loading screen
6. **Workspace Opens**: Globe zooms to target with animated rings

### How Target Rings Work

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

### Asset Categories

| Filter | Assets |
|--------|--------|
| **Air** | E-8C, E-3, F-16CM, AWACS |
| **Surface** | CVN-68 Nimitz, CG-64 Gettysburg |
| **Land** | M1A2 Abrams, M777A2, HIMARS |

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
| Fly to Location | Use search or click marker |

### Bottom Panel Resize

1. **Locate Handle**: Center of bottom panel top edge
2. **Grab Handle**: Click and hold the ↑↓ icon
3. **Drag**: Move up/down to resize
4. **Constraints**: Min 100px, Max 500px
5. **Visual Feedback**: Handle highlights when dragging

---

## 🔧 Customization Guide

### Adding New Unit Types

**File**: `Globe.tsx` → `getUnitStyle()` function (around line 200)

```typescript
const getUnitStyle = (unitType: string) => {
  switch (unitType.toLowerCase()) {
    // Add your new type here
    case "special forces":
      return { 
        category: "SPECIAL", 
        color: "#FF00FF",  // Magenta
        icon: FaUserSecret  // Import from react-icons
      };
    
    // ... existing types
    default:
      return { category: "OTHER", color: "#888888", icon: FaQuestion };
  }
};
```

**Don't forget to**:
1. Import the icon at the top of the file
2. Add the category to filter UI if needed

---

### Adding New Assets to Intel Workspace

**File**: `IntelWorkspace.tsx`

**Step 1**: Add to `generateMockAssets()` array (line ~96):
```typescript
{
  id: 'new-asset-unique-id',      // Must be unique
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
  approved: '1 APPROVED',  // Optional
  subType: '(2x)',         // Optional
},
```

**Step 2**: Add to `assetRadiusMap` (line ~32):
```typescript
const assetRadiusMap: { [key: string]: number } = {
  // ... existing assets
  'new-asset-unique-id': 600,  // Radius in meters
};
```

---

### Modifying CPEC Routes

**File**: `Globe.tsx` → `cpecRoutes` array (around line 780)

**Add New Route**:
```typescript
{
  id: "new_route",
  name: "New Route Name",
  color: "#HEX_COLOR",
  coordinates: [
    [longitude1, latitude1],  // Start point
    [longitude2, latitude2],  // Waypoint
    [longitude3, latitude3],  // End point
    // Add more waypoints as needed
  ]
}
```

**Modify Existing Route Color**:
```typescript
{ id: "western", color: "#FF0000", ... }  // Change to red
```

---

### Changing Zoom Level for Intel Workspace

**File**: `App.tsx` → `onEnterIntelWorkspace` callback (line ~247)

```typescript
globeRef.current.flyToUnit(
  unit.coordinates.lon,
  unit.coordinates.lat,
  8000  // <-- Change this value (meters above sea level)
);
```

**Recommended Values**:
- `4000`: Close-up view (may clip into terrain in highlands)
- `8000`: Default - works for all terrains
- `15000`: Regional overview
- `50000`: Wide area view

---

### Adding New Officials

**File**: `KeyOfficialsSidebar.tsx` → officials array

```typescript
{
  id: "unique-id",
  name: "Official Full Name",
  role: "Title / Position",
  image: "/assets/official-photo.jpg",  // Add image to public/assets/
  country: "Pakistan" | "China",
  description: "Brief biography and role description..."
}
```

**Image Requirements**:
- Format: JPG or PNG
- Size: ~200x200px recommended
- Location: `/public/assets/`

---

### Styling Infobox Popups

**File**: `infobox-css.css`

This controls the Cesium infobox styling including the "ENTER INTEL WORKSPACE" button.

```css
/* Main infobox container */
.cesium-infoBox {
  background: rgba(13, 13, 21, 0.95);
}

/* Intel Workspace button */
.intel-workspace-btn {
  background: linear-gradient(...);
  color: #00e5ff;
}
```

---

### Modifying Animation Durations

**Ring Animation** (`Globe.tsx` line ~1078):
```typescript
const animationDuration = 400; // Change milliseconds
```

**Camera Fly Animation** (`CameraController.ts` line ~23):
```typescript
const { duration = 3.0, zoomHeight = 2000 } = options;
```

**Easing Functions Available**:
```typescript
import { EasingFunction } from 'cesium';

// Options:
EasingFunction.LINEAR
EasingFunction.QUADRATIC_IN_OUT
EasingFunction.CUBIC_IN_OUT
EasingFunction.EXPONENTIAL_IN_OUT
```

---

## 📝 Common Tasks

### Task 1: Add a New Military Unit

1. Open appropriate data file:
   - Pakistan: `data/pakistan_army_locations.json`
   - China: `data/Ground_Forces_Locations.json`

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

3. Save file and refresh browser

---

### Task 2: Change Route Colors

1. Open `Globe.tsx`
2. Find `cpecRoutes` array (~line 780)
3. Modify the `color` property:

```typescript
{ id: "western", color: "#FF0000", ... }   // Red
{ id: "central", color: "#00FFFF", ... }   // Cyan
{ id: "eastern", color: "#FF00FF", ... }   // Magenta
```

---

### Task 3: Add New Filter Category

1. **Globe.tsx**: Update `getUnitStyle()` to return new category
2. **Globe.tsx**: Add filter button in render section (~line 1350):

```typescript
<button
  onClick={() => setActiveCategory("NEW_CATEGORY")}
  style={{
    background: activeCategory === "NEW_CATEGORY" ? "#00e5ff" : "transparent",
    // ...
  }}
>
  New Category
</button>
```

---

### Task 4: Modify Bottom Panel Constraints

**File**: `IntelWorkspace.tsx` → `useEffect` with `handleMouseMove` (~line 280)

```typescript
const newHeight = Math.min(
  Math.max(dragStartHeight.current + deltaY, 150),  // Change min (was 100)
  600   // Change max (was 500)
);
```

---

### Task 5: Add Loading Animation Text

**File**: `App.tsx` → Loading overlay section (~line 290-350)

Find the loading messages array and add/modify:
```typescript
const loadingMessages = [
  "Initializing Intel Systems...",
  "Your New Message...",
  // ...
];
```

---

## 🐛 Troubleshooting

### Globe Not Loading

**Symptoms**: Black screen, no terrain

**Solutions**:
1. Check browser console (F12) for errors
2. Verify Google Maps API key in `Globe.tsx`:
   ```typescript
   GoogleMaps.defaultApiKey = "YOUR_VALID_KEY";
   ```
3. Ensure API key has Maps JavaScript API and Map Tiles API enabled
4. Check for CORS errors in Network tab
5. Try clearing browser cache

---

### Markers Not Showing

**Symptoms**: Globe loads but no unit markers

**Solutions**:
1. Click the "Show Markers" eye icon toggle
2. Check if filters are excluding all units
3. Try "ALL" source and "ALL" category filters
4. Verify JSON data files are valid (no syntax errors)
5. Check console for data loading errors

---

### Intel Workspace Not Opening

**Symptoms**: Click marker but no workspace appears

**Solutions**:
1. Ensure markers are visible (not just clusters)
2. Click directly on a single marker (zoom in if needed)
3. Check console for errors in message handler
4. Verify `onEnterIntelWorkspace` callback is set in App.tsx

---

### Animation Lag / Performance Issues

**Symptoms**: Choppy animations, slow response

**Solutions**:
1. Reduce number of visible entities (use filters)
2. Check `requestRenderMode` in Globe.tsx (~line 530):
   ```typescript
   requestRenderMode: true,  // Enable for better performance
   ```
3. Close other browser tabs
4. Check GPU usage in Task Manager
5. Try a different browser (Chrome recommended)

---

### Chinese Units Zoom Too Close / Into Terrain

**Symptoms**: Camera goes underground for Chinese units

**Cause**: Terrain elevation differences (Tibet plateau vs Pakistan lowlands)

**Solution**: Fixed by using 8000m zoom height in `App.tsx`:
```typescript
globeRef.current.flyToUnit(lon, lat, 8000);
```

---

### Target Rings Not Animating

**Symptoms**: Rings change size instantly, no smooth transition

**Solutions**:
1. Verify `CallbackProperty` is imported in Globe.tsx
2. Check `animationRef` is properly initialized
3. Ensure `requestAnimationFrame` is not being blocked
4. Check browser console for errors

---

### Sidebar Not Sliding

**Symptoms**: Sidebar appears/disappears instantly

**Solutions**:
1. Check CSS transition properties in component
2. Verify `transform` style is being applied
3. Ensure `transition` duration is set (e.g., `0.3s ease`)

---

## 🔑 API Keys & Configuration

### Google Maps API

**Location**: `Globe.tsx` line ~512
```typescript
GoogleMaps.defaultApiKey = "YOUR_API_KEY";
```

**Required APIs** (enable in Google Cloud Console):
- Maps JavaScript API
- Map Tiles API (for 3D Tiles)

**Getting a Key**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable required APIs
4. Create credentials → API Key
5. (Recommended) Restrict key to your domain

---

### Cesium Ion

**Location**: `vite.config.ts` or directly in code

**Getting a Token**:
1. Go to [Cesium Ion](https://cesium.com/ion/)
2. Create free account
3. Go to Access Tokens
4. Create new token with asset access

**Configuration in vite.config.ts**:
```typescript
import cesium from 'vite-plugin-cesium';

export default defineConfig({
  plugins: [
    react(),
    cesium({
      cesiumBaseUrl: 'cesium',
    })
  ],
  define: {
    CESIUM_BASE_URL: JSON.stringify('/cesium'),
  }
});
```

---

## 📚 Additional Resources

### Cesium Documentation
- [CesiumJS Docs](https://cesium.com/learn/cesiumjs/ref-doc/)
- [Cesium Sandcastle](https://sandcastle.cesium.com/) - Interactive examples

### React Icons
- [React Icons Gallery](https://react-icons.github.io/react-icons/)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)

---

## 🤝 Contributing

1. Create a feature branch from `main`
2. Follow existing code style (TypeScript, React hooks, inline styles)
3. Test on both Pakistan and Chinese unit data
4. Test all three CPEC routes
5. Verify Intel Workspace functionality
6. Update this README if adding new features
7. Submit pull request with clear description

### Code Style Guidelines

- Use TypeScript strict mode
- Prefer functional components with hooks
- Use inline styles (existing pattern) or CSS modules
- Add comments for complex logic
- Keep components under 500 lines when possible

---

## 📜 License

Proprietary - KonectU

---

## 👨‍💻 Authors

- Development Team @ KonectU

---

## 📞 Support

For questions or issues, contact the development team or create an issue in the repository.

---

## 📝 Changelog

### December 2024
- Added smooth animated radius transitions for target rings
- Fixed zoom consistency for Chinese/Pakistan units (8000m)
- Added unique destruction radius per asset (9 assets)
- Added resize handle with up/down arrows for bottom panel
- Improved TARGET LOCKED visibility with background
- Updated CPEC route colors (Western=Yellow, Central=Lime)

---

*Last Updated: December 2024*
