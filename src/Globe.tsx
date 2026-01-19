import {
  useEffect,
  useRef,
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Viewer as CesiumViewer,
  createGooglePhotorealistic3DTileset,
  GoogleMaps,
  Entity,
  Color,
  Cartesian3,
  PolylineGraphics,
  PointGraphics,
  LabelGraphics,
  HorizontalOrigin,
  VerticalOrigin,
  UrlTemplateImageryProvider,
  Cartesian2,
  HeightReference,
  PinBuilder,
  CustomDataSource,
  JulianDate,
  DistanceDisplayCondition,
  LabelStyle,
  SceneTransforms,
  EllipseGraphics,
  CallbackProperty,
  KmlDataSource,
} from "cesium";
import "../src/infobox-css.css"
import { CameraController } from "./CameraController";
import "cesium/Build/Cesium/Widgets/widgets.css";

// REACT ICONS IMPORTS
import { renderToStaticMarkup } from "react-dom/server";
import {
  FaBuilding,
  FaPlane,
  FaShieldAlt,
  FaTruck,
  FaUser,
  FaStar,
  FaEye,
  FaEyeSlash,
  FaFlag,
} from "react-icons/fa";
import {
  GiTank,
  GiCannon,
  GiRifle,
  GiWatchtower,
  GiHealthNormal,
} from "react-icons/gi";

// IMPORT DATA
import armyLocations from "../data/pakistan_army_locations.json";
import plaLocations from "../data/Ground_Forces_Locations.json";

// MERGE DATASETS WITH SOURCE TAG
const taggedArmyLocations = armyLocations.map((u) => ({ ...u, source: "PAK" }));
const taggedPlaLocations = plaLocations.map((u) => ({ ...u, source: "CHN" }));
const allLocations = [...taggedArmyLocations, ...taggedPlaLocations];

// -------------------------------------------------------------
// HELPER: Create Circular Icon (Cached)
// -------------------------------------------------------------
const iconCache = new Map<string, Promise<string>>();

const createCircularIcon = (
  IconComponent: any,
  color: string
): Promise<string> => {
  const key = `${IconComponent.name}-${color}`;
  if (iconCache.has(key)) return iconCache.get(key)!;

  const promise = new Promise<string>((resolve) => {
    const svgString = renderToStaticMarkup(
      <IconComponent style={{ color: "white", fontSize: "24px" }} />
    );
    const canvas = document.createElement("canvas");
    canvas.width = 48;
    canvas.height = 48;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve("");
      return;
    }

    ctx.beginPath();
    ctx.arc(24, 24, 22, 0, 2 * Math.PI, false);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(24, 24, 18, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();

    const img = new Image();
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 12, 12, 24, 24);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL());
    };
    img.src = url;
  });

  iconCache.set(key, promise);
  return promise;
};

// INTELLIGENCE SEARCH MAP - Static locations for KML areas
interface IntelligenceLocation {
  displayName: string;
  latitude: number;
  longitude: number;
  kmlKey: string;
}

const INTELLIGENCE_LOCATIONS: Record<string, IntelligenceLocation> = {
  "hotan military": {
    displayName: "Hotan Military",
    latitude: 37.00049733314965,
    longitude: 79.92633589091545,
    kmlKey: "Hotan Military"
  },
  "kirana hills": {
    displayName: "Kirana Hills", 
    latitude: 31.95784166666667,
    longitude: 72.69160277777779,
    kmlKey: "Kirana Hills"
  }
};

// -------------------------------------------------------------
// HELPER: Styles
// -------------------------------------------------------------
const getUnitStyle = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes("hq") || t.includes("command"))
    return { category: "Headquarters", color: "#DAA520", icon: FaStar };
  if (t.includes("group army") || t.includes("corps") || t.includes("strike"))
    return { category: "Corps / Army", color: "#DC143C", icon: FaBuilding };
  if (t.includes("armoured") || t.includes("tank"))
    return { category: "Armoured", color: "#FF8C00", icon: GiTank };
  if (t.includes("artillery") || t.includes("firepower"))
    return { category: "Artillery", color: "#00CED1", icon: GiCannon };
  if (t.includes("aviation") || t.includes("air force"))
    return { category: "Aviation", color: "#9932CC", icon: FaPlane };
  if (t.includes("air defence") || t.includes("defense"))
    return { category: "Air Defence", color: "#1E90FF", icon: FaShieldAlt };
  if (t.includes("special"))
    return { category: "Special Forces", color: "#4B0082", icon: GiRifle };
  if (
    t.includes("infantry") ||
    t.includes("combined") ||
    t.includes("mountain")
  )
    return { category: "Infantry", color: "#228B22", icon: FaUser };
  if (t.includes("border"))
    return { category: "Border Guard", color: "#006400", icon: GiWatchtower };
  if (t.includes("service") || t.includes("support") || t.includes("logistics"))
    return { category: "Support", color: "#696969", icon: FaTruck };
  if (t.includes("hospital") || t.includes("medical"))
    return { category: "Medical", color: "#FF69B4", icon: GiHealthNormal };
  return { category: "Other", color: "#808080", icon: FaUser };
};

