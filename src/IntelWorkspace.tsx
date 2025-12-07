import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FaTimes, FaBuilding, FaCrosshairs, FaChevronRight, FaSatellite, FaShieldAlt, FaBolt, FaExclamationTriangle, FaRocket, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { GiMissileSwarm, GiRadarSweep } from 'react-icons/gi';

interface UnitData {
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

interface IntelWorkspaceProps {
  isVisible: boolean;
  onClose: () => void;
  unit: UnitData | null;
  onAssetSelected?: (assetId: string | null, destructionRadius: number) => void;
}

// Destruction radius mapping based on asset ID, type and munitions
// Each asset has a unique destruction radius based on its specific loadout
const getDestructionRadius = (assetId: string, assetType: string, munitions: string[]): number => {
  // Unique radius for each specific asset based on their ID and loadout
  const assetRadiusMap: { [key: string]: number } = {
    // Air Assets
    'dragnet71-11-2': 850,    // E-8C with BGM-109 (24x) - large cruise missile loadout
    'magic41-1-2': 680,       // E-3 with BGM-109 (4x) - smaller cruise missile loadout
    'mako61-12-2': 520,       // F-16CM with mixed loadout including AGM-88
    'sentry41-2-1': 180,      // AWACS - surveillance only, minimal destruction capability
    
    // Surface Assets
    'destroyer-cvn-01': 1100, // CVN-68 with Tomahawk (24x) - carrier strike group
    'cruiser-cg-01': 920,     // CG-64 with Tomahawk (16x) - guided missile cruiser
    
    // Land Assets  
    'armor-tank-01': 280,     // M1A2 Abrams - tank rounds, localized destruction
    'artillery-m777': 650,    // M777A2 with Excalibur - precision artillery
    'mlrs-himars-01': 780,    // HIMARS with ATACMS - deep strike capability
  };

  // Return specific radius if asset ID is mapped
  if (assetRadiusMap[assetId]) {
    return assetRadiusMap[assetId];
  }

  // Fallback: Calculate based on munition quantities and types
  const munitionStr = munitions.join(' ').toLowerCase();
  let baseRadius = 400;
  
  // Adjust based on munition type
  if (munitionStr.includes('tomahawk') || munitionStr.includes('atacms')) {
    baseRadius = 900;
  } else if (munitionStr.includes('bgm-109')) {
    baseRadius = 800;
  } else if (munitionStr.includes('gmlrs')) {
    baseRadius = 700;
  } else if (munitionStr.includes('excalibur')) {
    baseRadius = 600;
  } else if (munitionStr.includes('agm-88')) {
    baseRadius = 480;
  } else if (munitionStr.includes('aim-120')) {
    baseRadius = 350;
  } else if (munitionStr.includes('m829') || munitionStr.includes('m830')) {
    baseRadius = 250;
  } else if (munitionStr.includes('surveillance')) {
    baseRadius = 150;
  }
  
  // Extract quantity and add variation based on loadout size
  const quantityMatch = munitionStr.match(/\((\d+)x\)/g);
  if (quantityMatch) {
    const totalQuantity = quantityMatch.reduce((sum, match) => {
      const num = parseInt(match.match(/\d+/)?.[0] || '0');
      return sum + num;
    }, 0);
    // Add 1-3 meters per munition for variation
    baseRadius += Math.min(totalQuantity * 2, 200);
  }
  
  // Add slight random variation based on asset type hash for uniqueness
  const typeHash = assetType.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  baseRadius += (typeHash % 50);
  
  return baseRadius;
};

// Mock asset data for the sidebar
const generateMockAssets = (_unitName: string) => [
  {
    id: 'dragnet71-11-2',
    name: 'Dragnet71-11-2',
    type: 'E-8C',
    category: 'air',
    match: 'TOP MATCH',
    matchColor: '#00ff00',
    munitions: ['BGM-109 (24x)', 'AIM-120 (48x)', 'AIM-9 (12x)'],
    missionTasks: 5,
    taskType: 'XREC - AA',
    duration: '1h 31m 30s',
    status: 'LIVE',
    proposed: '5 PROPOSED',
  },
  {
    id: 'magic41-1-2',
    name: 'Magic41-1-2',
    type: 'E-3',
    category: 'air',
    match: 'FAIR MATCH',
    matchColor: '#ffaa00',
    munitions: ['BGM-109 (4x)', 'AIM-120 (8x)', 'AIM-9 (2x)'],
    missionTasks: 4,
    taskType: 'CAS - AA',
    duration: '1h 31m 30s',
    status: 'LIVE',
    proposed: '3 PROPOSED',
    approved: '1 APPROVED',
  },
  {
    id: 'mako61-12-2',
    name: 'Mako61-12-2',
    type: 'F-16CM-50',
    category: 'air',
    subType: '(2x)',
    match: 'FAIR MATCH',
    matchColor: '#ffaa00',
    munitions: ['BGM-109 (8x)', 'AIM-120 (4x)', 'AIM-9 (4x)', 'AGM-88 (4x)'],
    missionTasks: 3,
    taskType: 'XDCA - AA',
    duration: '1h 37m 21s',
    status: 'LIVE',
    proposed: '3 PROPOSED',
  },
  {
    id: 'sentry41-2-1',
    name: 'Sentry41-2-1',
    type: 'AWACS',
    category: 'air',
    match: 'FAIR MATCH',
    matchColor: '#ffaa00',
    munitions: ['Surveillance Package'],
    missionTasks: 2,
    taskType: 'ISR - Recon',
    duration: '2h 15m 00s',
    status: 'LIVE',
    proposed: '2 PROPOSED',
  },
  {
    id: 'destroyer-cvn-01',
    name: 'USS Nimitz',
    type: 'CVN-68',
    category: 'surface',
    match: 'FAIR MATCH',
    matchColor: '#ffaa00',
    munitions: ['Tomahawk (24x)', 'SM-2 (48x)', 'ESSM (32x)'],
    missionTasks: 6,
    taskType: 'SAG - Naval',
    duration: '4h 15m 00s',
    status: 'LIVE',
    proposed: '4 PROPOSED',
  },
  {
    id: 'cruiser-cg-01',
    name: 'USS Gettysburg',
    type: 'CG-64',
    category: 'surface',
    match: 'TOP MATCH',
    matchColor: '#00ff00',
    munitions: ['Tomahawk (16x)', 'SM-3 (24x)', 'ASROC (8x)'],
    missionTasks: 4,
    taskType: 'BMD - Naval',
    duration: '3h 45m 00s',
    status: 'LIVE',
    proposed: '3 PROPOSED',
    approved: '1 APPROVED',
  },
  {
    id: 'armor-tank-01',
    name: 'Thunder-1-Alpha',
    type: 'M1A2 Abrams',
    category: 'land',
    subType: '(4x)',
    match: 'FAIR MATCH',
    matchColor: '#ffaa00',
    munitions: ['M829A4 (40x)', 'M830A1 (20x)', '.50 Cal (2000x)'],
    missionTasks: 3,
    taskType: 'Armor - Ground',
    duration: '2h 30m 00s',
    status: 'LIVE',
    proposed: '2 PROPOSED',
  },
  {
    id: 'artillery-m777',
    name: 'Steel Rain Battery',
    type: 'M777A2',
    category: 'land',
    subType: '(6x)',
    match: 'TOP MATCH',
    matchColor: '#00ff00',
    munitions: ['Excalibur (48x)', 'M795 HE (200x)', 'M864 DPICM (100x)'],
    missionTasks: 5,
    taskType: 'Artillery - Fire Support',
    duration: '1h 45m 00s',
    status: 'LIVE',
    proposed: '4 PROPOSED',
  },
  {
    id: 'mlrs-himars-01',
    name: 'Hellfire-2-Bravo',
    type: 'M142 HIMARS',
    category: 'land',
    subType: '(2x)',
    match: 'FAIR MATCH',
    matchColor: '#ffaa00',
    munitions: ['GMLRS (12x)', 'ATACMS (2x)'],
    missionTasks: 4,
    taskType: 'MLRS - Deep Strike',
    duration: '2h 00m 00s',
    status: 'LIVE',
    proposed: '3 PROPOSED',
    approved: '1 APPROVED',
  },
];

// Mock aimpoints data
const generateAimpoints = (_unitName: string) => [
  { id: '39RTP 27388 69923', coords: '39RTP 27388 69923' },
  { id: '39RTP 27264 69910', coords: '39RTP 27264 69910' },
  { id: '39RTP 27333 69857', coords: '39RTP 27333 69857' },
];

const IntelWorkspace: React.FC<IntelWorkspaceProps> = ({ isVisible, onClose, unit, onAssetSelected }) => {
  const [currentTime] = useState('17:00Z');
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [taskGuidance, setTaskGuidance] = useState('');
  const [assetFilter, setAssetFilter] = useState<'all' | 'air' | 'surface' | 'land'>('all');
  
  // Bottom panel resize state
  const [bottomPanelHeight, setBottomPanelHeight] = useState(220);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  const assets = generateMockAssets(unit?.name || '');

  // Handle asset selection and notify parent to update rings
  const handleAssetSelect = useCallback((assetId: string) => {
    const newSelectedAsset = selectedAsset === assetId ? null : assetId;
    setSelectedAsset(newSelectedAsset);
    
    if (onAssetSelected) {
      if (newSelectedAsset) {
        const asset = assets.find(a => a.id === newSelectedAsset);
        if (asset) {
          const radius = getDestructionRadius(asset.id, asset.type, asset.munitions);
          onAssetSelected(newSelectedAsset, radius);
        }
      } else {
        onAssetSelected(null, 500); // Default radius when deselected
      }
    }
  }, [selectedAsset, onAssetSelected, assets]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartHeight.current = bottomPanelHeight;
  }, [bottomPanelHeight]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaY = dragStartY.current - e.clientY;
      const newHeight = Math.min(Math.max(dragStartHeight.current + deltaY, 100), 500);
      setBottomPanelHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!isVisible || !unit) return null;

