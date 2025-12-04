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
      zIndex: 500,
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

      {/* Target Region */}
      <div style={{ marginBottom: '25px' }}>
        <div style={{
          color: '#00ffff',
          fontSize: '12px',
          fontWeight: 'bold',
          marginBottom: '8px',
          letterSpacing: '1px'
        }}>
          🎯 TARGET REGION
        </div>
        <div style={{
          fontSize: '13px',
          lineHeight: '1.4',
          color: '#cccccc'
        }}>
          China-Pakistan Economic Corridor connecting Gwadar Port to Kashgar via Karakoram Highway.
        </div>
      </div>

      {/* Live Feed */}
      <div style={{ marginBottom: '25px' }}>
        <div style={{
          background: '#1a1a1a',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #333'
        }}>
          <div style={{
            color: '#00ff00',
            fontSize: '10px',
            marginBottom: '5px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            🔴 LIVE FEED: SATELLITE-7
          </div>
          <div style={{
            width: '100%',
            height: '120px',
            background: '#000',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: '#666'
          }}>
            [LIVE SATELLITE IMAGERY]
          </div>
        </div>
      </div>

      {/* Key Officials */}
      <div style={{ marginBottom: '25px' }}>
        <div style={{
          color: '#00ffff',
          fontSize: '12px',
          fontWeight: 'bold',
          marginBottom: '10px',
          letterSpacing: '1px'
        }}>
          👥 VIEW KEY OFFICIALS
        </div>
        <button style={{
          width: '100%',
          background: '#00ffff',
          color: '#000',
          border: 'none',
          padding: '12px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: 'pointer',
          letterSpacing: '1px'
        }}>
          📍 ENTER INTEL WORKSPACE
        </button>
      </div>

      {/* Statistics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '15px',
        marginBottom: '20px' 
      }}>
        <div>
          <div style={{
            color: '#666',
            fontSize: '10px',
            marginBottom: '5px',
            textTransform: 'uppercase'
          }}>
            INVESTMENT
          </div>
          <div style={{
            color: '#00ffff',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            $62B
          </div>
        </div>
        <div>
          <div style={{
            color: '#666',
            fontSize: '10px',
            marginBottom: '5px',
            textTransform: 'uppercase'
          }}>
            LENGTH
          </div>
          <div style={{
            color: '#00ffff',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            3,000 KM
          </div>
        </div>
        <div>
          <div style={{
            color: '#666',
            fontSize: '10px',
            marginBottom: '5px',
            textTransform: 'uppercase'
          }}>
            STATUS
          </div>
          <div style={{
            color: '#00ff00',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            ACTIVE
          </div>
        </div>
        <div>
          <div style={{
            color: '#666',
            fontSize: '10px',
            marginBottom: '5px',
            textTransform: 'uppercase'
          }}>
            SECURITY
          </div>
          <div style={{
            color: '#00ff00',
            fontSize: '16px',
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
        color: '#666'
      }}>
        <div>SYS.V.2.0.4</div>
        <div>✓ SECURE CONNECTION</div>
      </div>
    </div>
  );
};

export default CPECSidebar;
