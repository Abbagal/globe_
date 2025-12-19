import React, { useState } from 'react';
import { FaChevronRight, FaChevronLeft, FaAnchor, FaShieldAlt, FaShip, FaSearchPlus, FaFighterJet, FaWater } from 'react-icons/fa';
import OrmaraGalleryModal from './OrmaraGalleryModal';

interface OrmaraSidebarProps {
    isVisible: boolean;
    onClose: () => void;
    onViewKeyOfficials: () => void;
    onZoomTarget: (lon: number, lat: number, height: number) => void;
}

const OrmaraSidebar: React.FC<OrmaraSidebarProps> = ({ isVisible, onClose, onViewKeyOfficials, onZoomTarget }) => {
    const [galleryLoading, setGalleryLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);
    const [showGalleryModal, setShowGalleryModal] = useState(false);

    const handleSourceClick = async () => {
        setGalleryLoading(true);

        const osintMessages = [
            'ACCESSING NAVAL INTELLIGENCE BASE...',
            'RETRIEVING SATELLITE IMAGERY (SECTOR 7)...',
            'DECRYPTING PORT TRAFFIC DATA...',
            'VERIFYING COASTAL SURVEILLANCE...',
            'LOADING VISUAL INTELLIGENCE...'
        ];

        for (let i = 0; i < osintMessages.length; i++) {
            setLoadingText(osintMessages[i]);
            await new Promise(resolve => setTimeout(resolve, 600));
        }

        setGalleryLoading(false);
        setLoadingText('');
        setShowGalleryModal(true);
    };

    if (!isVisible) return null;

    return (
        <>
            {/* Expand Button - Only visible when minimized */}
            <button
                onClick={() => setIsMinimized(false)}
                title="Expand Ormara Sidebar"
                style={{
                    position: "absolute",
                    right: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(0, 0, 0, 0.9)",
                    border: "1px solid #00ffaa",
                    borderRight: "none",
                    borderRadius: "4px 0 0 4px",
                    color: "#00ffaa",
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
                    e.currentTarget.style.background = "rgba(0, 255, 170, 0.2)";
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
                    border: "1px solid #00ffaa",
                    borderRight: "none",
                    borderRadius: "4px 0 0 4px",
                    color: "#00ffaa",
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
                    e.currentTarget.style.background = "rgba(0, 255, 170, 0.2)";
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
                    background: "rgba(0, 5, 10, 0.95)",
                    color: "white",
                    padding: "20px",
                    boxSizing: "border-box",
                    zIndex: 500,
                    fontFamily: "monospace",
                    overflow: "auto",
                    transition: "right 0.4s ease-in-out",
                    borderLeft: "2px solid #00ffaa",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                        borderBottom: "1px solid #00ffaa33",
                        paddingBottom: "15px",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <FaAnchor style={{ color: "#00ffaa", fontSize: "20px" }} />
                        <h2
                            style={{
                                color: "#00ffaa",
                                fontSize: "18px",
                                margin: 0,
                                letterSpacing: "2px",
                                textTransform: "uppercase",
                            }}
                        >
                            ORMARA INTELLIGENCE
                        </h2>
                    </div>
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
                            background: "#00ffaa",
                            animation: "pulse 1.5s ease-in-out infinite alternate",
                        }}
                    ></div>
                    <span style={{ fontSize: "12px", color: "#00ffaa" }}>SECURE LINK ACTIVE</span>
                </div>

                {/* Target Region Section */}
                <div style={{ marginBottom: "25px" }}>
                    <div
                        style={{
                            color: "#00ffaa",
                            fontSize: "12px",
                            marginBottom: "8px",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                        }}
                    >
                        🎯 TARGET SECTOR
                    </div>
                    <div
                        style={{
                            background: "rgba(0, 255, 170, 0.1)",
                            padding: "12px",
                            borderRadius: "4px",
                            fontSize: "15px",
                            lineHeight: "1.4",
                            fontWeight: "bold"
                        }}
                    >
                        Strategic Naval Sector including Jinnah Naval Base and Ormara Coastline.
                        Primary hub for maritime overwatch.
                    </div>
                </div>

                {/* Satellite Feed (Mirrored from CPEC) */}
                <div style={{ marginBottom: "25px" }}>
                    <div
                        onClick={handleSourceClick}
                        style={{
                            width: "100%",
                            height: "120px",
                            background: "linear-gradient(45deg, #001122, #002233)",
                            borderRadius: "4px",
                            position: "relative",
                            overflow: "hidden",
                            cursor: "pointer",
                            border: "1px solid transparent",
                            transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.border = "1px solid #00ffaa";
                            e.currentTarget.style.background = "linear-gradient(45deg, #001133, #003344)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.border = "1px solid transparent";
                            e.currentTarget.style.background = "linear-gradient(45deg, #001122, #002233)";
                        }}
                    >
                        <div
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                fontSize: "24px",
                                color: "#00ffaa",
                                opacity: 0.7,
                            }}
                        >
                            📷
                        </div>

                        <div
                            style={{
                                position: "absolute",
                                top: "8px",
                                right: "8px",
                                fontSize: "10px",
                                color: "#00ffaa",
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
                                color: "#00ffaa",
                            }}
                        >
                            SOURCE: NAVAL SURVEILLANCE FEED - ORMARA
                        </div>
                    </div>
                </div>

                {/* Tactical Navigation (Zoom Controls) */}
                <div style={{ marginBottom: "25px" }}>
                    <div
                        style={{
                            color: "#00ffaa",
                            fontSize: "12px",
                            marginBottom: "12px",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}
                    >
                        <FaSearchPlus /> TACTICAL NAVIGATION
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
                        {[
                            { label: "JINNAH NAVAL BASE (PORT)", lon: 64.683, lat: 25.185, height: 3500, icon: <FaShip /> },
                            { label: "ORMARA AIRSTRIP", lon: 64.646, lat: 25.215, height: 2500, icon: <FaFighterJet /> },
                            { label: "COASTAL DEFENSE GRID", lon: 64.674, lat: 25.201, height: 15000, icon: <FaShieldAlt /> },
                            { label: "DEEP SEA OVERWATCH", lon: 64.700, lat: 25.100, height: 80000, icon: <FaWater /> },
                        ].map((target, i) => (
                            <div
                                key={i}
                                onClick={() => onZoomTarget(target.lon, target.lat, target.height)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    padding: "10px 15px",
                                    background: "rgba(0, 255, 170, 0.05)",
                                    border: "1px solid rgba(0, 255, 170, 0.2)",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    fontSize: "11px",
                                    color: "#e0e0e0"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "rgba(0, 255, 170, 0.15)";
                                    e.currentTarget.style.borderColor = "#00ffaa";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "rgba(0, 255, 170, 0.05)";
                                    e.currentTarget.style.borderColor = "rgba(0, 255, 170, 0.2)";
                                }}
                            >
                                <span style={{ color: "#00ffaa" }}>{target.icon}</span>
                                <span style={{ fontWeight: "bold", letterSpacing: "1px" }}>{target.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <button
                    onClick={onViewKeyOfficials}
                    style={{
                        width: "100%",
                        background: "rgba(0, 255, 170, 0.2)",
                        border: "1px solid #00ffaa",
                        color: "#00ffaa",
                        padding: "12px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        cursor: "pointer",
                        marginBottom: "15px",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                    }}
                >
                    👥 VIEW COMMAND STRUCTURE
                </button>

                <button
                    style={{
                        width: "100%",
                        background: "#00ffaa",
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
                            Base Capacity
                        </div>
                        <div
                            style={{
                                color: "#00ffaa",
                                fontSize: "18px",
                                fontWeight: "bold",
                            }}
                        >
                            DEEP SEA
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
                            Coastline
                        </div>
                        <div
                            style={{
                                color: "#00ffaa",
                                fontSize: "18px",
                                fontWeight: "bold",
                            }}
                        >
                            120 KM
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
                            Defense
                        </div>
                        <div
                            style={{
                                color: "#00ff00",
                                fontSize: "18px",
                                fontWeight: "bold",
                            }}
                        >
                            FORTIFIED
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
                            Readiness
                        </div>
                        <div
                            style={{
                                color: "#00ff00",
                                fontSize: "18px",
                                fontWeight: "bold",
                            }}
                        >
                            OPTIMAL
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
                    <div>JINNAH.V.3.1.2</div>
                    <div>⚡ SECURE NAVAL CONNECTION</div>
                </div>

                {/* CSS animation */}
                <style>
                    {`
            @keyframes pulse {
              from { opacity: 1; }
              to { opacity: 0.3; }
            }
          `}
                </style>

                {/* Gallery Loading Overlay (Mirrored from CPEC) */}
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
                                color: "#00ffaa",
                                fontSize: "24px",
                                marginBottom: "30px",
                                letterSpacing: "3px",
                                textTransform: "uppercase",
                            }}
                        >
                            ORMARA VISUAL INTELLIGENCE
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
                                background: "rgba(0, 255, 170, 0.3)",
                                borderRadius: "1px",
                                overflow: "hidden",
                                position: "relative",
                            }}
                        >
                            <div
                                style={{
                                    width: "100px",
                                    height: "100%",
                                    background: "linear-gradient(90deg, transparent, #00ffaa, transparent)",
                                    animation: "loading 2s linear infinite",
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            <OrmaraGalleryModal
                isVisible={showGalleryModal}
                onClose={() => setShowGalleryModal(false)}
            />
        </>
    );
};

export default OrmaraSidebar;
