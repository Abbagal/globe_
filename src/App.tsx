import React, { useState, useRef } from 'react';
import Globe, { GlobeRef } from './Globe';
import { geocodingService } from './GeocodingService';
import CPECSidebar from './CPECSidebarNew';
import KeyOfficialsSidebar from './KeyOfficialsSidebar';
import RouteLegend from './RouteLegend';

function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCPECSidebar, setShowCPECSidebar] = useState(false);  const [showKeyOfficialsSidebar, setShowKeyOfficialsSidebar] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [cpecLoading, setCpecLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [osintLoading, setOsintLoading] = useState(false);
  const [osintLoadingText, setOsintLoadingText] = useState('');
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
      {" "}      <div
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
         </div>{" "}
      <Globe ref={globeRef} />
      
      {/* Route Legend - visible when CPEC sidebar is shown */}
      <RouteLegend
        visible={showCPECSidebar}
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
          >
            TOP SECRET - INTELLIGENCE PERSONNEL ONLY
          </div>
        </div>
      )}
      <CPECSidebar
        isVisible={showCPECSidebar}
        onClose={() => setShowCPECSidebar(false)}
        onViewKeyOfficials={async () => {
          await animateOSINTLoading();
          setShowKeyOfficialsSidebar(true);
        }}
      />
      <KeyOfficialsSidebar
        isVisible={showKeyOfficialsSidebar}
        onClose={() => setShowKeyOfficialsSidebar(false)}
      />
      {/* CSS Animations */}
      <style>
        {`
          @keyframes pulse {
            from { opacity: 1; }
            to { opacity: 0.4; }
          }
          
          @keyframes loading {
            0% { transform: translateX(-100px); }
            100% { transform: translateX(300px); }
          }
        `}
      </style>
    </div>
  );
}

export default App;
