import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { 
  Viewer as CesiumViewer, 
  createWorldTerrainAsync, 
  Cesium3DTileset, 
  UrlTemplateImageryProvider,
  Entity,
  Color,
  Cartesian3,
  PolylineGraphics,
  PointGraphics,
  LabelGraphics,
  HorizontalOrigin,
  VerticalOrigin
} from 'cesium';
import { CameraController } from './CameraController';
import 'cesium/Build/Cesium/Widgets/widgets.css';

// Set default access token if needed, or assume user will provide
// Ion.defaultAccessToken = 'YOUR_ACCESS_TOKEN'; 

// CPEC (China-Pakistan Economic Corridor) constants - Realistic zigzag route
const CPEC_PATH = [
  // Southern Pakistan - Gwadar to interior
  [25.1264, 62.3225],  // Gwadar Port
  [25.4, 63.8],        // Turbat area
  [26.2, 65.5],        // Panjgur
  [27.0, 66.0],        // Khuzdar approach
  [27.8, 66.6],        // Khuzdar
  [29.0, 66.5],        // Quetta approach
  [30.18, 66.99],      // Quetta
  // Central Pakistan - Through Punjab
  [30.5, 68.5],        // Loralai area
  [31.4, 70.3],        // Dera Ismail Khan
  [32.1, 71.5],        // Mianwali area
  [32.5, 72.3],        // Sargodha approach
  [33.6, 73.05],       // Islamabad
  // Northern Pakistan - Himalayan zigzag
  [34.0, 73.2],        // Abbottabad area
  [34.8, 72.8],        // Mansehra
  [35.2, 73.2],        // Besham
  [35.5, 74.5],        // Chilas
  [35.8, 74.6],        // Gilgit approach
  [35.92, 74.31],      // Gilgit
  [36.3, 74.8],        // Hunza Valley
  [36.6, 75.0],        // Passu
  [36.85, 75.42],      // Khunjerab Pass (Border)
  // China - Xinjiang
  [37.5, 75.5],        // Tashkurgan
  [38.5, 75.7],        // Approach to Kashgar
  [39.47, 75.99]       // Kashgar
];

const CPEC_LABELS = [
  'Gwadar Port',
  '', '', '', '', '', // Skip intermediate labels
  'Quetta',
  '', '', '', '',
  'Islamabad',
  '', '', '', '', '', 
  'Gilgit',
  '', '',
  'Khunjerab Pass',
  '', '',
  'Kashgar'
];

export interface GlobeRef {
  flyTo: (lon: number, lat: number, height?: number) => void;
  flyToBounds: (bbox: [number, number, number, number]) => void;
  showCPECRoute: () => void;
  hideCPECRoute: () => void;
}

