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
  return `
    <style>
      .cesium-infoBox-description table { width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 13px; }
      .cesium-infoBox-description th { text-align: left; border-bottom: 1px solid #555; padding: 5px; color: #ccc; }
      .cesium-infoBox-description td { padding: 5px; border-bottom: 1px solid #444; }
      .cesium-infoBox-description a { color: #00E5FF; text-decoration: none; }
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
    </table>
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
    color: "ORANGE",
    lineWidth: 3,
    showLabels: false,
  },
  central: {
    id: "central",
    name: "Central Route",
    path: CPEC_CENTRAL_PATH,
    labels: CENTRAL_LABELS,
    color: "GREEN",
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
}

const Globe = forwardRef<GlobeRef, {}>((_props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<CesiumViewer | null>(null);
  const cameraControllerRef = useRef<CameraController | null>(null);
  const cpecEntitiesRef = useRef<Entity[]>([]);

  const dataSourceRef = useRef<CustomDataSource | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [activeSource, setActiveSource] = useState<string>("ALL");
  const [showMarkers, setShowMarkers] = useState<boolean>(false);

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
  useEffect(() => {
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

    GoogleMaps.defaultApiKey = "AIzaSyBvIToHVCENj_iNpzrk7Wpvn3xMPKXFmOA";

    const viewer = new CesiumViewer(containerRef.current, {
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
      globe: false,
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
   
    }

    viewer.targetFrameRate = 60;
    viewerRef.current = viewer;
    cameraControllerRef.current = new CameraController(viewer.camera);
    if (viewer.scene.sun) viewer.scene.sun.show = false;

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
            font: "14px sans-serif",
            showBackground: true,
            backgroundColor: Color.BLACK.withAlpha(0.8),
            pixelOffset: new Cartesian2(0, -60),
            horizontalOrigin: HorizontalOrigin.CENTER,
            verticalOrigin: VerticalOrigin.BOTTOM,
            heightReference: HeightReference.CLAMP_TO_GROUND,
            eyeOffset: new Cartesian3(0.0, 0.0, -100.0),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        });
      }

      // Force a render after all entities are added
      viewer.scene.requestRender();
    };
    loadLocations();

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
    addGoogleTiles();

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

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
        return Color.RED;
      case "CYAN":
        return Color.CYAN;
      case "ORANGE":
        return Color.ORANGE;
      case "GREEN":
        return Color.GREEN;
      case "MAGENTA":
        return Color.MAGENTA;
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

    // Search in allLocations for coordinates
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
  }));

  // =============================================================
  // RENDER UI
  // =============================================================
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* TOGGLE BUTTON */}
      <div
        onClick={() => setShowMarkers(!showMarkers)}
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