  const aimpoints = generateAimpoints(unit.name);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
        fontFamily: "'Segoe UI', 'Roboto', sans-serif",
        pointerEvents: 'none',
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          height: '50px',
          background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
          borderBottom: '1px solid #2a2a4a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          pointerEvents: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GiRadarSweep style={{ color: '#00e5ff', fontSize: '24px' }} />
            <span style={{ color: '#00e5ff', fontWeight: 'bold', fontSize: '16px', letterSpacing: '2px' }}>
              INTEL WORKSPACE
            </span>
          </div>
          <div style={{ 
            background: 'rgba(255, 0, 100, 0.2)', 
            border: '1px solid #ff0064',
            padding: '4px 12px',
            borderRadius: '4px',
            color: '#ff0064',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            <FaCrosshairs style={{ marginRight: '6px' }} />
            {unit.name}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            color: '#888',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ color: '#00ff00' }}>●</span>
            LIVE FEED
          </div>
          <div style={{ color: '#aaa', fontSize: '14px' }}>
            AUG 03 2023 {currentTime}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 0, 0, 0.2)',
              border: '1px solid #ff3333',
              borderRadius: '4px',
              color: '#ff3333',
              padding: '6px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            <FaTimes /> EXIT WORKSPACE
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Column - Contains Left Sidebar, Center, and Bottom Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {/* Top Row - Left Sidebar + Center */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Left Sidebar - Target Info & Assets */}
            <div
              style={{
                width: '320px',
                background: '#0d0d15',
                borderRight: '1px solid #2a2a4a',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                pointerEvents: 'auto',
              }}
            >
          {/* Target Selection Header */}
          <div style={{
            padding: '12px 15px',
            borderBottom: '1px solid #2a2a4a',
            background: '#111120',
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              color: '#888',
              fontSize: '12px',
              marginBottom: '8px'
            }}>
              <FaCrosshairs style={{ color: '#ff0064' }} />
              Selected target:
            </div>
            
            <div style={{
              background: 'rgba(255, 0, 100, 0.1)',
              border: '1px solid rgba(255, 0, 100, 0.3)',
              borderRadius: '6px',
              padding: '10px 12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#ff0064',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <FaBuilding style={{ color: 'white', fontSize: '12px' }} />
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
                    {unit.name}
                  </div>
                  <div style={{ color: '#888', fontSize: '11px' }}>
                    {unit.type} - Multi-Aimpoint Target
                  </div>
                </div>
                <span style={{ 
                  marginLeft: 'auto', 
                  color: '#666', 
                  fontSize: '10px',
                  background: '#1a1a2e',
                  padding: '2px 6px',
                  borderRadius: '3px'
                }}>
                  P5
                </span>
              </div>

              {/* Aimpoints */}
              <div style={{ marginTop: '10px' }}>
                <div style={{ 
                  color: '#888', 
                  fontSize: '11px', 
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <FaChevronRight style={{ fontSize: '8px' }} />
                  Aimpoints ({aimpoints.length})
                </div>
                <div style={{ 
                  color: '#00e5ff', 
                  fontSize: '10px', 
                  fontFamily: 'monospace',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {aimpoints.map((ap, i) => (
                    <span key={i}>{ap.coords}</span>
                  ))}
                </div>
              </div>
            </div>
            
            <div style={{
              marginTop: '8px',
              padding: '6px 10px',
              background: 'rgba(0, 229, 255, 0.1)',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              borderRadius: '4px',
              color: '#00e5ff',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <GiMissileSwarm /> SMACK Tasking Queue
              <span style={{ marginLeft: 'auto', color: '#888' }}>MTS/MNF</span>
            </div>
          </div>

          {/* Assets Section */}
          <div style={{
            padding: '12px 15px',
            borderBottom: '1px solid #2a2a4a',
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '13px' }}>Assets</span>
              <span style={{ color: '#888', fontSize: '12px' }}>Package Template</span>
            </div>
            
            {/* Search */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '10px',
            }}>
              <input
                type="text"
                placeholder="Search Assets or Munitions..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: '#1a1a2e',
                  border: '1px solid #2a2a4a',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
              <button style={{
                background: '#00e5ff',
                border: 'none',
                borderRadius: '4px',
                padding: '0 12px',
                cursor: 'pointer',
              }}>
                🔍
              </button>
            </div>

            {/* Filter Tabs */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              fontSize: '11px',
              color: '#888',
              borderBottom: '1px solid #2a2a4a',
              paddingBottom: '8px',
            }}>
              <span 
                onClick={() => setAssetFilter('all')}
                style={{ 
                  color: assetFilter === 'all' ? '#00e5ff' : '#888', 
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  background: assetFilter === 'all' ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
                  border: assetFilter === 'all' ? '1px solid rgba(0, 229, 255, 0.3)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                🔧 All Assets
              </span>
              <span 
                onClick={() => setAssetFilter('air')}
                style={{ 
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  color: assetFilter === 'air' ? '#00e5ff' : '#888',
                  background: assetFilter === 'air' ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
                  border: assetFilter === 'air' ? '1px solid rgba(0, 229, 255, 0.3)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                ✈️ Air
              </span>
              <span 
                onClick={() => setAssetFilter('surface')}
                style={{ 
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  color: assetFilter === 'surface' ? '#00e5ff' : '#888',
                  background: assetFilter === 'surface' ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
                  border: assetFilter === 'surface' ? '1px solid rgba(0, 229, 255, 0.3)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                🚢 Surface
              </span>
              <span 
                onClick={() => setAssetFilter('land')}
                style={{ 
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  color: assetFilter === 'land' ? '#00e5ff' : '#888',
                  background: assetFilter === 'land' ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
                  border: assetFilter === 'land' ? '1px solid rgba(0, 229, 255, 0.3)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                🏔️ Land
              </span>
            </div>
          </div>

          {/* Asset List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {assets
              .filter(asset => assetFilter === 'all' || asset.category === assetFilter)
              .map((asset) => (
              <div
                key={asset.id}
                onClick={() => handleAssetSelect(asset.id)}
                style={{
                  padding: '10px 15px',
                  borderBottom: '1px solid #1a1a2e',
                  cursor: 'pointer',
                  background: selectedAsset === asset.id ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
                  borderLeft: selectedAsset === asset.id ? '3px solid #00e5ff' : '3px solid transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: asset.category === 'air' ? '#2a2a6a' : asset.category === 'surface' ? '#2a4a5a' : '#3a4a2a',
                      border: `2px solid ${asset.category === 'air' ? '#4444aa' : asset.category === 'surface' ? '#447788' : '#558844'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#888',
                      fontSize: '14px'
                    }}>
                      {asset.category === 'air' ? '✈️' : asset.category === 'surface' ? '🚢' : '🏔️'}
                    </div>
                    <div>
                      <div style={{ color: 'white', fontWeight: 'bold', fontSize: '13px' }}>{asset.name}</div>
                      <div style={{ color: '#888', fontSize: '11px' }}>
                        {asset.type} {asset.subType || '(1x)'}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    background: asset.match === 'TOP MATCH' ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 170, 0, 0.2)',
                    color: asset.matchColor,
                    fontSize: '9px',
                    fontWeight: 'bold',
                    padding: '3px 6px',
                    borderRadius: '3px',
                    border: `1px solid ${asset.matchColor}`,
                  }}>
                    {asset.match} ⓘ
                  </span>
                </div>

                {/* Munitions */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                  {asset.munitions.map((m, i) => (
                    <span key={i} style={{
                      background: '#1a1a2e',
                      color: '#00e5ff',
                      fontSize: '9px',
                      padding: '2px 6px',
                      borderRadius: '3px',
                    }}>
                      {m}
                    </span>
                  ))}
                </div>

                {/* Mission Info */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  fontSize: '11px',
                  color: '#888',
                }}>
                  <span>MISSION & TASKS ({asset.missionTasks})</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ 
                      background: 'rgba(0, 229, 255, 0.2)', 
                      color: '#00e5ff',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      fontSize: '9px'
                    }}>
                      {asset.proposed}
                    </span>
                    {asset.approved && (
                      <span style={{ 
                        background: 'rgba(0, 255, 0, 0.2)', 
                        color: '#00ff00',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '9px'
                      }}>
                        {asset.approved}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '6px',
                  fontSize: '11px'
                }}>
                  <span style={{ color: '#888' }}>
                    🎯 {asset.taskType} <span style={{ color: '#666' }}>{asset.duration}</span>
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      color: '#00ff00', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      fontSize: '10px'
                    }}>
                      ● {asset.status}
                      <span style={{ color: '#666' }}>(updated 4s ago)</span>
                    </span>
                    <span style={{ color: '#666' }}>CC</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Area - Transparent to show globe */}
        <div style={{ flex: 1, position: 'relative', background: 'transparent', pointerEvents: 'none' }}>
          {/* Target Info HUD - Shows target status without blocking view */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{ 
              color: '#ff0064', 
              fontSize: '14px',
              fontWeight: 'bold',
              letterSpacing: '2px',
              textShadow: '0 0 10px rgba(0,0,0,0.8), 0 0 20px rgba(255, 0, 100, 0.5)',
              animation: 'pulse-text 2s ease-in-out infinite',
              background: 'rgba(0, 0, 0, 0.7)',
              padding: '6px 16px',
              borderRadius: '4px',
              border: '1px solid rgba(255, 0, 100, 0.5)',
              backdropFilter: 'blur(4px)',
            }}>
              🎯 TARGET LOCKED
            </div>
            <div style={{ 
              color: '#fff', 
              fontSize: '12px', 
              marginTop: '5px', 
              textShadow: '0 0 10px rgba(0,0,0,0.8)',
              background: 'rgba(0,0,0,0.7)',
              padding: '4px 12px',
              borderRadius: '4px',
              backdropFilter: 'blur(4px)',
            }}>
              {unit.name} • {unit.locationName}
            </div>
          </div>

          {/* Assignment Bar at top */}
          <div style={{
            position: 'absolute',
            top: '15px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid #2a2a4a',
            borderRadius: '6px',
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            pointerEvents: 'auto',
          }}>
            <span style={{ color: '#888', fontSize: '12px' }}>ASSIGN ASSET:</span>
            <span style={{ 
              color: '#ff0064', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              fontSize: '13px',
              fontWeight: 'bold'
            }}>
              <FaBuilding /> {unit.name}
            </span>
            <span style={{ color: '#666', fontSize: '12px' }}>
              {'>'} Select an Asset to start pairing
            </span>
            <FaTimes style={{ color: '#888', cursor: 'pointer' }} />
          </div>
        </div>
        {/* End of Center Area */}
          </div>
          {/* End of Top Row */}

          {/* Bottom Timeline Area */}
          <div style={{
            height: `${bottomPanelHeight}px`,
            background: '#0a0a12',
            borderTop: '1px solid #2a2a4a',
            display: 'flex',
            flexDirection: 'column',
            pointerEvents: 'auto',
            position: 'relative',
            flexShrink: 0,
          }}>
            {/* Resize Handle */}
            <div
              onMouseDown={handleMouseDown}
              style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80px',
                height: '24px',
                background: 'linear-gradient(180deg, #1a1a2e 0%, #0d0d15 100%)',
                border: '1px solid #2a2a4a',
                borderBottom: 'none',
                borderRadius: '8px 8px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'ns-resize',
                zIndex: 10,
                transition: isDragging ? 'none' : 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isDragging) {
                  e.currentTarget.style.background = 'linear-gradient(180deg, #2a2a4a 0%, #1a1a2e 100%)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isDragging) {
                  e.currentTarget.style.background = 'linear-gradient(180deg, #1a1a2e 0%, #0d0d15 100%)';
                }
              }}
            >
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0px',
                lineHeight: '1',
              }}>
                <FaChevronUp style={{ 
                  color: isDragging ? '#00e5ff' : '#666', 
                  fontSize: '10px',
                  transition: 'color 0.2s ease',
                  marginBottom: '-2px',
                }} />
                <FaChevronDown style={{ 
                  color: isDragging ? '#00e5ff' : '#666', 
                  fontSize: '10px',
                  transition: 'color 0.2s ease',
                  marginTop: '-2px',
                }} />
              </div>
            </div>

            {/* Timeline Header with Date and Time Markers */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid #2a2a4a',
              background: '#0d0d15',
            }}>
              {/* Date/Time indicator */}
              <div style={{
                width: '120px',
                padding: '8px 12px',
                borderRight: '1px solid #2a2a4a',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
                <div style={{ color: '#888', fontSize: '11px', fontWeight: 'bold' }}>AUG 3 2023</div>
                <div style={{ 
                  color: '#00e5ff', 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  16 <span style={{ 
                    background: '#00e5ff', 
                    color: '#000', 
                    padding: '1px 4px', 
                    borderRadius: '2px',
                    fontSize: '10px'
                  }}>17:00Z</span>
                </div>
              </div>
              
              {/* Time markers */}
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '8px 20px',
                alignItems: 'center',
              }}>
                <span style={{ color: '#00e5ff', fontSize: '11px', fontWeight: 'bold' }}>18:00Z</span>
                <span style={{ color: '#666', fontSize: '11px' }}>19:00Z</span>
                <span style={{ color: '#666', fontSize: '11px' }}>20:00Z</span>
                <span style={{ color: '#666', fontSize: '11px' }}>21:00Z</span>
              </div>

              {/* Right side - Proposed Tasking Header */}
              <div style={{
                width: '220px',
                padding: '8px 12px',
                borderLeft: '1px solid #2a2a4a',
                background: '#111120',
              }}>
                <div style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>Proposed Tasking</div>
                <div style={{ 
                  color: '#00e5ff', 
                  fontSize: '10px',
                  marginTop: '2px'
                }}>
                  AUG 03 2023 17:55:27Z <span style={{ marginLeft: '8px' }}>📋</span>
                </div>
              </div>
            </div>

            {/* Asset Timeline Rows */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* Left side - Asset list in timeline */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Selected assets appear here */}
                {selectedAsset ? (
                  <>
                    {/* Asset Row */}
                    {assets.filter(a => a.id === selectedAsset).map(asset => (
                      <div key={asset.id} style={{ 
                        display: 'flex', 
                        borderBottom: '1px solid #1a1a2e',
                        minHeight: '50px',
                      }}>
                        {/* Asset Info Column */}
                        <div style={{
                          width: '120px',
                          padding: '8px 12px',
                          borderRight: '1px solid #2a2a4a',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: asset.category === 'air' ? '#00e5ff' : asset.category === 'surface' ? '#4488aa' : '#88aa44',
                          }} />
                          <div>
                            <div style={{ color: '#888', fontSize: '10px' }}>Flight</div>
                            <div style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}>{asset.name}</div>
                          </div>
                        </div>
                        
                        {/* Timeline bars */}
                        <div style={{ 
                          flex: 1, 
                          position: 'relative',
                          padding: '8px 20px',
                        }}>
                          {/* Task bar */}
                          <div style={{
                            position: 'absolute',
                            left: '10%',
                            top: '8px',
                            width: '25%',
                            height: '18px',
                            background: 'rgba(255, 170, 0, 0.3)',
                            border: '1px solid #ffaa00',
                            borderRadius: '3px',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 6px',
                            fontSize: '9px',
                            color: '#ffaa00',
                          }}>
                            Proposed SMACK Tasking
                          </div>
                          
                          {/* Mission bar */}
                          <div style={{
                            position: 'absolute',
                            left: '5%',
                            top: '32px',
                            width: '20%',
                            height: '14px',
                            background: 'rgba(0, 229, 255, 0.2)',
                            border: '1px solid #00e5ff',
                            borderRadius: '3px',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 6px',
                            fontSize: '8px',
                            color: '#00e5ff',
                          }}>
                            {asset.taskType}
                            <span style={{ marginLeft: '4px', color: '#666' }}>{asset.duration}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Aircraft sub-row */}
                    {assets.filter(a => a.id === selectedAsset).map(asset => (
                      <div key={`${asset.id}-aircraft`} style={{ 
                        display: 'flex', 
                        borderBottom: '1px solid #1a1a2e',
                        minHeight: '40px',
                        background: '#0c0c14',
                      }}>
                        <div style={{
                          width: '120px',
                          padding: '8px 12px',
                          borderRight: '1px solid #2a2a4a',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#666',
                          }} />
                          <div>
                            <div style={{ color: '#666', fontSize: '10px' }}>{asset.type}</div>
                            <div style={{ color: '#888', fontSize: '10px' }}>{asset.name}</div>
                          </div>
                        </div>
                        
                        <div style={{ 
                          flex: 1, 
                          position: 'relative',
                          padding: '8px 20px',
                        }}>
                          <div style={{
                            position: 'absolute',
                            left: '35%',
                            top: '12px',
                            width: '20%',
                            height: '16px',
                            background: 'rgba(255, 170, 0, 0.2)',
                            border: '1px dashed #ffaa00',
                            borderRadius: '3px',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 6px',
                            fontSize: '8px',
                            color: '#ffaa00',
                          }}>
                            Proposed SMACK Tasking
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#444',
                    fontSize: '12px',
                  }}>
                    Select an asset to view timeline
                  </div>
                )}
              </div>

              {/* Right side - Proposed Tasking Form */}
              <div style={{
                width: '220px',
                borderLeft: '1px solid #2a2a4a',
                padding: '10px 12px',
                background: '#0d0d15',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                <div>
                  <div style={{ color: '#666', fontSize: '9px', marginBottom: '2px' }}>Classification</div>
                  <div style={{ color: '#888', fontSize: '10px' }}>Verify details at MTS/MNF</div>
                </div>
                <div>
                  <div style={{ color: '#666', fontSize: '9px', marginBottom: '2px' }}>Task</div>
                  <select style={{
                    width: '100%',
                    padding: '4px 6px',
                    background: '#1a1a2e',
                    border: '1px solid #2a2a4a',
                    borderRadius: '3px',
                    color: 'white',
                    fontSize: '10px',
                  }}>
                    <option>SMACK</option>
                    <option>STRIKE</option>
                    <option>RECON</option>
                  </select>
                </div>
                <div>
                  <div style={{ color: '#666', fontSize: '9px', marginBottom: '2px' }}>Time on Target</div>
                  <div style={{ color: '#fff', fontSize: '10px' }}>AUG 03 2023 18:55Z</div>
                </div>
                <div>
                  <div style={{ color: '#666', fontSize: '9px', marginBottom: '2px' }}>Guidance</div>
                  <input
                    type="text"
                    value={taskGuidance}
                    onChange={(e) => setTaskGuidance(e.target.value)}
                    placeholder="Enter guidance..."
                    style={{
                      width: '100%',
                      padding: '4px 6px',
                      background: '#1a1a2e',
                      border: '1px solid #2a2a4a',
                      borderRadius: '3px',
                      color: 'white',
                      fontSize: '10px',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Playback Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 16px',
              borderTop: '1px solid #2a2a4a',
              background: 'linear-gradient(180deg, #0d0d15 0%, #111120 100%)',
              gap: '16px',
            }}>
              {/* Mission Status Indicators */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px',
                flex: 1,
              }}>
                {/* ISR Coverage */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  padding: '6px 12px',
                  background: 'rgba(0, 229, 255, 0.1)',
                  border: '1px solid rgba(0, 229, 255, 0.3)',
                  borderRadius: '4px',
                }}>
                  <FaSatellite style={{ color: '#00e5ff', fontSize: '14px' }} />
                  <div>
                    <div style={{ color: '#888', fontSize: '9px' }}>ISR COVERAGE</div>
                    <div style={{ color: '#00e5ff', fontSize: '12px', fontWeight: 'bold' }}>3 ASSETS ON STATION</div>
                  </div>
                </div>

                {/* SEAD Status */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  padding: '6px 12px',
                  background: 'rgba(255, 170, 0, 0.1)',
                  border: '1px solid rgba(255, 170, 0, 0.3)',
                  borderRadius: '4px',
                }}>
                  <FaShieldAlt style={{ color: '#ffaa00', fontSize: '14px' }} />
                  <div>
                    <div style={{ color: '#888', fontSize: '9px' }}>SEAD WINDOW</div>
                    <div style={{ color: '#ffaa00', fontSize: '12px', fontWeight: 'bold' }}>T-45 MIN</div>
                  </div>
                </div>

                {/* Strike Package */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  padding: '6px 12px',
                  background: 'rgba(0, 255, 0, 0.1)',
                  border: '1px solid rgba(0, 255, 0, 0.3)',
                  borderRadius: '4px',
                }}>
                  <FaBolt style={{ color: '#00ff00', fontSize: '14px' }} />
                  <div>
                    <div style={{ color: '#888', fontSize: '9px' }}>STRIKE PKG</div>
                    <div style={{ color: '#00ff00', fontSize: '12px', fontWeight: 'bold' }}>READY</div>
                  </div>
                </div>

                {/* Threat Warning */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  padding: '6px 12px',
                  background: 'rgba(255, 68, 68, 0.1)',
                  border: '1px solid rgba(255, 68, 68, 0.3)',
                  borderRadius: '4px',
                  animation: 'pulse-text 2s ease-in-out infinite',
                }}>
                  <FaExclamationTriangle style={{ color: '#ff4444', fontSize: '14px' }} />
                  <div>
                    <div style={{ color: '#888', fontSize: '9px' }}>THREAT ALERT</div>
                    <div style={{ color: '#ff4444', fontSize: '12px', fontWeight: 'bold' }}>S-400 ACTIVE</div>
                  </div>
                </div>

                {/* Comms Status */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  padding: '6px 12px',
                  background: '#1a1a2e',
                  border: '1px solid #2a2a4a',
                  borderRadius: '4px',
                }}>
                  <GiRadarSweep style={{ color: '#00ff00', fontSize: '14px' }} />
                  <div>
                    <div style={{ color: '#888', fontSize: '9px' }}>SATCOM LINK</div>
                    <div style={{ color: '#00ff00', fontSize: '12px', fontWeight: 'bold' }}>5x5 CLEAR</div>
                  </div>
                </div>
              </div>

              {/* Right side action buttons */}
              <div style={{ 
                display: 'flex', 
                gap: '8px',
                alignItems: 'center',
                paddingLeft: '16px',
                borderLeft: '1px solid #2a2a4a',
              }}>
                <button style={{
                  padding: '8px 16px',
                  background: 'rgba(255, 68, 68, 0.2)',
                  border: '1px solid #ff4444',
                  borderRadius: '4px',
                  color: '#ff4444',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <FaExclamationTriangle /> ABORT
                </button>
                <button style={{
                  padding: '8px 20px',
                  background: selectedAsset 
                    ? 'linear-gradient(180deg, #00e5ff 0%, #0099aa 100%)' 
                    : 'linear-gradient(180deg, #444 0%, #333 100%)',
                  border: 'none',
                  borderRadius: '4px',
                  color: selectedAsset ? '#000' : '#666',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: selectedAsset ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <FaRocket /> EXECUTE TASKING ({selectedAsset ? '1' : '0'})
                </button>
              </div>
            </div>
          </div>
          {/* End of Bottom Timeline Area */}
        </div>
        {/* End of Left Column */}

        {/* Right Sidebar - Mission Planning & Tasking */}
        <div style={{
          width: '300px',
          background: '#0d0d15',
          borderLeft: '1px solid #2a2a4a',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          pointerEvents: 'auto',
        }}>
          {/* Fixed Header with status indicators */}
          <div style={{
            padding: '12px 14px',
            borderBottom: '1px solid #2a2a4a',
            background: '#111120',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: '#00e5ff', fontWeight: 'bold', fontSize: '14px', letterSpacing: '1px' }}>
                MISSION CONTROL
              </span>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ 
                  background: '#00ff00', 
                  width: '10px', 
                  height: '10px', 
                  borderRadius: '50%',
                  animation: 'pulse-text 1s ease-in-out infinite'
                }} />
                <span style={{ color: '#00ff00', fontSize: '11px', fontWeight: 'bold' }}>SYNC</span>
              </div>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr 1fr', 
              gap: '8px',
              fontSize: '11px'
            }}>
              <div style={{ background: '#1a1a2e', padding: '6px 8px', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ color: '#888' }}>QUEUE</div>
                <div style={{ color: '#ffaa00', fontWeight: 'bold', fontSize: '14px' }}>7</div>
              </div>
              <div style={{ background: '#1a1a2e', padding: '6px 8px', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ color: '#888' }}>ACTIVE</div>
                <div style={{ color: '#00ff00', fontWeight: 'bold', fontSize: '14px' }}>3</div>
              </div>
              <div style={{ background: '#1a1a2e', padding: '6px 8px', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ color: '#888' }}>PENDING</div>
                <div style={{ color: '#00e5ff', fontWeight: 'bold', fontSize: '14px' }}>12</div>
              </div>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}>
            {/* Threat Assessment */}
            <div style={{
              padding: '12px 14px',
              borderBottom: '1px solid #2a2a4a',
            }}>
            <div style={{ 
              color: '#ff4444', 
              fontSize: '12px', 
              fontWeight: 'bold', 
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              ⚠️ THREAT ASSESSMENT
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '6px',
              fontSize: '11px'
            }}>
              <div style={{ 
                background: 'rgba(255, 68, 68, 0.1)', 
                border: '1px solid rgba(255, 68, 68, 0.3)',
                padding: '8px', 
                borderRadius: '4px' 
              }}>
                <div style={{ color: '#aaa', marginBottom: '2px' }}>SAM Coverage</div>
                <div style={{ color: '#ff4444', fontWeight: 'bold', fontSize: '12px' }}>HIGH (S-400)</div>
              </div>
              <div style={{ 
                background: 'rgba(255, 170, 0, 0.1)', 
                border: '1px solid rgba(255, 170, 0, 0.3)',
                padding: '8px', 
                borderRadius: '4px' 
              }}>
                <div style={{ color: '#aaa', marginBottom: '2px' }}>Air Defense</div>
                <div style={{ color: '#ffaa00', fontWeight: 'bold', fontSize: '12px' }}>MODERATE</div>
              </div>
              <div style={{ 
                background: 'rgba(0, 255, 0, 0.1)', 
                border: '1px solid rgba(0, 255, 0, 0.3)',
                padding: '8px', 
                borderRadius: '4px' 
              }}>
                <div style={{ color: '#aaa', marginBottom: '2px' }}>EW Activity</div>
                <div style={{ color: '#00ff00', fontWeight: 'bold', fontSize: '12px' }}>LOW</div>
              </div>
              <div style={{ 
                background: 'rgba(255, 68, 68, 0.1)', 
                border: '1px solid rgba(255, 68, 68, 0.3)',
                padding: '8px', 
                borderRadius: '4px' 
              }}>
                <div style={{ color: '#aaa', marginBottom: '2px' }}>IADS Status</div>
                <div style={{ color: '#ff4444', fontWeight: 'bold', fontSize: '12px' }}>ACTIVE</div>
              </div>
            </div>
          </div>

          {/* Target Details */}
          <div style={{
            padding: '12px 14px',
            borderBottom: '1px solid #2a2a4a',
          }}>
            <div style={{ 
              color: '#aaa', 
              fontSize: '12px', 
              fontWeight: 'bold', 
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              🎯 TARGET PARAMETERS
            </div>
            <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>BE Number:</span>
                <span style={{ color: '#00e5ff', fontFamily: 'monospace', fontSize: '12px' }}>BE-7742-NK-0093</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Cat Code:</span>
                <span style={{ color: '#fff' }}>21140 - C2 FACILITY</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Collateral:</span>
                <span style={{ color: '#ffaa00', fontWeight: 'bold' }}>CDE LVL 3</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>NSL Auth:</span>
                <span style={{ color: '#00ff00', fontWeight: 'bold' }}>PRE-APPROVED</span>
              </div>
            </div>
          </div>

          {/* Weapon-Target Pairing */}
          <div style={{
            padding: '12px 14px',
            borderBottom: '1px solid #2a2a4a',
          }}>
            <div style={{ 
              color: '#aaa', 
              fontSize: '12px', 
              fontWeight: 'bold', 
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>💣 WEAPONEERING</span>
              <span style={{ color: '#00e5ff', fontSize: '10px' }}>AUTO-CALC</span>
            </div>
            <div style={{ 
              background: '#1a1a2e', 
              borderRadius: '4px', 
              padding: '10px',
              fontSize: '11px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#888' }}>Recommended:</span>
                <span style={{ color: '#00e5ff', fontWeight: 'bold' }}>GBU-31 JDAM (2x)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#888' }}>Alt Option:</span>
                <span style={{ color: '#aaa' }}>BGM-109 TLAM (1x)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#888' }}>Pk (Single):</span>
                <span style={{ color: '#00ff00', fontWeight: 'bold', fontSize: '12px' }}>0.87</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Pk (Salvo):</span>
                <span style={{ color: '#00ff00', fontWeight: 'bold', fontSize: '12px' }}>0.98</span>
              </div>
              <div style={{ 
                marginTop: '8px', 
                paddingTop: '8px', 
                borderTop: '1px solid #2a2a4a',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span style={{ color: '#888' }}>CEP:</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>3.2m</span>
              </div>
            </div>
          </div>

          {/* Tasking Form - Compact */}
          <div style={{
            padding: '12px 14px',
            borderBottom: '1px solid #2a2a4a',
          }}>
            <div style={{ 
              color: '#00e5ff', 
              fontSize: '12px', 
              fontWeight: 'bold', 
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              📋 TASKING ORDER
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
              <div>
                <div style={{ color: '#888', fontSize: '10px', marginBottom: '4px' }}>TASK TYPE</div>
                <select style={{
                  width: '100%',
                  padding: '6px 8px',
                  background: '#1a1a2e',
                  border: '1px solid #2a2a4a',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '12px',
                }}>
                  <option>SMACK</option>
                  <option>STRIKE</option>
                  <option>SEAD</option>
                  <option>CAS</option>
                </select>
              </div>
              <div>
                <div style={{ color: '#888', fontSize: '10px', marginBottom: '4px' }}>PRIORITY</div>
                <select style={{
                  width: '100%',
                  padding: '6px 8px',
                  background: '#1a1a2e',
                  border: '1px solid #2a2a4a',
                  borderRadius: '4px',
                  color: '#ff4444',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}>
                  <option>CRITICAL</option>
                  <option>HIGH</option>
                  <option>MEDIUM</option>
                  <option>LOW</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
              <div>
                <div style={{ color: '#888', fontSize: '10px', marginBottom: '4px' }}>TOT (Zulu)</div>
                <input
                  type="text"
                  value="18:55:00Z"
                  readOnly
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    background: '#1a1a2e',
                    border: '1px solid #2a2a4a',
                    borderRadius: '4px',
                    color: '#00e5ff',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
              <div>
                <div style={{ color: '#888', fontSize: '10px', marginBottom: '4px' }}>NLT</div>
                <input
                  type="text"
                  value="19:30:00Z"
                  readOnly
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    background: '#1a1a2e',
                    border: '1px solid #2a2a4a',
                    borderRadius: '4px',
                    color: '#ffaa00',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <div style={{ color: '#888', fontSize: '10px', marginBottom: '4px' }}>INGRESS ROUTE</div>
              <div style={{ 
                background: '#1a1a2e', 
                padding: '8px 10px', 
                borderRadius: '4px',
                fontSize: '11px',
                color: '#888',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ color: '#00e5ff', fontWeight: 'bold' }}>IP-ALPHA</span>
                <span>→</span>
                <span style={{ color: '#ffaa00', fontWeight: 'bold' }}>WP-1</span>
                <span>→</span>
                <span style={{ color: '#ff4444', fontWeight: 'bold' }}>TGT</span>
                <span>→</span>
                <span style={{ color: '#00ff00', fontWeight: 'bold' }}>EGRESS-S</span>
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <div style={{ color: '#888', fontSize: '10px', marginBottom: '4px' }}>GUIDANCE / ROE</div>
              <textarea
                value={taskGuidance}
                onChange={(e) => setTaskGuidance(e.target.value)}
                placeholder="Mission guidance, ROE restrictions..."
                style={{
                  width: '100%',
                  height: '55px',
                  padding: '8px',
                  background: '#1a1a2e',
                  border: '1px solid #2a2a4a',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '11px',
                  resize: 'none',
                }}
              />
            </div>

            {/* Coordination Checklist */}
            <div style={{ 
              background: 'rgba(0, 229, 255, 0.05)', 
              border: '1px solid rgba(0, 229, 255, 0.2)',
              borderRadius: '4px',
              padding: '8px 10px',
              fontSize: '11px'
            }}>
              <div style={{ color: '#00e5ff', marginBottom: '6px', fontWeight: 'bold', fontSize: '11px' }}>COORD CHECKLIST</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: '#00ff00', width: '14px', height: '14px' }} />
                  <span>JFACC Approved</span>
                  <span style={{ marginLeft: 'auto', color: '#00ff00', fontWeight: 'bold' }}>✓</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: '#00ff00', width: '14px', height: '14px' }} />
                  <span>Airspace Deconflict</span>
                  <span style={{ marginLeft: 'auto', color: '#00ff00', fontWeight: 'bold' }}>✓</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa' }}>
                  <input type="checkbox" style={{ accentColor: '#00ff00', width: '14px', height: '14px' }} />
                  <span>SEAD Scheduled</span>
                  <span style={{ marginLeft: 'auto', color: '#ffaa00' }}>⏳</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa' }}>
                  <input type="checkbox" style={{ accentColor: '#00ff00', width: '14px', height: '14px' }} />
                  <span>BDA Assets Tasked</span>
                  <span style={{ marginLeft: 'auto', color: '#666' }}>-</span>
                </label>
              </div>
            </div>
          </div>
          </div>

          {/* Submit Button - Fixed at bottom */}
          <div style={{ padding: '12px 14px', background: '#111120', flexShrink: 0 }}>
            <button style={{
              width: '100%',
              padding: '12px',
              background: selectedAsset 
                ? 'linear-gradient(180deg, #00e5ff 0%, #0099aa 100%)' 
                : 'linear-gradient(180deg, #444 0%, #333 100%)',
              border: 'none',
              borderRadius: '4px',
              color: selectedAsset ? '#000' : '#666',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: selectedAsset ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}>
              <GiMissileSwarm /> SUBMIT TASKING ({selectedAsset ? '1' : '0'})
            </button>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginTop: '8px',
              fontSize: '10px',
              color: '#888'
            }}>
              <span>Classification: SECRET//NOFORN</span>
              <span>REL TO: USA, FVEY</span>
            </div>
          </div>
        </div>
        {/* End of Right Sidebar */}
      </div>
      {/* End of Main Content Area */}

      {/* Animation Keyframes */}
      <style>
        {`
          @keyframes pulse-ring {
            0%, 100% { box-shadow: 0 0 60px rgba(255, 0, 100, 0.3), inset 0 0 60px rgba(255, 0, 100, 0.1); }
            50% { box-shadow: 0 0 100px rgba(255, 0, 100, 0.5), inset 0 0 80px rgba(255, 0, 100, 0.2); }
          }
          @keyframes pulse-text {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
        `}
      </style>
    </div>
  );
};

export default IntelWorkspace;
