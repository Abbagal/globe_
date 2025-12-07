import React, { useState, useRef } from 'react';
import Globe, { GlobeRef, UnitData } from './Globe';
import { geocodingService } from './GeocodingService';
import CPECSidebar from './CPECSidebarNew';
import KeyOfficialsSidebar from './KeyOfficialsSidebar';
import IntelWorkspace from './IntelWorkspace';

function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCPECSidebar, setShowCPECSidebar] = useState(false);  const [showKeyOfficialsSidebar, setShowKeyOfficialsSidebar] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [cpecLoading, setCpecLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');  const [osintLoading, setOsintLoading] = useState(false);
  const [osintLoadingText, setOsintLoadingText] = useState('');
  const [showIntelWorkspace, setShowIntelWorkspace] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitData | null>(null);
  const [intelLoading, setIntelLoading] = useState(false);
  const [intelLoadingText, setIntelLoadingText] = useState('');
  const globeRef = useRef<GlobeRef>(null);
  const animateCPECLoading = async () => {
    setCpecLoading(true);
    const loadingMessages = [
      'INITIALIZING SATELLITE CONNECTION...',
      'ACCESSING CLASSIFIED DATABASE...',
      'TRIANGULATING CPEC COORDINATES...',
      'DECRYPTING GEOSPATIAL DATA...',
      'SYNCHRONIZING WITH GROUND STATIONS...',
      'ESTABLISHING SECURE LINK...',
      'CPEC INTELLIGENCE ACTIVATED'
    ];

    for (let i = 0; i < loadingMessages.length; i++) {
      setLoadingText(loadingMessages[i]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    setCpecLoading(false);
    setLoadingText('');
  };
  const animateOSINTLoading = async () => {
    setOsintLoading(true);
    const osintMessages = [
      'FINDING OFFICIALS...',
      'FINDING OFFICIALS...',
      'FINDING OFFICIALS...',
      'FINDING OFFICIALS...',
      'FINDING OFFICIALS...',
      'FINDING OFFICIALS...',
      'KEY OFFICIALS DATABASE UNLOCKED'
    ];

    for (let i = 0; i < osintMessages.length; i++) {
      setOsintLoadingText(osintMessages[i]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
      setOsintLoading(false);
    setOsintLoadingText('');
  };

  const animateIntelLoading = async () => {
    setIntelLoading(true);
    const intelMessages = [
      'INITIALIZING INTEL WORKSPACE...',
      'ESTABLISHING SECURE UPLINK...',
      'ACCESSING TACTICAL DATABASE...',
      'LOADING SENSOR NETWORKS...',
      'CALIBRATING TARGET ACQUISITION...',
      'SYNCHRONIZING ASSET POSITIONS...',
      'DECRYPTING MISSION DATA...',
      'LOADING ISR FEEDS...',
      'INTEL WORKSPACE READY'
    ];

    for (let i = 0; i < intelMessages.length; i++) {
      setIntelLoadingText(intelMessages[i]);
      await new Promise(resolve => setTimeout(resolve, 400));
    }
    
    setIntelLoading(false);
    setIntelLoadingText('');
  };  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      // First, try to search for a unit in the Globe
      if (globeRef.current && globeRef.current.searchUnit(query)) {
        // Unit found! Clear CPEC sidebar if it was open
        setShowCPECSidebar(false);
        setLoading(false);
        return;
      }

      // If not a unit, try geocoding service
      const result = await geocodingService.search(query);
      if (result) {
        // Handle CPEC special case with loading animation
        if (result.isCPEC && globeRef.current) {
          setLoading(false); // Stop normal loading
          await animateCPECLoading(); // Show CPEC loading animation
          
          // Show CPEC route, sidebar, and fly to the overview
          globeRef.current.showCPECRoute();
          setShowCPECSidebar(true);
          if (result.bbox) {
            globeRef.current.flyToBounds(result.bbox);
          } else {
            globeRef.current.flyTo(result.lon, result.lat, 2000000); // Higher altitude for overview
          }
        } else if (globeRef.current) {
          // Clear CPEC route and sidebar for non-CPEC searches
          globeRef.current.hideCPECRoute();
          setShowCPECSidebar(false);
          
          if (result.bbox) {
            // If we have a bounding box, fly to it
            globeRef.current.flyToBounds(result.bbox);
          } else {
            // Otherwise fly to the point
            globeRef.current.flyTo(result.lon, result.lat);
          }
        }
      } else {
        setError('Location not found');
        setShowCPECSidebar(false);
      }
    } catch (err) {
      setError('Error searching location');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
      }}
    >
      {" "}      {!showIntelWorkspace && <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 1000,
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          padding: "15px",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxWidth: "300px",
        }}
      >
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px" }}>
          {" "}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search location..."
            aria-label="Search location"
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid rgba(0, 255, 255, 0.3)",
              background: "rgba(0, 0, 0, 0.3)",
              color: "white",
              flex: 1,
              fontSize: "14px",
              fontFamily: "monospace",
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.border = "1px solid rgba(0, 255, 255, 0.6)";
              e.target.style.boxShadow = "0 0 10px rgba(0, 255, 255, 0.2)";
            }}
            onBlur={(e) => {
              e.target.style.border = "1px solid rgba(0, 255, 255, 0.3)";
              e.target.style.boxShadow = "none";
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 16px",
              background: loading
                ? "rgba(0, 255, 255, 0.3)"
                : "rgba(0, 255, 255, 0.8)",
              color: loading ? "#666" : "#000",
              border: "1px solid rgba(0, 255, 255, 0.6)",
              borderRadius: "8px",
              cursor: loading ? "wait" : "pointer",
              fontSize: "14px",
              fontFamily: "monospace",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1px",
              transition: "all 0.3s ease",
            }}
          >
            {loading ? "..." : "Go"}
          </button>
        </form>{" "}
        {error && (
          <div
            style={{
              color: "#ff6b6b",
              fontSize: "12px",
              fontFamily: "monospace",
              textAlign: "center",
              background: "rgba(255, 107, 107, 0.1)",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid rgba(255, 107, 107, 0.3)",
            }}
          >
            {error}
          </div>
        )}
         </div>}      <Globe 
        ref={globeRef} 
        onEnterIntelWorkspace={async (unit) => {
          setSelectedUnit(unit);
          setShowCPECSidebar(false);
          setShowKeyOfficialsSidebar(false);
          
          // Show loading animation first
          await animateIntelLoading();
          
          setShowIntelWorkspace(true);
            // Fly to the unit location AFTER loading completes
          if (globeRef.current && unit.coordinates) {
            // Use consistent zoom height that works for all terrains
            // (Pakistan lowlands, Chinese highlands/Tibet plateau)
            globeRef.current.flyToUnit(
              unit.coordinates.lon,
              unit.coordinates.lat,
              8000 // Consistent altitude above sea level for all units
            );
            
            // Add target entity on the globe
            globeRef.current.addTargetEntity(
              unit.coordinates.lon,
              unit.coordinates.lat,
              unit.name
            );
          }
        }}
      />
        {/* Intel Workspace */}
      <IntelWorkspace
        isVisible={showIntelWorkspace}
        unit={selectedUnit}
        onClose={() => {
          setShowIntelWorkspace(false);
          setSelectedUnit(null);
          
          // Remove target entity from the globe
          if (globeRef.current) {
            globeRef.current.removeTargetEntity();
          }
        }}
        onAssetSelected={(assetId, destructionRadius) => {
          // Update target rings based on selected asset's destruction radius
          if (globeRef.current) {
            globeRef.current.updateTargetRings(destructionRadius);
          }
          console.log(`Asset ${assetId ? assetId : 'none'} selected, destruction radius: ${destructionRadius}m`);
        }}
      />
      
      {/* CPEC Loading Overlay */}
      {cpecLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.95)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5000,
            fontFamily: "monospace",
          }}
        >
          <div
            style={{
              color: "#00ffff",
              fontSize: "24px",
              marginBottom: "30px",
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            CPEC INTELLIGENCE SYSTEM
          </div>
          <div
            style={{
              color: "#00ff00",
              fontSize: "16px",
              marginBottom: "40px",
              animation: "pulse 1.5s ease-in-out infinite alternate",
              textAlign: "center",
              minHeight: "20px",
            }}
          >
            {loadingText}
          </div>
          <div
            style={{
              width: "300px",
              height: "2px",
              background: "rgba(0, 255, 255, 0.3)",
              borderRadius: "1px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "100px",
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, #00ffff, transparent)",
                animation: "loading 2s linear infinite",
              }}
            />
          </div>
          <div
            style={{
              color: "#666",
              fontSize: "10px",
              marginTop: "20px",
              letterSpacing: "1px",
            }}
          >
            CLASSIFIED - AUTHORIZED PERSONNEL ONLY
          </div>{" "}
        </div>
      )}
      {/* OSINT Loading Overlay */}
      {osintLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.95)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5000,
            fontFamily: "monospace",
          }}
        >
          <div
            style={{
              color: "#ff6600",
              fontSize: "24px",
              marginBottom: "30px",
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            OFFICIAL PERSONNEL RECORDS
          </div>

          <div
            style={{
              color: "#ffff00",
              fontSize: "16px",
              marginBottom: "40px",
              animation: "pulse 1.5s ease-in-out infinite alternate",
              textAlign: "center",
              minHeight: "20px",
            }}
          >
            {osintLoadingText}
          </div>

          <div
            style={{
              width: "300px",
              height: "2px",
              background: "rgba(255, 102, 0, 0.3)",
              borderRadius: "1px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "100px",
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, #ff6600, transparent)",
                animation: "loading 2s linear infinite",
              }}
            />
          </div>

          <div
            style={{
              color: "#666",
              fontSize: "10px",
              marginTop: "20px",
              letterSpacing: "1px",
            }}
          >            TOP SECRET - INTELLIGENCE PERSONNEL ONLY
          </div>
        </div>
      )}
      {/* Intel Workspace Loading Overlay */}
      {intelLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.98)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5000,
            fontFamily: "monospace",
          }}
        >
          {/* Top classified banner */}
          <div
            style={{
              position: "absolute",
              top: 20,
              color: "#ff0000",
              fontSize: "12px",
              letterSpacing: "4px",
              textTransform: "uppercase",
              borderTop: "1px solid #ff0000",
              borderBottom: "1px solid #ff0000",
              padding: "8px 30px",
              animation: "pulse 1s ease-in-out infinite alternate",
            }}
          >
            ▲ TOP SECRET // NOFORN // ORCON ▲
          </div>

          {/* Animated grid background */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backgroundImage: `
                linear-gradient(rgba(0, 150, 255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 150, 255, 0.03) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
              animation: "gridMove 20s linear infinite",
            }}
          />

          {/* Rotating target reticle */}
          <div
            style={{
              position: "relative",
              width: "150px",
              height: "150px",
              marginBottom: "40px",
            }}
          >
            {/* Outer ring */}
            <div
              style={{
                position: "absolute",
                width: "150px",
                height: "150px",
                border: "2px solid rgba(0, 150, 255, 0.5)",
                borderRadius: "50%",
                animation: "rotate 8s linear infinite",
              }}
            >
              {/* Tick marks */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <div
                  key={deg}
                  style={{
                    position: "absolute",
                    width: "2px",
                    height: "10px",
                    background: "#0096ff",
                    top: "0",
                    left: "50%",
                    transformOrigin: "50% 75px",
                    transform: `translateX(-50%) rotate(${deg}deg)`,
                  }}
                />
              ))}
            </div>
            {/* Middle ring */}
            <div
              style={{
                position: "absolute",
                width: "100px",
                height: "100px",
                top: "25px",
                left: "25px",
                border: "1px solid rgba(0, 150, 255, 0.4)",
                borderRadius: "50%",
                animation: "rotateReverse 6s linear infinite",
              }}
            />
            {/* Inner ring */}
            <div
              style={{
                position: "absolute",
                width: "50px",
                height: "50px",
                top: "50px",
                left: "50px",
                border: "1px solid rgba(0, 150, 255, 0.6)",
                borderRadius: "50%",
                animation: "rotate 4s linear infinite",
              }}
            />
            {/* Center dot */}
            <div
              style={{
                position: "absolute",
                width: "10px",
                height: "10px",
                top: "70px",
                left: "70px",
                background: "#0096ff",
                borderRadius: "50%",
                boxShadow: "0 0 20px #0096ff, 0 0 40px #0096ff",
                animation: "pulse 1s ease-in-out infinite alternate",
              }}
            />
            {/* Crosshairs */}
            <div
              style={{
                position: "absolute",
                width: "150px",
                height: "2px",
                top: "74px",
                left: "0",
                background: "linear-gradient(90deg, transparent, rgba(0, 150, 255, 0.5) 30%, transparent 50%, rgba(0, 150, 255, 0.5) 70%, transparent)",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: "2px",
                height: "150px",
                top: "0",
                left: "74px",
                background: "linear-gradient(180deg, transparent, rgba(0, 150, 255, 0.5) 30%, transparent 50%, rgba(0, 150, 255, 0.5) 70%, transparent)",
              }}
            />
          </div>

          {/* Title */}
          <div
            style={{
              color: "#0096ff",
              fontSize: "28px",
              marginBottom: "15px",
              letterSpacing: "8px",
              textTransform: "uppercase",
              textShadow: "0 0 20px rgba(0, 150, 255, 0.5)",
            }}
          >
            INTEL WORKSPACE
          </div>

          {/* Subtitle */}
          <div
            style={{
              color: "#00ff88",
              fontSize: "12px",
              marginBottom: "30px",
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            TACTICAL OPERATIONS CENTER
          </div>

          {/* Loading text */}
          <div
            style={{
              color: "#ffffff",
              fontSize: "14px",
              marginBottom: "30px",
              animation: "pulse 0.5s ease-in-out infinite alternate",
              textAlign: "center",
              minHeight: "20px",
              letterSpacing: "2px",
              textShadow: "0 0 10px rgba(255, 255, 255, 0.3)",
            }}
          >
            {intelLoadingText}
          </div>

          {/* Progress bar */}
          <div
            style={{
              width: "350px",
              height: "3px",
              background: "rgba(0, 150, 255, 0.2)",
              borderRadius: "2px",
              overflow: "hidden",
              position: "relative",
              border: "1px solid rgba(0, 150, 255, 0.3)",
            }}
          >
            <div
              style={{
                width: "120px",
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, #0096ff, #00ff88, #0096ff, transparent)",
                animation: "loading 1.5s linear infinite",
              }}
            />
          </div>

          {/* Technical readout */}
          <div
            style={{
              marginTop: "40px",
              display: "flex",
              gap: "40px",
              fontSize: "10px",
              color: "#666",
              letterSpacing: "1px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#0096ff", marginBottom: "4px" }}>LINK STATUS</div>
              <div style={{ color: "#00ff88" }}>● ACTIVE</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#0096ff", marginBottom: "4px" }}>ENCRYPTION</div>
              <div style={{ color: "#00ff88" }}>AES-256</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#0096ff", marginBottom: "4px" }}>CLEARANCE</div>
              <div style={{ color: "#ffaa00" }}>TS/SCI</div>
            </div>
          </div>

          {/* Bottom warning */}
          <div
            style={{
              position: "absolute",
              bottom: 30,
              color: "#444",
              fontSize: "10px",
              letterSpacing: "2px",
              textAlign: "center",
            }}
          >
            UNAUTHORIZED ACCESS IS PROHIBITED<br />
            <span style={{ color: "#666" }}>ALL ACTIVITIES ARE MONITORED AND RECORDED</span>
          </div>
        </div>
      )}      <CPECSidebar
        isVisible={showCPECSidebar && !showIntelWorkspace}
        onClose={() => setShowCPECSidebar(false)}
        onViewKeyOfficials={async () => {
          await animateOSINTLoading();
          setShowKeyOfficialsSidebar(true);
        }}
        selectedRoute={selectedRoute}
        onRouteSelect={(routeId) => {
          setSelectedRoute(routeId);
          if (globeRef.current) {
            if (routeId === null) {
              globeRef.current.showAllRoutes();
            } else {
              globeRef.current.showSingleRoute(routeId);
            }
          }
        }}
      />
      <KeyOfficialsSidebar
        isVisible={showKeyOfficialsSidebar && !showIntelWorkspace}
        onClose={() => setShowKeyOfficialsSidebar(false)}
      />      {/* CSS Animations */}
      <style>
        {`
          @keyframes pulse {
            from { opacity: 1; }
            to { opacity: 0.4; }
          }
          
          @keyframes loading {
            0% { transform: translateX(-120px); }
            100% { transform: translateX(350px); }
          }
          
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes rotateReverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
          
          @keyframes gridMove {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, 50px); }
          }
        `}
      </style>
    </div>
  );
}

export default App;
