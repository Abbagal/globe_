import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// Vite-compatible worker import as recommended
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface OrmaraGalleryModalProps {
    isVisible: boolean;
    onClose: () => void;
}

const OrmaraGalleryModal: React.FC<OrmaraGalleryModalProps> = ({ isVisible, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [zoomed, setZoomed] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);
    const [offset, setOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const [isPdfReady, setIsPdfReady] = useState(false);
    const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [validPages, setValidPages] = useState<number[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const renderTaskRef = useRef<any>(null);

    // Load PDF and filter blank pages
    useEffect(() => {
        const loadPdf = async () => {
            try {
                console.log("Loading PDF: /ormara-base-overview.pdf");
                setIsPdfReady(false);
                const loadingTask = pdfjsLib.getDocument('/ormara-base-overview.pdf');
                const pdf = await loadingTask.promise;
                console.log("PDF loaded, total pages:", pdf.numPages);
                setPdfDoc(pdf);

                const pages = [];
                // User stated ~40 pages contain content
                for (let i = 1; i <= Math.min(pdf.numPages, 46); i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();

                    // Heuristic: If there is text or the page has annotations/operators, it's not blank
                    // For simplicity, we check if there's any text or if it's one of the first 40 pages
                    // as requested by user ("~40 pages contain actual content")
                    if (textContent.items.length > 0 || i <= 40) {
                        pages.push(i);
                    }
                }
                console.log("Filtered active pages:", pages.length);
                setValidPages(pages);
                setIsPdfReady(true);
            } catch (error) {
                console.error('Error loading PDF:', error);
            }
        };

        if (isVisible) {
            loadPdf();
        } else {
            // Reset state when closed
            setPdfDoc(null);
            setValidPages([]);
            setCurrentIndex(0);
            setIsPdfReady(false);
        }
    }, [isVisible]);

    // Render the current page
    useEffect(() => {
        const renderPage = async () => {
            if (!pdfDoc || validPages.length === 0 || !canvasRef.current || !isPdfReady) return;

            try {
                // Cancel previous render task if any
                if (renderTaskRef.current) {
                    renderTaskRef.current.cancel();
                }

                const pageNumber = validPages[currentIndex];
                console.log("Rendering PDF page", pageNumber);
                const page = await pdfDoc.getPage(pageNumber);

                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');
                if (!context) return;

                // Calculate scale to fit the container
                const viewport = page.getViewport({ scale: 2.0 }); // Even higher res for clarity
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                console.log("Canvas dimensions configured:", canvas.width, "x", canvas.height);

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                    canvas: canvas,
                };

                const renderTask = page.render(renderContext);
                renderTaskRef.current = renderTask;
                await renderTask.promise;
                console.log("PDF page rendered", pageNumber);
            } catch (error: any) {
                if (error.name !== 'RenderingCancelledException') {
                    console.error('Error rendering page:', error);
                }
            }
        };

        renderPage();
    }, [currentIndex, pdfDoc, validPages, isVisible, isPdfReady]);

    const nextItem = () => {
        if (!isPdfReady) return;
        setCurrentIndex((prev) => (prev + 1) % (validPages.length || 1));
    };

    const prevItem = () => {
        if (!isPdfReady) return;
        setCurrentIndex((prev) => (prev - 1 + (validPages.length || 1)) % (validPages.length || 1));
    };

    const goToItem = (index: number) => {
        if (!isPdfReady) return;
        setCurrentIndex(index);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!zoomed || !isPdfReady) return;
        setDragging(true);
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };
    const handleMouseUp = () => {
        setDragging(false);
    };
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!dragging || !zoomed || !dragStart || !isPdfReady) return;
        setOffset({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    };
    const handleMouseLeave = () => {
        setDragging(false);
    };

    useEffect(() => {
        if (!zoomed) setOffset({ x: 0, y: 0 });
    }, [zoomed, currentIndex]);

    if (!isVisible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0, 0, 0, 0.95)',
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
                    maxWidth: '1000px',
                    height: '80vh',
                    background: 'rgba(0, 0, 0, 0.9)',
                    border: '2px solid #00ffff',
                    borderRadius: '8px',
                    padding: '20px',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 0 50px rgba(0, 255, 255, 0.25)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Readiness Gate */}
                {!isPdfReady || validPages.length === 0 ? (
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#00ffff',
                        gap: '20px'
                    }}>
                        <div style={{ fontSize: '24px', animation: 'pulse 1s infinite alternate', letterSpacing: '4px' }}>
                            DECRYPTING FILES...
                        </div>
                        <div style={{ fontSize: '10px', opacity: 0.5, letterSpacing: '2px' }}>
                            ACCESSING CLASSIFIED NAVAL RECORDS // SECTOR 7
                        </div>
                        <div style={{
                            width: '200px',
                            height: '2px',
                            background: 'rgba(0, 255, 255, 0.1)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                height: '100%',
                                width: '50%',
                                background: '#00ffff',
                                animation: 'loading-bar 1.5s infinite linear'
                            }} />
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header - CPEC STYLE */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '20px',
                                borderBottom: '1px solid #333',
                                paddingBottom: '15px',
                            }}
                        >
                            <h2
                                style={{
                                    color: '#00ffff',
                                    fontSize: '20px',
                                    margin: 0,
                                    letterSpacing: '2px',
                                    textTransform: 'uppercase',
                                }}
                            >
                                ORMARA PROJECT GALLERY
                            </h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                    onClick={() => setZoomed(true)}
                                    style={{
                                        background: zoomed ? 'rgba(0,255,255,0.5)' : 'rgba(0,255,255,0.15)',
                                        border: '1px solid #00ffff',
                                        color: zoomed ? '#000' : '#00ffff',
                                        borderRadius: '4px',
                                        padding: '6px 10px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        fontFamily: 'monospace',
                                        transition: 'all 0.2s ease'
                                    }}
                                    title="Zoom In"
                                >
                                    ＋
                                </button>
                                <button
                                    onClick={() => setZoomed(false)}
                                    style={{
                                        background: !zoomed ? 'rgba(0,255,255,0.5)' : 'rgba(0,255,255,0.15)',
                                        border: '1px solid #00ffff',
                                        color: !zoomed ? '#000' : '#00ffff',
                                        borderRadius: '4px',
                                        padding: '6px 10px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        fontFamily: 'monospace',
                                        transition: 'all 0.2s ease'
                                    }}
                                    title="Zoom Out"
                                >
                                    －
                                </button>
                                <button
                                    onClick={onClose}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid #ff4444',
                                        color: '#ff4444',
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontFamily: 'monospace',
                                    }}
                                >
                                    ✕ CLOSE
                                </button>
                            </div>
                        </div>

                        {/* Display Area - CANVAS RENDERING */}
                        <div
                            style={{
                                flex: 1,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'relative',
                                marginBottom: '20px',
                                width: '100%',
                                height: '100%',
                                overflow: 'hidden',
                                cursor: zoomed ? (dragging ? 'grabbing' : 'grab') : 'default',
                                userSelect: 'none',
                                background: '#000',
                                borderRadius: '4px',
                                border: '1px solid #111'
                            }}
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div
                                style={{
                                    width: zoomed ? '180%' : '100%',
                                    height: zoomed ? '180%' : '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    transition: 'width 0.3s, height 0.3s',
                                    transform: zoomed ? `translate(${offset.x}px, ${offset.y}px)` : 'none',
                                }}
                            >
                                <canvas
                                    ref={canvasRef}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain',
                                        boxShadow: '0 0 40px rgba(0, 255, 255, 0.1)',
                                    }}
                                />
                            </div>

                            {/* Navigation Arrows */}
                            <button
                                onClick={prevItem}
                                style={{
                                    position: 'absolute',
                                    left: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'rgba(0, 255, 255, 0.1)',
                                    border: '1px solid rgba(0, 255, 255, 0.3)',
                                    color: '#00ffff',
                                    padding: '15px 20px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    fontFamily: 'monospace',
                                    zIndex: 10,
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)'; e.currentTarget.style.borderColor = '#00ffff'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)'; e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.3)'; }}
                            >
                                ‹
                            </button>

                            <button
                                onClick={nextItem}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'rgba(0, 255, 255, 0.1)',
                                    border: '1px solid rgba(0, 255, 255, 0.3)',
                                    color: '#00ffff',
                                    padding: '15px 20px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    fontFamily: 'monospace',
                                    zIndex: 10,
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)'; e.currentTarget.style.borderColor = '#00ffff'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)'; e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.3)'; }}
                            >
                                ›
                            </button>
                        </div>

                        {/* Info Box */}
                        <div
                            style={{
                                background: 'rgba(0, 255, 255, 0.05)',
                                padding: '15px',
                                borderRadius: '4px',
                                marginBottom: '15px',
                                borderLeft: '4px solid #00ffff'
                            }}
                        >
                            <div
                                style={{
                                    color: '#00ffff',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    marginBottom: '5px',
                                    letterSpacing: '1px'
                                }}
                            >
                                Jinnah Naval Base Intel - Page {validPages[currentIndex] || '?'}
                            </div>
                            <div
                                style={{
                                    color: '#888',
                                    fontSize: '12px',
                                    lineHeight: '1.4',
                                }}
                            >
                                Classified documentation: Aerial reconnaissance and base layout analysis. Page {currentIndex + 1} of {validPages.length}.
                            </div>
                        </div>

                        {/* Thumbnail Navigation (Dots) */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '8px',
                                flexWrap: 'wrap',
                                padding: '0 40px',
                                maxHeight: '60px',
                                overflowY: 'auto'
                            }}
                        >
                            {validPages.map((_, index) => (
                                <div
                                    key={index}
                                    onClick={() => goToItem(index)}
                                    style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        border: '1px solid #00ffff',
                                        background: index === currentIndex ? '#00ffff' : 'transparent',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                    }}
                                />
                            ))}
                        </div>

                        {/* Image Counter */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '60px',
                                right: '20px',
                                color: '#00ffff',
                                fontSize: '12px',
                                background: 'rgba(0, 0, 0, 0.8)',
                                border: '1px solid rgba(0, 255, 255, 0.3)',
                                padding: '5px 12px',
                                borderRadius: '4px',
                                zIndex: 10,
                                letterSpacing: '1px'
                            }}
                        >
                            {currentIndex + 1} / {validPages.length}
                        </div>
                    </>
                )}
            </div>
            <style>
                {`
          @keyframes pulse {
            from { opacity: 0.8; }
            to { opacity: 0.3; }
          }
          @keyframes loading-bar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}
            </style>
        </div>
    );
};

export default OrmaraGalleryModal;
