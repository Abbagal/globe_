import React from 'react';
import { CPEC_ROUTE_INFO } from './Globe';

interface RouteLegendProps {
  visible: boolean;
  selectedRoute: string | null;
  onRouteSelect: (routeId: string | null) => void;
}

const getColorValue = (colorName: string): string => {
  switch (colorName) {
    case 'RED': return '#ff4444';
    case 'CYAN': return '#00ffff';
    case 'ORANGE': return '#ffa500';
    case 'GREEN': return '#00ff00';
    case 'MAGENTA': return '#ff00ff';
    default: return '#ffffff';
  }
};

const RouteLegend: React.FC<RouteLegendProps> = ({ visible, selectedRoute, onRouteSelect }) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 20,
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0, 255, 255, 0.3)',
        padding: '15px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        minWidth: '200px',
      }}
    >
      <div
        style={{
          color: '#00ffff',
          fontSize: '12px',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: '12px',
          borderBottom: '1px solid rgba(0, 255, 255, 0.3)',
          paddingBottom: '8px',
        }}
      >
        CPEC ROUTES
      </div>

      {/* Show All Routes button */}
      <div
        onClick={() => onRouteSelect(null)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 10px',
          marginBottom: '8px',
          cursor: 'pointer',
          borderRadius: '6px',
          background: selectedRoute === null ? 'rgba(0, 255, 255, 0.2)' : 'transparent',
          border: selectedRoute === null ? '1px solid rgba(0, 255, 255, 0.5)' : '1px solid transparent',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (selectedRoute !== null) {
            e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)';
          }
        }}
        onMouseLeave={(e) => {
          if (selectedRoute !== null) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        <div
          style={{
            width: '20px',
            height: '4px',
            background: 'linear-gradient(90deg, #ff4444, #00ffff, #ffa500, #00ff00, #ff00ff)',
            borderRadius: '2px',
          }}
        />
        <span
          style={{
            color: selectedRoute === null ? '#00ffff' : '#ffffff',
            fontSize: '11px',
            fontFamily: 'monospace',
            fontWeight: selectedRoute === null ? 'bold' : 'normal',
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
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 10px',
            marginBottom: '4px',
            cursor: 'pointer',
            borderRadius: '6px',
            background: selectedRoute === route.id ? 'rgba(0, 255, 255, 0.2)' : 'transparent',
            border: selectedRoute === route.id ? '1px solid rgba(0, 255, 255, 0.5)' : '1px solid transparent',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (selectedRoute !== route.id) {
              e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedRoute !== route.id) {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <div
            style={{
              width: '20px',
              height: '4px',
              background: getColorValue(route.color),
              borderRadius: '2px',
              boxShadow: `0 0 6px ${getColorValue(route.color)}`,
            }}
          />
          <span
            style={{
              color: selectedRoute === route.id ? getColorValue(route.color) : '#cccccc',
              fontSize: '11px',
              fontFamily: 'monospace',
              fontWeight: selectedRoute === route.id ? 'bold' : 'normal',
              textTransform: 'uppercase',
            }}
          >
            {route.name}
          </span>
        </div>
      ))}

      <div
        style={{
          marginTop: '12px',
          paddingTop: '8px',
          borderTop: '1px solid rgba(0, 255, 255, 0.2)',
          fontSize: '9px',
          fontFamily: 'monospace',
          color: 'rgba(255, 255, 255, 0.5)',
          textAlign: 'center',
        }}
      >
        CLICK TO FILTER ROUTES
      </div>
    </div>
  );
};

export default RouteLegend;
