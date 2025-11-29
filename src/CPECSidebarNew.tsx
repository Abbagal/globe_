import React, { useState } from 'react';
import PhotoGalleryModal from './PhotoGalleryModal';

interface CPECSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  onViewKeyOfficials: () => void;
}

const CPECSidebar: React.FC<CPECSidebarProps> = ({ isVisible, onClose, onViewKeyOfficials }) => {
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

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
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "350px",
        height: "100vh",
        background: "rgba(0, 0, 0, 0.9)",
        color: "white",
        padding: "20px",
        boxSizing: "border-box",
        zIndex: 2000,
        fontFamily: "monospace",
        overflow: "auto",
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
  );
};

export default CPECSidebar;
