import React, { useState, useEffect } from 'react';

interface PhotoGalleryModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({ isVisible, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  const [offset, setOffset] = useState<{x: number, y: number}>({x: 0, y: 0});

  // CPEC project images - you can add more images to the public/assets folder
  const images = [
    {
      src: "/assets/cpec-map.jpg",
      title: "CPEC Route Overview Map",
      description:
        "Complete China-Pakistan Economic Corridor route from Kashgar to Gwadar Port",
    },
    {
      src: "/assets/cpec2.jpg",
      title: "CPEC Route Overview Map",
      description:
        "Complete China-Pakistan Economic Corridor route from Kashgar to Gwadar Port",
    },
    {
      src: "/assets/cpec3.jpg",
      title: "CPEC Route Overview Map",
      description:
        "Complete China-Pakistan Economic Corridor route from Kashgar to Gwadar Port",
    },
    {
      src: "/assets/cpec4.jpg",
      title: "CPEC Route Overview Map",
      description:
        "Complete China-Pakistan Economic Corridor route from Kashgar to Gwadar Port",
    },
    {
      src: "/assets/cpec5.jpg",
      title: "CPEC Route Overview Map",
      description:
        "Complete China-Pakistan Economic Corridor route from Kashgar to Gwadar Port",
    },
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomed) return;
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const handleMouseUp = () => {
    setDragging(false);
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging || !zoomed || !dragStart) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };
  const handleMouseLeave = () => {
    setDragging(false);
  };
  useEffect(() => {
    if (!zoomed) setOffset({x: 0, y: 0});
  }, [zoomed, currentImageIndex]);

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
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
            CPEC PROJECT GALLERY
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setZoomed(true)}
              style={{
                background: 'rgba(0,255,255,0.15)',
                border: '1px solid #00ffff',
                color: '#00ffff',
                borderRadius: '4px',
                padding: '6px 10px',
                fontSize: '14px',
                cursor: 'pointer',
                fontFamily: 'monospace',
                opacity: zoomed ? 0.5 : 1,
              }}
              disabled={zoomed}
              title="Zoom In"
            >
              ＋
            </button>
            <button
              onClick={() => setZoomed(false)}
              style={{
                background: 'rgba(0,255,255,0.15)',
                border: '1px solid #00ffff',
                color: '#00ffff',
                borderRadius: '4px',
                padding: '6px 10px',
                fontSize: '14px',
                cursor: 'pointer',
                fontFamily: 'monospace',
                opacity: zoomed ? 1 : 0.5,
              }}
              disabled={!zoomed}
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

        {/* Image Display */}
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
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <img
            src={images[currentImageIndex].src}
            alt={images[currentImageIndex].title}
            style={{
              width: zoomed ? '180%' : '100%',
              height: zoomed ? '180%' : '100%',
              maxWidth: zoomed ? 'none' : '100%',
              maxHeight: zoomed ? 'none' : '100%',
              objectFit: 'contain',
              border: '1px solid #333',
              borderRadius: '4px',
              background: '#222',
              boxShadow: '0 0 24px #001133',
              display: 'block',
              transition: 'width 0.3s, height 0.3s',
              transform: zoomed ? `translate(${offset.x}px, ${offset.y}px)` : 'none',
              cursor: zoomed ? (dragging ? 'grabbing' : 'grab') : 'default',
            }}
            onDragStart={e => e.preventDefault()}
            onError={(e) => {
              // Fallback to a placeholder or default image
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling!.setAttribute('style', 'display: flex');
            }}
          />
          
          {/* Placeholder for missing images */}
          <div
            style={{
              display: 'none',
              width: '400px',
              height: '300px',
              background: 'linear-gradient(45deg, #001133, #003366)',
              border: '1px solid #00ffff',
              borderRadius: '4px',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              color: '#00ffff',
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>📷</div>
            <div>{images[currentImageIndex].title}</div>
            <div style={{ fontSize: '10px', color: '#666', marginTop: '10px' }}>
              IMAGE NOT AVAILABLE
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevImage}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0, 255, 255, 0.2)',
              border: '1px solid #00ffff',
              color: '#00ffff',
              padding: '15px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '18px',
              fontFamily: 'monospace',
            }}
          >
            ‹
          </button>
          
          <button
            onClick={nextImage}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0, 255, 255, 0.2)',
              border: '1px solid #00ffff',
              color: '#00ffff',
              padding: '15px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '18px',
              fontFamily: 'monospace',
            }}
          >
            ›
          </button>
        </div>

        {/* Image Info */}
        <div
          style={{
            background: 'rgba(0, 255, 255, 0.1)',
            padding: '15px',
            borderRadius: '4px',
            marginBottom: '15px',
          }}
        >
          <div
            style={{
              color: '#00ffff',
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '5px',
            }}
          >
            {images[currentImageIndex].title}
          </div>
          <div
            style={{
              color: '#ccc',
              fontSize: '12px',
              lineHeight: '1.4',
            }}
          >
            {images[currentImageIndex].description}
          </div>
        </div>

        {/* Thumbnail Navigation */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
          }}
        >
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: '1px solid #00ffff',
                background: index === currentImageIndex ? '#00ffff' : 'transparent',
                cursor: 'pointer',
                padding: 0,
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
            color: '#666',
            fontSize: '12px',
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '5px 10px',
            borderRadius: '4px',
          }}
        >
          {currentImageIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
};

export default PhotoGalleryModal;