// -------------------------------------------------------------
// HELPER: HTML Description
// -------------------------------------------------------------
const generateDescription = (data: any) => {
  // Encode unit data as JSON for the button
  const unitDataJson = encodeURIComponent(JSON.stringify({
    name: data.name,
    type: data.type,
    locationName: data.locationName,
    coordinates: data.coordinates,
    details: data.details,
    source: data.source,
  }));
  
  return `
    <style>
      .cesium-infoBox-description table { width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 13px; }
      .cesium-infoBox-description th { text-align: left; border-bottom: 1px solid #555; padding: 5px; color: #ccc; }
      .cesium-infoBox-description td { padding: 5px; border-bottom: 1px solid #444; }
      .cesium-infoBox-description a { color: #00E5FF; text-decoration: none; }
      .intel-workspace-btn {
        display: block;
        width: 100%;
        margin-top: 15px;
        padding: 12px 16px;
        background: linear-gradient(180deg, #ff0064 0%, #cc0050 100%);
        border: 1px solid #ff3388;
        border-radius: 6px;
        color: white;
        font-size: 13px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 1px;
        cursor: pointer;
        text-align: center;
        transition: all 0.2s ease;
        box-shadow: 0 4px 15px rgba(255, 0, 100, 0.3);
      }
      .intel-workspace-btn:hover {
        background: linear-gradient(180deg, #ff3388 0%, #ff0064 100%);
        box-shadow: 0 6px 20px rgba(255, 0, 100, 0.5);
        transform: translateY(-1px);
      }
    </style>
    <table class="cesium-infoBox-defaultTable">
      <tbody>
        <tr><th>Type</th><td>${data.type || "N/A"}</td></tr>
        <tr><th>Location</th><td>${data.locationName || "N/A"}</td></tr>
        ${
          data.details?.corps
            ? `<tr><th>Corps</th><td>${data.details.corps}</td></tr>`
            : ""
        }
        ${
          data.details?.remarks
            ? `<tr><th>Remarks</th><td>${data.details.remarks}</td></tr>`
            : ""
        }
        ${
          data.details?.reference
            ? `<tr><th>Reference</th><td><a href="${data.details.reference}" target="_blank">Open Link</a></td></tr>`
            : ""
        }
      </tbody>
    </table>    <button class="intel-workspace-btn" data-unit="${unitDataJson}">
      🎯 Enter Intel Workspace
    </button>
  `;
};

// CPEC CONSTANTS
const CPEC_MAIN_PATH = [
  [25.1264, 62.3225],
  [25.4, 63.8],
  [26.2, 65.5],
  [27.0, 66.0],
  [27.8, 66.6],
  [29.0, 66.5],
  [30.18, 66.99],
  [30.5, 68.5],
  [31.4, 70.3],
  [32.1, 71.5],
  [32.5, 72.3],
  [33.6, 73.05],
  [34.0, 73.2],
  [34.8, 72.8],
  [35.2, 73.2],
  [35.5, 74.5],
  [35.8, 74.6],
  [35.92, 74.31],
  [36.3, 74.8],
  [36.6, 75.0],
  [36.85, 75.42],
  [37.5, 75.5],
  [38.5, 75.7],
  [39.47, 75.99],
];
const CPEC_EASTERN_PATH = [
  [25.1264, 62.3225],
  [24.86, 67.01],
  [25.37, 68.37],
  [27.71, 68.86],
  [29.38, 71.68],
  [31.55, 74.34],
  [32.08, 74.19],
  [33.6, 73.05],
];
const CPEC_WESTERN_PATH = [
  [25.1264, 62.3225],
  [26.23, 63.04],
  [27.0, 66.0],
  [30.18, 66.99],
  [31.83, 70.9],
  [32.33, 71.18],
  [33.6, 73.05],
];
const CPEC_NORTHERN_PATH = [
  [33.6, 73.05],
  [34.0, 73.2],
  [34.77, 72.36],
  [35.51, 72.99],
  [35.33, 74.65],
  [35.92, 74.31],
  [36.31, 74.65],
  [36.85, 75.42],
  [39.47, 75.99],
];
const CPEC_CENTRAL_PATH = [
  [25.1264, 62.3225],
  [24.86, 67.01],
  [27.71, 68.86],
  [30.2, 71.47],
  [31.42, 73.08],
  [32.08, 72.67],
  [33.6, 73.05],
];

const CPEC_LABELS = [
  "Gwadar Port",
  "",
  "",
  "",
  "",
  "",
  "Quetta",
  "",
  "",
  "",
  "",
  "Islamabad",
  "",
  "",
  "",
  "",
  "",
  "Gilgit",
  "",
  "",
  "Khunjerab Pass",
  "",
  "",
  "Kashgar",
];
const EASTERN_LABELS = [
  "Gwadar",
  "Karachi",
  "Hyderabad",
  "Sukkur",
  "Multan",
  "Lahore",
  "",
  "Islamabad",
];
const WESTERN_LABELS = [
  "Gwadar",
  "Turbat",
  "Khuzdar",
  "Quetta",
  "Zhob",
  "D.I. Khan",
  "Islamabad",
];
const NORTHERN_LABELS = [
  "Islamabad",
  "Abbottabad",
  "Mansehra",
  "Besham",
  "Chilas",
  "Gilgit",
  "Hunza",
  "Khunjerab",
  "Kashgar",
];
const CENTRAL_LABELS = [
  "Gwadar",
  "Karachi",
  "Sukkur",
  "Bahawalpur",
  "Faisalabad",
  "Sargodha",
  "Islamabad",
];

const CPEC_ROUTES = {
  main: {
    id: "main",
    name: "Main CPEC Corridor",
    path: CPEC_MAIN_PATH,
    labels: CPEC_LABELS,
    color: "RED",
    lineWidth: 5,
    showLabels: true,
  },
  eastern: {
    id: "eastern",
    name: "Eastern Route",
    path: CPEC_EASTERN_PATH,
    labels: EASTERN_LABELS,
    color: "CYAN",
    lineWidth: 3,
    showLabels: false,
  },
  western: {
    id: "western",
    name: "Western Route",
    path: CPEC_WESTERN_PATH,
    labels: WESTERN_LABELS,
    color: "YELLOW",
    lineWidth: 3,
    showLabels: false,
  },
  central: {
    id: "central",
    name: "Central Route",
    path: CPEC_CENTRAL_PATH,
    labels: CENTRAL_LABELS,
    color: "LIME",
    lineWidth: 3,
    showLabels: false,
  },
  northern: {
    id: "northern",
    name: "Northern Route",
    path: CPEC_NORTHERN_PATH,
    labels: NORTHERN_LABELS,
    color: "MAGENTA",
    lineWidth: 3,
    showLabels: false,
  },
};