const Globe = forwardRef<GlobeRef, {}>((_props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<CesiumViewer | null>(null);
  const cameraControllerRef = useRef<CameraController | null>(null);
  const cpecEntitiesRef = useRef<Entity[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Cesium Viewer
    const viewer = new CesiumViewer(containerRef.current, {
      timeline: false,
      animation: false,
      baseLayerPicker: true,
      fullscreenButton: true,
      geocoder: false,
      homeButton: true,
      infoBox: true,
      sceneModePicker: true,
      selectionIndicator: true,
      navigationHelpButton: true,
      navigationInstructionsInitiallyVisible: false,
    });    viewerRef.current = viewer;
    cameraControllerRef.current = new CameraController(viewer.camera);    // Increase contrast and saturation of the base imagery layer
    const baseLayer = viewer.imageryLayers.get(0);
    if (baseLayer) {
      baseLayer.contrast = 1.3;      // Increase contrast (default 1.0)
      baseLayer.brightness = 0.7;   // Slightly darker (default 1.0)
      baseLayer.saturation = 2.0;    // More vibrant colors (default 1.0)
      baseLayer.gamma = 1.0;         // Keep gamma normal
    }

    // Add Borders & Labels (CartoDB)
    // We add this on top of the base layer (which is usually Bing Maps Aerial or whatever Cesium defaults to)
    const labelProvider = new UrlTemplateImageryProvider({
      // Use @2x for sharper (Retina) labels which look much better on modern screens
      url: "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png",
      subdomains: ["a", "b", "c", "d"],
      credit:
        "Map tiles by CartoDB, under CC BY 3.0. Data by OpenStreetMap, under ODbL.",
    });
    viewer.imageryLayers.addImageryProvider(labelProvider);

    // Initialize terrain
    const initTerrain = async () => {
      try {
        const terrainProvider = await createWorldTerrainAsync();
        viewer.terrainProvider = terrainProvider;
      } catch (e) {
        console.error("Failed to load terrain", e);
      }
    };
    initTerrain();

    // Add 3D Tiles (OSM Buildings)
    const addBuildings = async () => {
      try {
         // Using default OSM buildings
         const tileset = await Cesium3DTileset.fromIonAssetId(96188);
         viewer.scene.primitives.add(tileset);
      } catch (e) {
         console.error("Failed to load OSM buildings", e);
      }
    };
    addBuildings();

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Increase initial zoom (lower height value for closer view)
    if (viewerRef.current) {
      const camera = viewerRef.current.camera;
      const cartographic = camera.positionCartographic;
      camera.setView({
        destination: Cartesian3.fromDegrees(
          cartographic.longitude * (180 / Math.PI),
          cartographic.latitude * (180 / Math.PI),
          15000000 // Lower value = more zoomed in; default is usually ~10,000,000
        )
      });
    }
  }, []);

  const showCPECRoute = () => {
    if (!viewerRef.current) return;

    // Clear existing CPEC entities
    hideCPECRoute();

    // Add waypoint markers - only major cities get labels and larger markers
    CPEC_PATH.forEach(([lat, lon], index) => {
      const hasLabel = CPEC_LABELS[index] && CPEC_LABELS[index].length > 0;
      const isMajorCity = hasLabel;
      
      const point = viewerRef.current!.entities.add({
        position: Cartesian3.fromDegrees(lon, lat),
        point: new PointGraphics({
          pixelSize: isMajorCity ? 14 : 6, // Larger markers for major cities
          color: isMajorCity ? Color.YELLOW : Color.ORANGE,
          outlineColor: Color.BLACK,
          outlineWidth: isMajorCity ? 2 : 1,
          heightReference: 0 // Clamp to ground
        }),
        label: hasLabel ? new LabelGraphics({
          text: CPEC_LABELS[index],
          font: '12pt sans-serif',
          fillColor: Color.YELLOW.withAlpha(1.0),
          outlineColor: Color.BLACK,
          outlineWidth: 1,
          style: 1, // FILL_AND_OUTLINE
          pixelOffset: new Cartesian3(0, -40, 0),
          horizontalOrigin: HorizontalOrigin.CENTER,
          verticalOrigin: VerticalOrigin.TOP
        }) : undefined
      });
      cpecEntitiesRef.current.push(point);
    });

    // Add connecting polyline - red like in the reference image
    const positions = CPEC_PATH.map(([lat, lon]) => Cartesian3.fromDegrees(lon, lat));
    const polyline = viewerRef.current!.entities.add({
      polyline: new PolylineGraphics({
        positions: positions,
        width: 5,
        material: Color.RED, // Red like the reference map
        clampToGround: true
      })
    });
    cpecEntitiesRef.current.push(polyline);
  };

  const hideCPECRoute = () => {
    if (!viewerRef.current) return;

    cpecEntitiesRef.current.forEach(entity => {
      viewerRef.current!.entities.remove(entity);
    });
    cpecEntitiesRef.current = [];
  };

  useImperativeHandle(ref, () => ({
    flyTo: (lon: number, lat: number, height: number = 2000) => {
      if (cameraControllerRef.current) {
        cameraControllerRef.current.rotateAndZoomTo(lon, lat, { zoomHeight: height });
      }
    },
    flyToBounds: (bbox: [number, number, number, number]) => {
      if (cameraControllerRef.current) {
        cameraControllerRef.current.flyToBoundingBox(bbox);
      }
    },
    showCPECRoute: () => {
      showCPECRoute();
    },
    hideCPECRoute: () => {
      hideCPECRoute();
    }
  }));

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '100%' }}
    />
  );
});

export default Globe;
