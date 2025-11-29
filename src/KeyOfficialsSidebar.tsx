import React, { useState } from 'react';
import OfficialModal from './OfficialModal';

interface Official {
  name: string;
  title: string;
  role: string; 
  country: 'pakistan' | 'china';
  imageFileName: string;
}

interface KeyOfficialsSidebarProps {
  isVisible: boolean;
  onClose: () => void;
}

const KeyOfficialsSidebar: React.FC<KeyOfficialsSidebarProps> = ({ isVisible, onClose }) => {
  const [showPakistanOfficials, setShowPakistanOfficials] = useState(false);
  const [showChinaOfficials, setShowChinaOfficials] = useState(false);
  const [selectedOfficial, setSelectedOfficial] = useState<Official | null>(null);
  const [showModal, setShowModal] = useState(false);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
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
          KEY OFFICIALS
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

      {/* JCC Leadership Section */}
      <div style={{ marginBottom: '25px' }}>
        <div style={{
          color: '#00ffff',
          fontSize: '14px',
          marginBottom: '15px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontWeight: 'bold'
        }}>
          📋 Joint Cooperation Committee (JCC) Leadership
        </div>
        <div style={{
          fontSize: '11px',
          color: '#ccc',
          marginBottom: '20px',
          lineHeight: '1.4'
        }}>
          The JCC is the supreme decision-making body for CPEC.
        </div>

        {/* Pakistan Co-Chair */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            color: '#00ff00',
            fontSize: '12px',
            marginBottom: '8px',
            fontWeight: 'bold'
          }}>
            🇵🇰 Pakistan Co-Chair:
          </div>
          <div 
            onClick={() => {
              setSelectedOfficial({
                name: 'Prof. Ahsan Iqbal',
                title: 'Federal Minister for Planning, Development & Special Initiatives',
                role: 'The public face and operational lead for CPEC',
                country: 'pakistan',
                imageFileName: 'ahsan-iqbal.jpg'
              });
              setShowModal(true);
            }}
            style={{
              color: 'white',
              fontSize: '13px',
              marginBottom: '10px',
              fontWeight: 'bold',
              cursor: 'pointer',
              textDecoration: 'underline',
              textDecorationColor: '#00ff00'
            }}
          >
            Prof. Ahsan Iqbal
          </div>
          <div style={{
            color: '#aaa',
            fontSize: '11px',
            marginBottom: '10px'
          }}>
            Federal Minister for Planning, Development & Special Initiatives
          </div>
          
          <button
            onClick={() => setShowPakistanOfficials(!showPakistanOfficials)}
            style={{
              background: 'rgba(0, 255, 0, 0.2)',
              border: '1px solid #00ff00',
              color: '#00ff00',
              padding: '6px 12px',
              borderRadius: '3px',
              fontSize: '10px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {showPakistanOfficials ? '▼ Hide' : '▶ View More Officials'}
          </button>

          {/* Pakistan Officials List */}
          {showPakistanOfficials && (
            <div style={{
              marginTop: '15px',
              background: 'rgba(0, 255, 0, 0.05)',
              padding: '15px',
              borderRadius: '4px',
              border: '1px solid rgba(0, 255, 0, 0.2)'
            }}>
              {[
                {
                  name: 'Shehbaz Sharif',
                  title: 'Prime Minister',
                  role: 'Oversees the overall strategic direction of CPEC 2.0',
                  country: 'pakistan' as const,
                  imageFileName: 'shehbaz-sharif.jpg'
                },
                {
                  name: 'Prof. Ahsan Iqbal',
                  title: 'Federal Minister for Planning, Development & Special Initiatives',
                  role: 'The public face and operational lead for CPEC',
                  country: 'pakistan' as const,
                  imageFileName: 'ahsan-iqbal.jpg'
                },
                {
                  name: 'Awais Manzur Sumra',
                  title: 'Secretary, Ministry of Planning, Development & Special Initiatives',
                  role: '',
                  country: 'pakistan' as const,
                  imageFileName: 'awais-manzur-sumra.jpg'
                },
                {
                  name: 'Dr. M. Muzammil Zia',
                  title: 'Executive Director / Project Director, CPEC Secretariat',
                  role: 'Operational head handling day-to-day coordination',
                  country: 'pakistan' as const,
                  imageFileName: 'muzammil-zia.jpg'
                },
                {
                  name: 'Khalil Hashmi',
                  title: 'Ambassador of Pakistan to China',
                  role: 'Key liaison for diplomatic coordination in Beijing',
                  country: 'pakistan' as const,
                  imageFileName: 'khalil-hashmi.jpg'
                }
              ].map((official, index) => (
                <div key={index} style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: index < 4 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                  <div 
                    onClick={() => {
                      setSelectedOfficial(official);
                      setShowModal(true);
                    }}
                    style={{ 
                      color: 'white', 
                      fontSize: '11px', 
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      textDecorationColor: '#00ff00'
                    }}
                  >
                    {official.name}
                  </div>
                  <div style={{ color: '#aaa', fontSize: '10px', marginBottom: '4px' }}>
                    {official.title}
                  </div>
                  {official.role && (
                    <div style={{ color: '#888', fontSize: '9px', fontStyle: 'italic' }}>
                      {official.role}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* China Co-Chair */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            color: '#ffff00',
            fontSize: '12px',
            marginBottom: '8px',
            fontWeight: 'bold'
          }}>
            🇨🇳 China Co-Chair:
          </div>
          <div 
            onClick={() => {
              setSelectedOfficial({
                name: 'Zheng Shanjie',
                title: 'Chairman, National Development and Reform Commission (NDRC)',
                role: '',
                country: 'china',
                imageFileName: 'zheng-shanjie.jpg'
              });
              setShowModal(true);
            }}
            style={{
              color: 'white',
              fontSize: '13px',
              marginBottom: '10px',
              fontWeight: 'bold',
              cursor: 'pointer',
              textDecoration: 'underline',
              textDecorationColor: '#ffff00'
            }}
          >
            Zheng Shanjie
          </div>
          <div style={{
            color: '#aaa',
            fontSize: '11px',
            marginBottom: '10px'
          }}>
            Chairman, National Development and Reform Commission (NDRC)
          </div>
          
          <button
            onClick={() => setShowChinaOfficials(!showChinaOfficials)}
            style={{
              background: 'rgba(255, 255, 0, 0.2)',
              border: '1px solid #ffff00',
              color: '#ffff00',
              padding: '6px 12px',
              borderRadius: '3px',
              fontSize: '10px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {showChinaOfficials ? '▼ Hide' : '▶ View More Officials'}
          </button>

          {/* China Officials List */}
          {showChinaOfficials && (
            <div style={{
              marginTop: '15px',
              background: 'rgba(255, 255, 0, 0.05)',
              padding: '15px',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 0, 0.2)'
            }}>
              {[
                {
                  name: 'Li Qiang',
                  title: 'Premier of the State Council',
                  role: 'Oversees BRI and CPEC at the state level',
                  country: 'china' as const,
                  imageFileName: 'li-qiang.jpg'
                },
                {
                  name: 'Zheng Shanjie',
                  title: 'Chairman, National Development and Reform Commission (NDRC)',
                  role: '',
                  country: 'china' as const,
                  imageFileName: 'zheng-shanjie.jpg'
                },
                {
                  name: 'Zhou Haibing',
                  title: 'Vice-Chairman, NDRC',
                  role: 'Frequently meets Pakistani counterparts for specific project reviews',
                  country: 'china' as const,
                  imageFileName: 'zhou-haibing.jpg'
                },
                {
                  name: 'Sun Weidong',
                  title: 'Vice Foreign Minister',
                  role: 'Handles diplomatic aspects of CPEC',
                  country: 'china' as const,
                  imageFileName: 'sun-weidong.jpg'
                },
                {
                  name: 'Jiang Zaidong',
                  title: 'Ambassador of China to Pakistan',
                  role: '',
                  country: 'china' as const,
                  imageFileName: 'jiang-zaidong.jpg'
                }
              ].map((official, index) => (
                <div key={index} style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: index < 4 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                  <div 
                    onClick={() => {
                      setSelectedOfficial(official);
                      setShowModal(true);
                    }}
                    style={{ 
                      color: 'white', 
                      fontSize: '11px', 
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      textDecorationColor: '#ffff00'
                    }}
                  >
                    {official.name}
                  </div>
                  <div style={{ color: '#aaa', fontSize: '10px', marginBottom: '4px' }}>
                    {official.title}
                  </div>
                  {official.role && (
                    <div style={{ color: '#888', fontSize: '9px', fontStyle: 'italic' }}>
                      {official.role}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Official Modal */}
      <OfficialModal
        official={selectedOfficial}
        isVisible={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedOfficial(null);
        }}
      />
    </div>
  );
};

export default KeyOfficialsSidebar;
