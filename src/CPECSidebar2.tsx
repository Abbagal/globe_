import React from 'react';

interface CPECSidebarProps {
  isVisible: boolean;
  onClose: () => void;
}

const CPECSidebar: React.FC<CPECSidebarProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      width: '350px',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '20px',
      boxSizing: 'border-box',
      zIndex: 2000,
      fontFamily: 'monospace',
      overflow: 'auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '1px solid #333',
        paddingBottom: '15px'
      }}>
        <h2 style={{
          color: '#00ffff',
          fontSize: '18px',
          margin: 0,
          letterSpacing: '2px'
        }}>
          CPEC INTELLIGENCE
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          ✕
        </button>
      </div>

      {/* Live indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '20px'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#ff0000',
          animation: 'pulse 1.5s ease-in-out infinite alternate'
        }}></div>
        <span style={{ fontSize: '12px', color: '#ff0000' }}>LIVE</span>
      </div>

      {/* Target Region Section */}
      <div style={{ marginBottom: '25px' }}>
        <div style={{
          color: '#00ffff',
          fontSize: '12px',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          🎯 TARGET REGION
        </div>
        <div style={{
          background: 'rgba(0, 255, 255, 0.1)',
          padding: '12px',
          borderRadius: '4px',
          fontSize: '11px',
          lineHeight: '1.4'
        }}>
          China-Pakistan Economic Corridor connecting Gwadar Port to Kashgar via Karakoram Highway.
        </div>
      </div>

      {/* Satellite Feed */}
      <div style={{ marginBottom: '25px' }}>
        <div style={{
          width: '100%',
          height: '120px',
          background: 'linear-gradient(45deg, #001133, #003366)',
          borderRadius: '4px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            fontSize: '10px',
            color: '#00ffff'
          }}>
            🛰️ LIVE FEED: SATELLITE-7
          </div>
        </div>
      </div>

      {/* Key Officials Button */}
      <button style={{
        width: '100%',
        background: 'rgba(0, 255, 255, 0.2)',
        border: '1px solid #00ffff',
        color: '#00ffff',
        padding: '12px',
        borderRadius: '4px',
        fontSize: '12px',
        cursor: 'pointer',
        marginBottom: '25px',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>
        👁️ VIEW KEY OFFICIALS
      </button>

      {/* Intel Workspace Button */}
      <button style={{
        width: '100%',
        background: '#00ffff',
        border: 'none',
        color: 'black',
        padding: '15px',
        borderRadius: '4px',
        fontSize: '12px',
        cursor: 'pointer',
        marginBottom: '25px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        fontWeight: 'bold'
      }}>
        🖥️ ENTER INTEL WORKSPACE
      </button>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <div>
          <div style={{
            fontSize: '10px',
            color: '#888',
            marginBottom: '5px',
            textTransform: 'uppercase'
          }}>
            Investment
          </div>
          <div style={{
            color: '#00ffff',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            $62B
          </div>
        </div>
        <div>
          <div style={{
            fontSize: '10px',
            color: '#888',
            marginBottom: '5px',
            textTransform: 'uppercase'
          }}>
            Length
          </div>
          <div style={{
            color: '#00ffff',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            3,000 KM
          </div>
        </div>
        <div>
          <div style={{
            fontSize: '10px',
            color: '#888',
            marginBottom: '5px',
            textTransform: 'uppercase'
          }}>
            Status
          </div>
          <div style={{
            color: '#00ff00',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            ACTIVE
          </div>
        </div>
        <div>
          <div style={{
            fontSize: '10px',
            color: '#888',
            marginBottom: '5px',
            textTransform: 'uppercase'
          }}>
            Security
          </div>
          <div style={{
            color: '#00ff00',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            HIGH
          </div>
        </div>
      </div>

      {/* System Info */}
      <div style={{
        borderTop: '1px solid #333',
        paddingTop: '15px',
        fontSize: '10px',
        color: '#555'
      }}>
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
    </div>
  );
};

export default CPECSidebar;