export const CPEC_ROUTE_INFO = Object.values(CPEC_ROUTES).map((route) => ({
  id: route.id,
  name: route.name,
  color: route.color,
}));

export interface GlobeRef {
  flyTo: (lon: number, lat: number, height?: number) => void;
  flyToBounds: (bbox: [number, number, number, number]) => void;
  showCPECRoute: () => void;
  hideCPECRoute: () => void;
  showSingleRoute: (routeId: string) => void;
  showAllRoutes: () => void;
  searchUnit: (query: string) => boolean;
  getScreenPosition: (lon: number, lat: number) => { x: number; y: number } | null;
  addTargetEntity: (lon: number, lat: number, name: string, destructionRadius?: number) => void;
  updateTargetRings: (destructionRadius: number) => void;
  removeTargetEntity: () => void;
  flyToUnit: (lon: number, lat: number, height?: number) => void;
}

export interface UnitData {
  name: string;
  type: string;
  locationName: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  details?: {
    corps?: string;
    division?: string;
    remarks?: string;
    reference?: string;
  };
  source?: string;
}

interface GlobeProps {
  onEnterIntelWorkspace?: (unit: UnitData) => void;
}

const Globe = forwardRef<GlobeRef, GlobeProps>((props, ref) => {
  const { onEnterIntelWorkspace } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<CesiumViewer | null>(null);
  const cameraControllerRef = useRef<CameraController | null>(null);
  const cpecEntitiesRef = useRef<Entity[]>([]);
  const targetEntityRef = useRef<Entity | null>(null);
  const targetRingsRef = useRef<{
    outer: Entity | null;
    middle: Entity | null;
    inner: Entity | null;
    center: Entity | null;
  }>({ outer: null, middle: null, inner: null, center: null });
  const animationRef = useRef<{
    currentRadius: number;
    targetRadius: number;
    animationId: number | null;
  }>({ currentRadius: 500, targetRadius: 500, animationId: null });

  const dataSourceRef = useRef<CustomDataSource | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [activeSource, setActiveSource] = useState<string>("ALL");
  const [showMarkers, setShowMarkers] = useState<boolean>(false);
  const [showClusterHint, setShowClusterHint] = useState<boolean>(false);

  const categories = useMemo(() => {
    const cats = new Map();
    allLocations.forEach((u) => {
      const style = getUnitStyle(u.type);
      cats.set(style.category, { color: style.color, icon: style.icon });
    });
    return Array.from(cats.entries()).sort();
  }, []);

  // -------------------------------------------------------------
  // FILTERING LOGIC
  // -------------------------------------------------------------
  useEffect(() => 
    
  {
    if (!dataSourceRef.current) return;

    const entities = dataSourceRef.current.entities.values;
    const now = JulianDate.now();
    entities.forEach((entity) => {
      const category = entity.properties?.getValue(now)?.category;
      const source = entity.properties?.getValue(now)?.source;

      let isVisible = showMarkers;

      if (isVisible) {
        if (activeCategory !== "ALL" && category !== activeCategory)
          isVisible = false;
        if (activeSource !== "ALL" && source !== activeSource)
          isVisible = false;
      }

      entity.show = isVisible;
    });

    // FORCE RENDER
    if (viewerRef.current) viewerRef.current.scene.requestRender();
  }, [activeCategory, showMarkers, activeSource]);

  useEffect(() => {
    if (!containerRef.current) return;

    const init = async () => {
      GoogleMaps.defaultApiKey = "AIzaSyBvIToHVCENj_iNpzrk7Wpvn3xMPKXFmOA";

      const viewer = new CesiumViewer(containerRef.current!, {
        timeline: false,
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: true,
        geocoder: false,
        homeButton: false,
        infoBox: true,
        sceneModePicker: false,
        selectionIndicator: true,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        creditContainer: document.createElement("div"),

        // FIX 1: Turn this OFF to ensure instant UI updates
        requestRenderMode: false,
      });
  

      const infoBoxFrame = viewer.infoBox.frame;
      if (infoBoxFrame) {
        infoBoxFrame.setAttribute(
          "sandbox",
          "allow-same-origin allow-scripts allow-popups allow-forms"
        );
        
        // Set up a MutationObserver to watch for the intel workspace button
        const setupButtonListener = () => {
          try {
            const iframeDoc = infoBoxFrame.contentDocument || infoBoxFrame.contentWindow?.document;
            if (!iframeDoc) return;
            
            const observer = new MutationObserver(() => {
              const button = iframeDoc.querySelector('.intel-workspace-btn');
              if (button && !button.getAttribute('data-listener-attached')) {
                button.setAttribute('data-listener-attached', 'true');
                button.addEventListener('click', () => {
                  const unitDataStr = button.getAttribute('data-unit');
                  if (unitDataStr) {
                    window.postMessage({
                      type: 'ENTER_INTEL_WORKSPACE',
                      unitData: unitDataStr
                    }, '*');
                  }
                });
              }
            });
            
            observer.observe(iframeDoc.body || iframeDoc, { 
              childList: true, 
              subtree: true 
            });
          } catch (e) {
            console.error('Error setting up button listener:', e);
          }
        };
        
        infoBoxFrame.addEventListener('load', setupButtonListener);
        // Also try immediately in case iframe is already loaded
        setTimeout(setupButtonListener, 100);
      }

      viewer.targetFrameRate = 60;
      viewerRef.current = viewer;
      cameraControllerRef.current = new CameraController(viewer.camera);
      if (viewer.scene.sun) viewer.scene.sun.show = false;

      // ================= KML HELPERS =================
      const processKmlEntities = (ds: any) => {
        ds.show = true;
       
        ds.entities.values.forEach((entity: any) => {
          entity.show = true;
           
          if (entity.label) {
            entity.label.show = true;
            entity.label.disableDepthTestDistance = Number.POSITIVE_INFINITY;
            entity.label.heightReference = HeightReference.CLAMP_TO_GROUND;
          }
           
          if (entity.billboard) {
            entity.billboard.show = true;
            entity.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY;
            entity.billboard.heightReference = HeightReference.CLAMP_TO_GROUND;
          }
           
          if (entity.polygon) {
            entity.polygon.show = true;
            entity.polygon.heightReference = HeightReference.CLAMP_TO_GROUND;
            entity.polygon.extrudedHeightReference = HeightReference.CLAMP_TO_GROUND;
            entity.polygon.height ??= 0;
            entity.polygon.outline = true;
            entity.polygon.classificationType = 2; // BOTH - prevents depth fighting with Google tiles
          }
           
          if (entity.polyline) {
            entity.polyline.show = true;
            entity.polyline.clampToGround = true;
            entity.polyline.width = Math.max(entity.polyline.width || 1, 4);
            entity.polyline.zIndex = 100; // Higher z-index to appear above Google tiles
          }
        });
      };
       
      const loadKmlLayers = async () => {
        const kmlFiles = [
          "/kml/Ormara/Ormara.kml",
          "/kml/Hotan Military/Hotan Military.kml",
          "/kml/Kirana Hills/Kirana Hills.kml",
        ];
       
        for (const path of kmlFiles) {
          const ds = await KmlDataSource.load(path, {
            clampToGround: true,
            camera: viewer.scene.camera,
            canvas: viewer.scene.canvas,
          });
           
          // 🔥 ADD THIS - Set datasource name for search functionality
          ds.name = path.split("/").pop() || path;
           
          viewer.dataSources.add(ds);
           
          // IMPORTANT — wait one frame
          await new Promise(requestAnimationFrame);
           
          processKmlEntities(ds);
        }
       
        viewer.scene.requestRender();
      };

      // ---------------------------------------------------------
      // DATA SOURCE + CLUSTERING
      // ---------------------------------------------------------
      const dataSource = new CustomDataSource("ArmyUnits");
      viewer.dataSources.add(dataSource);
      dataSourceRef.current = dataSource;

      dataSource.clustering.enabled = true;
      dataSource.clustering.pixelRange = 15;
      dataSource.clustering.minimumClusterSize = 3;

      const pinBuilder = new PinBuilder();
      dataSource.clustering.clusterEvent.addEventListener((entities, cluster) => {
        cluster.label.show = true;
        cluster.label.text = entities.length.toLocaleString();
        cluster.label.font = "bold 12px sans-serif";
        cluster.label.showBackground = false;
        cluster.billboard.show = true;
        cluster.billboard.id = cluster.label.id;
        cluster.billboard.verticalOrigin = VerticalOrigin.BOTTOM;
        cluster.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY;

        if (entities.length >= 20) {
          cluster.billboard.image = pinBuilder
            .fromText(`${entities.length}`, Color.RED, 48)
            .toDataURL();
        } else if (entities.length >= 10) {
          cluster.billboard.image = pinBuilder
            .fromText(`${entities.length}`, Color.ORANGE, 48)
            .toDataURL();
        } else {
          cluster.billboard.image = pinBuilder
            .fromText(`${entities.length}`, Color.BLUE, 48)
            .toDataURL();
        }
      });

      // ---------------------------------------------------------
      // LOAD LOCATIONS
      // ---------------------------------------------------------
      const loadLocations = async () => {
        // Pre-load all unique icons first
        const uniqueStyles = new Map<string, { icon: any; color: string }>();
        allLocations.forEach((unit: any) => {
          const style = getUnitStyle(unit.type);
          const key = `${style.icon.name}-${style.color}`;
          if (!uniqueStyles.has(key)) {
            uniqueStyles.set(key, { icon: style.icon, color: style.color });
          }
        });

        // Pre-cache all icons
        const iconPromises = Array.from(uniqueStyles.values()).map(({ icon, color }) =>
          createCircularIcon(icon, color)
        );
        await Promise.all(iconPromises);

        // Now add all entities with cached icons (synchronous lookups)
        for (const unit of allLocations) {
          if (!unit.coordinates?.lat || !unit.coordinates?.lon) continue;

          const style = getUnitStyle(unit.type);
          const iconUrl = await createCircularIcon(style.icon, style.color); // Will return cached

          dataSource.entities.add({
            name: unit.name,
            show: false,
            description: generateDescription(unit),
            position: Cartesian3.fromDegrees(
              Number(unit.coordinates.lon),
              Number(unit.coordinates.lat)
            ),
            properties: {
              category: style.category,
              source: unit.source,
            },
            billboard: {
              image: iconUrl,
              verticalOrigin: VerticalOrigin.BOTTOM,
              heightReference: HeightReference.CLAMP_TO_GROUND,
              eyeOffset: new Cartesian3(0.0, 0.0, -50.0),
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            label: {
              text: unit.name,
              font: "bold 13px sans-serif",
              style: LabelStyle.FILL_AND_OUTLINE,
              fillColor: Color.WHITE,
              outlineColor: Color.BLACK,
              outlineWidth: 3,
              pixelOffset: new Cartesian2(0, -50),
              horizontalOrigin: HorizontalOrigin.CENTER,
              verticalOrigin: VerticalOrigin.BOTTOM,
              heightReference: HeightReference.CLAMP_TO_GROUND,
              eyeOffset: new Cartesian3(0.0, 0.0, -100.0),
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              distanceDisplayCondition: new DistanceDisplayCondition(0, 500000),
            },
          });
        }

        // Force a render after all entities are added
        viewer.scene.requestRender();
      };

      // ---------------------------------------------------------
      // LOAD GOOGLE 3D TILES
      // ---------------------------------------------------------
      const addGoogleTiles = async () => {
        try {
          const tileset = await createGooglePhotorealistic3DTileset();
          tileset.skipLevelOfDetail = true;
          tileset.maximumScreenSpaceError = 8.0;
          const labelProvider = new UrlTemplateImageryProvider({
            url: "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png",
            subdomains: ["a", "b", "c", "d"],
            credit: "Map tiles by CartoDB",
          });
          tileset.imageryLayers.addImageryProvider(labelProvider);
          viewer.scene.primitives.add(tileset);
        } catch (e) {
          console.error(e);
        }
      };

      // ---------- LOAD DATA ----------
      await loadKmlLayers();     // ✅ SAFE
      await addGoogleTiles();    // ✅ SAFE
      await loadLocations();     // optional order

      viewer.scene.requestRender();
    };

    init();
    
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);
  // ---------------------------------------------------------
  // MESSAGE LISTENER FOR INTEL WORKSPACE BUTTON
  // ---------------------------------------------------------
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'ENTER_INTEL_WORKSPACE' && event.data?.unitData) {
        try {
          const unitData = JSON.parse(decodeURIComponent(event.data.unitData));
          
          // Close the info box immediately
          if (viewerRef.current) {
            viewerRef.current.selectedEntity = undefined;
          }

          // Trigger callback to parent - camera fly will happen after loading
          if (onEnterIntelWorkspace) {
            onEnterIntelWorkspace(unitData);
          }
        } catch (e) {
          console.error('Error parsing unit data:', e);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onEnterIntelWorkspace]);

  useEffect(() => {
    if (viewerRef.current) {
      const camera = viewerRef.current.camera;
      camera.setView({
        destination: Cartesian3.fromDegrees(
          viewerRef.current.camera.positionCartographic.longitude *
            (180 / Math.PI),
          viewerRef.current.camera.positionCartographic.latitude *
            (180 / Math.PI),
          15000000
        ),
      });
    }
  }, []);
  const getColor = (name: string) => {
    switch (name) {
      case "RED":
        return Color.fromCssColorString('#FF3333'); // Bright red
      case "CYAN":
        return Color.fromCssColorString('#00FFFF'); // Bright cyan
      case "YELLOW":
        return Color.fromCssColorString('#FFFF00'); // Bright yellow (was orange)
      case "LIME":
        return Color.fromCssColorString('#00FF00'); // Bright lime green
      case "MAGENTA":
        return Color.fromCssColorString('#FF00FF'); // Bright magenta
      case "ORANGE":
        return Color.fromCssColorString('#FFA500'); // Keep for backwards compatibility
      case "GREEN":
        return Color.fromCssColorString('#00FF00'); // Keep for backwards compatibility
      default:
        return Color.WHITE;
    }
  };

  const showRoutesInternal = (routeIds: string[]) => {
    if (!viewerRef.current) return;
    const addRoute = (
      path: number[][],
      labels: string[],
      routeColor: Color,
      lineWidth: number = 3,
      showLabels: boolean = false
    ) => {
      path.forEach(([lat, lon], index) => {
        const hasLabel =
          showLabels && labels[index] && labels[index].length > 0;
        const point = viewerRef.current!.entities.add({
          position: Cartesian3.fromDegrees(lon, lat),
          point: new PointGraphics({
            pixelSize: hasLabel ? 10 : 4,
            color: routeColor,
            outlineColor: Color.BLACK,
            outlineWidth: 1,
          }),
          label: hasLabel
            ? new LabelGraphics({
                text: labels[index],
                font: "10pt sans-serif",
                fillColor: routeColor,
                outlineColor: Color.BLACK,
                outlineWidth: 1,
                style: 1,
                pixelOffset: new Cartesian3(0, -25, 0),
                horizontalOrigin: HorizontalOrigin.CENTER,
                verticalOrigin: VerticalOrigin.TOP,
              })
            : undefined,
        });
        cpecEntitiesRef.current.push(point);
      });
      const positions = path.map(([lat, lon]) =>
        Cartesian3.fromDegrees(lon, lat)
      );
      const polyline = viewerRef.current!.entities.add({
        polyline: new PolylineGraphics({
          positions: positions,
          width: lineWidth,
          material: routeColor,
          clampToGround: true,
        }),
      });
      cpecEntitiesRef.current.push(polyline);
    };

    routeIds.forEach((routeId) => {
      const route = CPEC_ROUTES[routeId as keyof typeof CPEC_ROUTES];
      if (route) {
        addRoute(
          route.path,
          route.labels,
          getColor(route.color),
          routeId === "main" ? 5 : route.lineWidth,
          route.showLabels
        );
      }
    });

    viewerRef.current.scene.requestRender();
  };

  const showCPECRoute = () => {
    if (viewerRef.current) {
      hideCPECRoute();
      showRoutesInternal(Object.keys(CPEC_ROUTES));
    }
  };
  const showSingleRoute = (routeId: string) => {
    if (viewerRef.current) {
      hideCPECRoute();
      showRoutesInternal([routeId]);
    }
  };
  const showAllRoutes = () => {
    if (viewerRef.current) {
      hideCPECRoute();
      showRoutesInternal(Object.keys(CPEC_ROUTES));
    }
  };
  const hideCPECRoute = () => {
    if (viewerRef.current) {
      cpecEntitiesRef.current.forEach((e) =>
        viewerRef.current!.entities.remove(e)
      );
      cpecEntitiesRef.current = [];
      viewerRef.current.scene.requestRender();
    }
  };

  // -------------------------------------------------------------
  // SEARCH FUNCTION - Find and fly to a unit
  // -------------------------------------------------------------
  const searchUnit = (query: string): boolean => {
    if (!query.trim() || !viewerRef.current || !dataSourceRef.current) {
      return false;
    }

    const searchLower = query.toLowerCase().trim();

    // FIRST: Search in allLocations for coordinates (existing behavior)
    const matchedUnit = allLocations.find(
      (unit) =>
        unit.name.toLowerCase().includes(searchLower) ||
        unit.type?.toLowerCase().includes(searchLower) ||
        unit.locationName?.toLowerCase().includes(searchLower)
    );

    if (
      matchedUnit &&
      matchedUnit.coordinates?.lat &&
      matchedUnit.coordinates?.lon
    ) {
      // Show markers if not already showing
      if (!showMarkers) {
        setShowMarkers(true);
      }      // Fly to the unit location
      if (cameraControllerRef.current) {
        cameraControllerRef.current.rotateAndZoomTo(
          Number(matchedUnit.coordinates.lon),
          Number(matchedUnit.coordinates.lat),
          { zoomHeight: 50000 }
        );
      }

      // Find and select the entity in the data source
      const entities = dataSourceRef.current.entities.values;
      const matchedEntity = entities.find(
        (entity) =>
          entity.name?.toLowerCase() === matchedUnit.name.toLowerCase()
      );

      if (matchedEntity) {
        // Make sure the entity is visible
        matchedEntity.show = true;

        // Select the entity to show its info box
        viewerRef.current.selectedEntity = matchedEntity;
      }

      return true;
    }

    // SECOND: If no unit found, check intelligence locations
    const intelLocation = INTELLIGENCE_LOCATIONS[searchLower];
    if (intelLocation) {
      // Fly to the intelligence location
      if (cameraControllerRef.current) {
        cameraControllerRef.current.rotateAndZoomTo(
          intelLocation.longitude,
          intelLocation.latitude,
          { zoomHeight: 10000 } // Closer zoom for KML areas
        );
      }

      // Find and ensure visibility of the corresponding KML datasource
      const dataSources = viewerRef.current.dataSources;
      for (let i = 0; i < dataSources.length; i++) {
        const dataSource = dataSources.get(i);
        if (dataSource.name && dataSource.name.includes(intelLocation.kmlKey)) {
          dataSource.show = true;
          // Optionally select the first entity from this datasource
          const entities = dataSource.entities.values;
          if (entities.length > 0) {
            viewerRef.current.selectedEntity = entities[0];
          }
          break;
        }
      }

      return true;
    }

    return false;
  };

  useImperativeHandle(ref, () => ({
    flyTo: (lon: number, lat: number, height: number = 2000) => {
      if (cameraControllerRef.current)
        cameraControllerRef.current.rotateAndZoomTo(lon, lat, {
          zoomHeight: height,
        });
    },
    flyToBounds: (bbox: [number, number, number, number]) => {
      if (cameraControllerRef.current)
        cameraControllerRef.current.flyToBoundingBox(bbox);
    },
    showCPECRoute,
    hideCPECRoute,
    showSingleRoute,
    showAllRoutes,
    searchUnit,
    getScreenPosition: (lon: number, lat: number) => {
      if (!viewerRef.current) return null;
      const position = Cartesian3.fromDegrees(lon, lat);
      const screenPos = SceneTransforms.worldToWindowCoordinates(
        viewerRef.current.scene,
        position
      );
      if (screenPos) {
        return { x: screenPos.x, y: screenPos.y };
      }
      return null;
    },
    addTargetEntity: (lon: number, lat: number, name: string, destructionRadius: number = 500) => {
      if (!viewerRef.current) return;
      
      // Cancel any ongoing animation
      if (animationRef.current.animationId) {
        cancelAnimationFrame(animationRef.current.animationId);
        animationRef.current.animationId = null;
      }
      
      // Remove existing target entity if any
      if (targetEntityRef.current) {
        viewerRef.current.entities.remove(targetEntityRef.current);
      }
      
      // Remove any existing target rings
      const existingTargets = viewerRef.current.entities.values.filter(
        e => e.name?.startsWith('Target')
      );
      existingTargets.forEach(e => viewerRef.current!.entities.remove(e));
      
      // Initialize animation state
      animationRef.current.currentRadius = destructionRadius;
      animationRef.current.targetRadius = destructionRadius;
      
      // Create callback properties for dynamic ring sizes
      const outerRadiusCallback = new CallbackProperty(() => {
        return animationRef.current.currentRadius;
      }, false);
      
      const middleRadiusCallback = new CallbackProperty(() => {
        return animationRef.current.currentRadius * 0.7;
      }, false);
      
      const innerRadiusCallback = new CallbackProperty(() => {
        return animationRef.current.currentRadius * 0.4;
      }, false);
      
      // Create target entity with animated rings using CallbackProperty
      const outerRing = viewerRef.current.entities.add({
        name: `Target: ${name}`,
        position: Cartesian3.fromDegrees(lon, lat),
        ellipse: new EllipseGraphics({
          semiMajorAxis: outerRadiusCallback,
          semiMinorAxis: outerRadiusCallback,
          material: Color.fromCssColorString('rgba(255, 0, 100, 0.3)'),
          outline: true,
          outlineColor: Color.fromCssColorString('#ff0064'),
          outlineWidth: 3,
          heightReference: HeightReference.CLAMP_TO_GROUND,
        }),
      });
      
      // Add additional ring entities with callback properties
      const middleRing = viewerRef.current.entities.add({
        name: `Target Ring 2: ${name}`,
        position: Cartesian3.fromDegrees(lon, lat),
        ellipse: new EllipseGraphics({
          semiMajorAxis: middleRadiusCallback,
          semiMinorAxis: middleRadiusCallback,
          material: Color.TRANSPARENT,
          outline: true,
          outlineColor: Color.fromCssColorString('rgba(255, 0, 100, 0.5)'),
          outlineWidth: 2,
          heightReference: HeightReference.CLAMP_TO_GROUND,
        }),
      });
      
      const innerRingEntity = viewerRef.current.entities.add({
        name: `Target Ring 3: ${name}`,
        position: Cartesian3.fromDegrees(lon, lat),
        ellipse: new EllipseGraphics({
          semiMajorAxis: innerRadiusCallback,
          semiMinorAxis: innerRadiusCallback,
          material: Color.TRANSPARENT,
          outline: true,
          outlineColor: Color.fromCssColorString('rgba(255, 0, 100, 0.7)'),
          outlineWidth: 2,
          heightReference: HeightReference.CLAMP_TO_GROUND,
        }),
      });
      
      // Center point
      const centerPoint = viewerRef.current.entities.add({
        name: `Target Center: ${name}`,
        position: Cartesian3.fromDegrees(lon, lat),
        point: new PointGraphics({
          pixelSize: 12,
          color: Color.fromCssColorString('#ff0064'),
          outlineColor: Color.WHITE,
          outlineWidth: 2,
          heightReference: HeightReference.CLAMP_TO_GROUND,
        }),
      });
      
      // Store references to ring entities
      targetRingsRef.current = {
        outer: outerRing,
        middle: middleRing,
        inner: innerRingEntity,
        center: centerPoint,
      };
      
      // Store target position for updateTargetRings
      (viewerRef.current as any)._targetPosition = { lon, lat, name };
      
      targetEntityRef.current = outerRing;
      viewerRef.current.scene.requestRender();
    },
    updateTargetRings: (destructionRadius: number) => {
      if (!viewerRef.current) return;
      
      const targetPos = (viewerRef.current as any)._targetPosition;
      if (!targetPos) return;
      
      // Cancel any ongoing animation
      if (animationRef.current.animationId) {
        cancelAnimationFrame(animationRef.current.animationId);
        animationRef.current.animationId = null;
      }
      
      // Set target radius for animation
      animationRef.current.targetRadius = destructionRadius;
      
      // Animation parameters
      const animationDuration = 400; // milliseconds
      const startTime = performance.now();
      const startRadius = animationRef.current.currentRadius;
      const radiusDiff = destructionRadius - startRadius;
      
      // Easing function for smooth animation (ease-out cubic)
      const easeOutCubic = (t: number): number => {
        return 1 - Math.pow(1 - t, 3);
      };
      
      // Animation loop
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        const easedProgress = easeOutCubic(progress);
        
        // Update current radius
        animationRef.current.currentRadius = startRadius + (radiusDiff * easedProgress);
        
        // Request render to update the visualization
        if (viewerRef.current) {
          viewerRef.current.scene.requestRender();
        }
        
        // Continue animation if not complete
        if (progress < 1) {
          animationRef.current.animationId = requestAnimationFrame(animate);
        } else {
          // Ensure we end exactly at the target radius
          animationRef.current.currentRadius = destructionRadius;
          animationRef.current.animationId = null;
          if (viewerRef.current) {
            viewerRef.current.scene.requestRender();
          }
        }
      };
      
      // Start animation
      animationRef.current.animationId = requestAnimationFrame(animate);
    },    removeTargetEntity: () => {
      if (!viewerRef.current) return;
      
      // Cancel any ongoing animation
      if (animationRef.current.animationId) {
        cancelAnimationFrame(animationRef.current.animationId);
        animationRef.current.animationId = null;
      }
      
      // Reset animation state
      animationRef.current.currentRadius = 500;
      animationRef.current.targetRadius = 500;
      
      // Remove all target-related entities
      const entitiesToRemove = viewerRef.current.entities.values.filter(
        e => e.name?.startsWith('Target')
      );
      entitiesToRemove.forEach(e => viewerRef.current!.entities.remove(e));
      
      // Clear refs
      targetRingsRef.current = { outer: null, middle: null, inner: null, center: null };
      targetEntityRef.current = null;
      (viewerRef.current as any)._targetPosition = null;
      
      viewerRef.current.scene.requestRender();
    },
    flyToUnit: (lon: number, lat: number, height: number = 50000) => {
      if (cameraControllerRef.current) {
        cameraControllerRef.current.rotateAndZoomTo(lon, lat, {
          zoomHeight: height,
        });
      }
    },
  }));

  // =============================================================
  // KML DATA LOADING - Additional overlay layers (ADDITIVE ONLY)
  // =============================================================
  

  // =============================================================
  // RENDER UI
  // =============================================================

  const handleToggleMarkers = () => {
    const newShowMarkers = !showMarkers;
    setShowMarkers(newShowMarkers);
    
    // Show cluster hint when enabling markers
    if (newShowMarkers) {
      setShowClusterHint(true);
      setTimeout(() => setShowClusterHint(false), 5000);
    } else {
      setShowClusterHint(false);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* CLUSTER HINT BOX */}
      {showClusterHint && (
        <div
          style={{
            position: "absolute",
            top: "100px",
            right: "20px",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            color: "white",
            padding: "16px 20px",
            borderRadius: "12px",
            border: "1px solid rgba(0, 229, 255, 0.5)",
            fontFamily: "sans-serif",
            fontSize: "13px",
            zIndex: 1000,
            boxShadow: "0 8px 32px rgba(0, 229, 255, 0.2)",
            backdropFilter: "blur(8px)",
            maxWidth: "280px",
            animation: "fadeInOut 5s ease-in-out forwards",
          }}
        >
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            marginBottom: "12px",
            borderBottom: "1px solid rgba(255,255,255,0.2)",
            paddingBottom: "8px"
          }}>
            <span style={{ fontSize: "18px" }}>💡</span>
            <span style={{ fontWeight: "bold", color: "#00E5FF", fontSize: "14px" }}>
              Understanding Clusters
            </span>
          </div>

          <p style={{ 
            color: "#aaa", 
            fontSize: "12px", 
            margin: "0 0 12px 0",
            lineHeight: "1.4"
          }}>
            Numbers on the map represent <strong style={{ color: "#fff" }}>clusters</strong> — groups of military units in close proximity. The color indicates cluster size:
          </p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: "#1E90FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: "bold",
                flexShrink: 0,
              }}>5</div>
              <span style={{ color: "#ccc" }}>Small cluster (2-9 units)</span>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: "#FFA500",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: "bold",
                flexShrink: 0,
              }}>15</div>
              <span style={{ color: "#ccc" }}>Medium cluster (10-19 units)</span>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: "#FF0000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: "bold",
                flexShrink: 0,
              }}>25</div>
              <span style={{ color: "#ccc" }}>Large cluster (20+ units)</span>
            </div>
          </div>
          
          <div style={{ 
            marginTop: "12px", 
            paddingTop: "10px", 
            borderTop: "1px solid rgba(255,255,255,0.2)",
            color: "#888",
            fontSize: "11px",
            textAlign: "center"
          }}>
            🔍 Zoom in to see individual units
          </div>
        </div>
      )}

      {/* TOGGLE BUTTON */}
      <div
        onClick={handleToggleMarkers}
        style={{
          position: "absolute",
          top: "100px",
          left: "20px",
          backgroundColor: showMarkers
            ? "rgba(0, 229, 255, 0.8)"
            : "rgba(0, 0, 0, 0.6)",
          color: "white",
          padding: "8px 16px",
          borderRadius: "4px",
          border: "1px solid rgba(255,255,255,0.3)",
          cursor: "pointer",
          fontFamily: "sans-serif",
          fontSize: "14px",
          fontWeight: "bold",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backdropFilter: "blur(4px)",
          transition: "all 0.2s ease",
        }}
      >
        {showMarkers ? <FaEyeSlash /> : <FaEye />}
        {showMarkers ? "Hide Units" : "Show All Unit Types"}
      </div>

      {/* FLOATING LEGEND */}
      {showMarkers && (
        <div
          style={{
            position: "absolute",
            top: 140,
            left: 20,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            fontFamily: "sans-serif",
            fontSize: "14px",
            zIndex: 100,
            boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <h3
            style={{
              margin: "0 0 10px 0",
              fontSize: "16px",
              borderBottom: "1px solid #555",
              paddingBottom: "5px",
            }}
          >
            Unit Types
          </h3>

          {/* SOURCE FILTERS */}
          <div
            style={{
              marginBottom: "15px",
              borderBottom: "1px solid #555",
              paddingBottom: "10px",
            }}
          >
            <div
              onClick={() => setActiveSource("ALL")}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "6px",
                cursor: "pointer",
                fontWeight: activeSource === "ALL" ? "bold" : "normal",
                color: activeSource === "ALL" ? "#00E5FF" : "white",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "white",
                  marginRight: "10px",
                  border: "2px solid #555",
                }}
              />
              All Sources
            </div>
            <div
              onClick={() => setActiveSource("CHN")}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "6px",
                cursor: "pointer",
                opacity:
                  activeSource === "ALL" || activeSource === "CHN" ? 1 : 0.5,
                color: activeSource === "CHN" ? "#FF0000" : "white",
              }}
            >
              <FaFlag style={{ marginRight: "10px", color: "red" }} /> Show
              Chinese Units
            </div>
            <div
              onClick={() => setActiveSource("PAK")}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "6px",
                cursor: "pointer",
                opacity:
                  activeSource === "ALL" || activeSource === "PAK" ? 1 : 0.5,
                color: activeSource === "PAK" ? "#00FF00" : "white",
              }}
            >
              <FaFlag style={{ marginRight: "10px", color: "green" }} /> Show
              Pakistan Units
            </div>
          </div>

          <div
            onClick={() => setActiveCategory("ALL")}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "8px",
              cursor: "pointer",
              fontWeight: activeCategory === "ALL" ? "bold" : "normal",
              color: activeCategory === "ALL" ? "#00E5FF" : "white",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "white",
                marginRight: "10px",
                border: "2px solid #555",
              }}
            />
            Show All Types
          </div>

          {categories.map(([catName, { color, icon: IconComponent }]) => (
            <div
              key={catName}
              onClick={() => setActiveCategory(catName)}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "6px",
                cursor: "pointer",
                opacity:
                  activeCategory === "ALL" || activeCategory === catName
                    ? 1
                    : 0.5,
                fontWeight: activeCategory === catName ? "bold" : "normal",
              }}
            >
              <IconComponent
                style={{
                  color: color,
                  marginRight: "10px",
                }}
              />
              {catName}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default Globe;
