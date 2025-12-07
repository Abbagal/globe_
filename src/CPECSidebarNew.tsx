import React, { useState } from 'react';
import PhotoGalleryModal from './PhotoGalleryModal';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import { CPEC_ROUTE_INFO } from './Globe';

interface CPECSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  onViewKeyOfficials: () => void;
  selectedRoute: string | null;
  onRouteSelect: (routeId: string | null) => void;
}

const CPECSidebar: React.FC<CPECSidebarProps> = ({ isVisible, onClose, onViewKeyOfficials, selectedRoute, onRouteSelect }) => {
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  const getColorValue = (colorName: string): string => {
    switch (colorName) {
      case 'RED': return '#FF3333';
      case 'CYAN': return '#00FFFF';
      case 'YELLOW': return '#FFFF00';
      case 'LIME': return '#00FF00';
      case 'MAGENTA': return '#FF00FF';
      case 'ORANGE': return '#FFA500'; // backwards compatibility
      case 'GREEN': return '#00FF00'; // backwards compatibility
      default: return '#ffffff';
    }
  };

  const handleSourceClick = async () => {
    setGalleryLoading(true);
    
    const osintMessages = [
      'ACCESSING OSINT DATABASE...',
      'RETRIEVING CLASSIFIED IMAGERY...',
      'DECRYPTING SATELLITE DATA...',
      'VERIFYING INTELLIGENCE SOURCES...',
      'LOADING VISUAL INTELLIGENCE...'
    ];

    for (let i = 0; i < osintMessages.length; i++) {
      setLoadingText(osintMessages[i]);
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    
    setGalleryLoading(false);
    setLoadingText('');
    setShowPhotoGallery(true);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Expand Button - Only visible when minimized */}
      <button
        onClick={() => setIsMinimized(false)}
        title="Expand CPEC Sidebar"
        style={{
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          background: "rgba(0, 0, 0, 0.9)",
          border: "1px solid #00ffff",
          borderRight: "none",
          borderRadius: "4px 0 0 4px",
          color: "#00ffff",
          fontSize: "18px",
          cursor: "pointer",
          padding: "15px 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.4s ease-in-out",
          zIndex: 499,
          opacity: isMinimized ? 1 : 0,
          pointerEvents: isMinimized ? "auto" : "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(0, 255, 255, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(0, 0, 0, 0.9)";
        }}
      >
        <FaChevronLeft />
      </button>

      {/* Minimize Button - Outside left edge, vertically centered */}
      <button
        onClick={() => setIsMinimized(true)}
        title="Minimize Sidebar"
        style={{
          position: "absolute",
          right: isMinimized ? "-50px" : "350px",
          top: "50%",
          transform: "translateY(-50%)",
          background: "rgba(0, 0, 0, 0.9)",
          border: "1px solid #00ffff",
          borderRight: "none",
          borderRadius: "4px 0 0 4px",
          color: "#00ffff",
          fontSize: "14px",
          cursor: "pointer",
          padding: "12px 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.4s ease-in-out",
          zIndex: 501,
          opacity: isMinimized ? 0 : 1,
          pointerEvents: isMinimized ? "none" : "auto",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(0, 255, 255, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(0, 0, 0, 0.9)";
        }}
      >
        <FaChevronRight />
      </button>

      <div
        style={{
          position: "absolute",
          top: 0,
          right: isMinimized ? "-350px" : "0px",
          width: "350px",
          height: "100vh",
          background: "rgba(0, 0, 0, 0.9)",
          color: "white",
          padding: "20px",
          boxSizing: "border-box",
          zIndex: 500,
          fontFamily: "monospace",
          overflow: "auto",
          transition: "right 0.4s ease-in-out",
        }}
      >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          borderBottom: "1px solid #333",
          paddingBottom: "15px",
        }}
      >
        <h2
          style={{
            color: "#00ffff",
            fontSize: "18px",
            margin: 0,
            letterSpacing: "2px",
          }}
        >
          CPEC INTELLIGENCE
        </h2>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "white",
            fontSize: "20px",
            cursor: "pointer",
            padding: "5px",
          }}
        >
          ✕
        </button>
      </div>

      {/* Live indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#ff0000",
            animation: "pulse 1.5s ease-in-out infinite alternate",
          }}
        ></div>
        <span style={{ fontSize: "12px", color: "#ff0000" }}>LIVE</span>
      </div>

      {/* Target Region Section */}
      <div style={{ marginBottom: "25px" }}>
        <div
          style={{
            color: "#00ffff",
            fontSize: "12px",
            marginBottom: "8px",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          🎯 TARGET REGION
        </div>
        <div
          style={{
            background: "rgba(0, 255, 255, 0.1)",
            padding: "12px",
            borderRadius: "4px",
            fontSize: "15px",
                      lineHeight: "1.4",
            fontWeight:"bold"
          }}
        >
          China-Pakistan Economic Corridor connecting Gwadar Port to Kashgar via
          Karakoram Highway.
        </div>
      </div>

      {/* Satellite Feed */}
      <div style={{ marginBottom: "25px" }}>
        <div
          onClick={handleSourceClick}
          style={{
            width: "100%",
            height: "120px",
            background: "linear-gradient(45deg, #001133, #003366)",
            borderRadius: "4px",
            position: "relative",
            overflow: "hidden",
            cursor: "pointer",
            border: "1px solid transparent",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.border = "1px solid #00ffff";
            e.currentTarget.style.background = "linear-gradient(45deg, #001144, #004477)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.border = "1px solid transparent";
            e.currentTarget.style.background = "linear-gradient(45deg, #001133, #003366)";
          }}
        >
          {/* Photo Gallery Icon */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "24px",
              color: "#00ffff",
              opacity: 0.7,
            }}
          >
            📷
          </div>
          
          {/* Click Hint */}
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              fontSize: "10px",
              color: "#00ffff",
              opacity: 0.8,
            }}
          >
            CLICK TO VIEW GALLERY
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "8px",
              left: "8px",
              fontSize: "10px",
              color: "#00ffff",
            }}
          >
            SOURCE: CPEC PROJECT MAP (MEDIA GRAPHIC)
          </div>
        </div>
      </div>

      {/* Key Officials Button */}
      <button
        onClick={onViewKeyOfficials}
        style={{
          width: "100%",
          background: "rgba(0, 255, 255, 0.2)",
          border: "1px solid #00ffff",
          color: "#00ffff",
          padding: "12px",
          borderRadius: "4px",
          fontSize: "12px",
          cursor: "pointer",
          marginBottom: "15px",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        👥 VIEW KEY OFFICIALS
      </button>

      {/* Intel Workspace Button */}
      <button
        style={{
          width: "100%",
          background: "#00ffff",
          color: "#000",
          border: "none",
          padding: "15px",
          borderRadius: "4px",
          fontSize: "12px",
          cursor: "pointer",
          marginBottom: "25px",
          textTransform: "uppercase",
          letterSpacing: "1px",
          fontWeight: "bold",
        }}
      >
        🖥️ ENTER INTEL WORKSPACE
      </button>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "10px",
              color: "#888",
              marginBottom: "5px",
              textTransform: "uppercase",
            }}
          >
            Investment
          </div>
          <div
            style={{
              color: "#00ffff",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            $62B
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: "10px",
              color: "#888",
              marginBottom: "5px",
              textTransform: "uppercase",
            }}
          >
            Length
          </div>
          <div
            style={{
              color: "#00ffff",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            3,000 KM
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: "10px",
              color: "#888",
              marginBottom: "5px",
              textTransform: "uppercase",
            }}
          >
            Status
          </div>
          <div
            style={{
              color: "#00ff00",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            ACTIVE
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: "10px",
              color: "#888",
              marginBottom: "5px",
              textTransform: "uppercase",
            }}
          >
            Security
          </div>
          <div
            style={{
              color: "#00ff00",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            HIGH
          </div>
        </div>
      </div>

      {/* System Info */}
      <div
        style={{
          borderTop: "1px solid #333",
          paddingTop: "15px",
          fontSize: "10px",
          color: "#555",
        }}
      >
        <div>SYS.V.2.0.4</div>
        <div>⚡ SECURE CONNECTION</div>
      </div>

      {/* CPEC Routes Legend */}
      <div
        style={{
          marginTop: "25px",
          borderTop: "1px solid #333",
          paddingTop: "20px",
        }}
      >
        <div
          style={{
            color: "#00ffff",
            fontSize: "12px",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "2px",
            marginBottom: "15px",
            borderBottom: "1px solid rgba(0, 255, 255, 0.3)",
            paddingBottom: "8px",
          }}
        >
          CPEC ROUTES
        </div>

        {/* Show All Routes button */}
        <div
          onClick={() => onRouteSelect(null)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 10px",
            marginBottom: "8px",
            cursor: "pointer",
            borderRadius: "6px",
            background: selectedRoute === null ? "rgba(0, 255, 255, 0.2)" : "transparent",
            border: selectedRoute === null ? "1px solid rgba(0, 255, 255, 0.5)" : "1px solid transparent",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (selectedRoute !== null) {
              e.currentTarget.style.background = "rgba(0, 255, 255, 0.1)";
            }
          }}
          onMouseLeave={(e) => {
            if (selectedRoute !== null) {
              e.currentTarget.style.background = "transparent";
            }
          }}
        >
          <div
            style={{
              width: "20px",
              height: "4px",
              background: "linear-gradient(90deg, #ff4444, #00ffff, #ffa500, #00ff00, #ff00ff)",
              borderRadius: "2px",
            }}
          />
          <span
            style={{
              color: selectedRoute === null ? "#00ffff" : "#ffffff",
              fontSize: "11px",
              fontWeight: selectedRoute === null ? "bold" : "normal",
            }}
          >
            ALL ROUTES
          </span>
        </div>

        {/* Individual route items */}
        {CPEC_ROUTE_INFO.map((route) => (
          <div
            key={route.id}
            onClick={() => onRouteSelect(route.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 10px",
              marginBottom: "4px",
              cursor: "pointer",
              borderRadius: "6px",
              background: selectedRoute === route.id ? "rgba(0, 255, 255, 0.2)" : "transparent",
              border: selectedRoute === route.id ? "1px solid rgba(0, 255, 255, 0.5)" : "1px solid transparent",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (selectedRoute !== route.id) {
                e.currentTarget.style.background = "rgba(0, 255, 255, 0.1)";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedRoute !== route.id) {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            <div
              style={{
                width: "20px",
                height: "4px",
                background: getColorValue(route.color),
                borderRadius: "2px",
                boxShadow: `0 0 6px ${getColorValue(route.color)}`,
              }}
            />
            <span
              style={{
                color: selectedRoute === route.id ? getColorValue(route.color) : "#cccccc",
                fontSize: "11px",
                fontWeight: selectedRoute === route.id ? "bold" : "normal",
                textTransform: "uppercase",
              }}
            >
              {route.name}
            </span>
          </div>
        ))}

        <div
          style={{
            marginTop: "12px",
            paddingTop: "8px",
            borderTop: "1px solid rgba(0, 255, 255, 0.2)",
            fontSize: "9px",
            color: "rgba(255, 255, 255, 0.5)",
            textAlign: "center",
          }}
        >
          CLICK TO FILTER ROUTES
        </div>
      </div>

      {/* Add CSS animation */}
      <style>
        {`
          @keyframes pulse {
            from { opacity: 1; }
            to { opacity: 0.3; }
          }
        `}
      </style>

      {/* Gallery Loading Overlay */}
      {galleryLoading && (
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
            zIndex: 15000,
            fontFamily: "monospace",
          }}
        >
          <div
            style={{
              color: "#00ff00",
              fontSize: "24px",
              marginBottom: "30px",
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            OSINT VISUAL INTELLIGENCE
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
            {loadingText}
          </div>
          
          <div
            style={{
              width: "300px",
              height: "2px",
              background: "rgba(0, 255, 0, 0.3)",
              borderRadius: "1px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "100px",
                height: "100%",
                background: "linear-gradient(90deg, transparent, #00ff00, transparent)",
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
            CLASSIFIED VISUAL DATA - AUTHORIZED ACCESS
          </div>
        </div>
      )}

      {/* Photo Gallery Modal */}
      <PhotoGalleryModal
        isVisible={showPhotoGallery}
        onClose={() => setShowPhotoGallery(false)}
      />
    </div>
    </>
  );
};

export default CPECSidebar;
