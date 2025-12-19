import React from 'react';

interface PdfViewerModalProps {
    isVisible: boolean;
    onClose: () => void;
    pdfPath: string;
    title: string;
}

const PdfViewerModal: React.FC<PdfViewerModalProps> = ({ isVisible, onClose, pdfPath, title }) => {
    if (!isVisible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0, 0, 0, 0.9)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10000,
                fontFamily: 'monospace',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: '90vw',
                    maxWidth: '1200px',
                    height: '90vh',
                    background: '#1a1a1a',
                    border: '2px solid #00ffaa',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 0 30px rgba(0, 255, 170, 0.2)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    style={{
                        padding: '15px 20px',
                        background: 'rgba(0, 255, 170, 0.1)',
                        borderBottom: '1px solid #00ffaa33',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#00ffaa', fontSize: '20px' }}>📄</span>
                        <h2
                            style={{
                                color: '#00ffaa',
                                fontSize: '18px',
                                margin: 0,
                                letterSpacing: '2px',
                                textTransform: 'uppercase',
                            }}
                        >
                            {title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: '1px solid #ff4444',
                            color: '#ff4444',
                            padding: '8px 15px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontFamily: 'monospace',
                            fontWeight: 'bold',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 68, 68, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        ✕ CLOSE
                    </button>
                </div>

                {/* PDF Content */}
                <div style={{ flex: 1, position: 'relative', background: '#333' }}>
                    <iframe
                        src={`${pdfPath}#toolbar=0&navpanes=0&scrollbar=0`}
                        title={title}
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                        }}
                    />

                    {/* Watermark/Security Overlay */}
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        padding: '5px 10px',
                        background: 'rgba(255, 0, 0, 0.2)',
                        border: '1px solid rgba(255, 0, 0, 0.5)',
                        color: '#ff4444',
                        fontSize: '10px',
                        borderRadius: '4px',
                        pointerEvents: 'none',
                        letterSpacing: '1px',
                        zIndex: 10,
                    }}>
                        CLASSIFIED DATA - AUTHORIZED ACCESS ONLY
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '10px 20px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    borderTop: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'center',
                    fontSize: '10px',
                    color: '#666',
                    letterSpacing: '1px',
                }}>
                    SECURE_DOCUMENT_VIEWER_PRO_V4.0 // ORMARA_SECTOR_INTEL
                </div>
            </div>
        </div>
    );
};

export default PdfViewerModal;
