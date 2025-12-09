import React from 'react';
import { COLORS } from '../../utils/constants';
import { ImageModalState } from '../../types';

interface ImageViewerModalProps {
  imageModal: ImageModalState;
  setImageModal: React.Dispatch<React.SetStateAction<ImageModalState>>;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ 
  imageModal, 
  setImageModal 
}) => {
  if (!imageModal.isOpen) return null;

  const currentImage = imageModal.images[imageModal.currentIndex];

  const goToNext = () => {
    setImageModal(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length
    }));
  };

  const goToPrev = () => {
    setImageModal(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length
    }));
  };

  const closeModal = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setImageModal({ isOpen: false, images: [], currentIndex: 0 });
    }
  };

  // Manejar teclado
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!imageModal.isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          setImageModal({ isOpen: false, images: [], currentIndex: 0 });
          break;
        case 'ArrowLeft':
          goToPrev();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [imageModal.isOpen]);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        cursor: 'pointer',
        padding: '20px'
      }}
      onClick={closeModal}
    >
      {/* Botón cerrar */}
      <button
        onClick={() => setImageModal({ isOpen: false, images: [], currentIndex: 0 })}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          fontSize: '24px',
          cursor: 'pointer',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(10px)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        ×
      </button>

      {/* Botón anterior */}
      {imageModal.images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToPrev();
          }}
          style={{
            position: 'absolute',
            left: '20px',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            fontSize: '28px',
            cursor: 'pointer',
            zIndex: 1001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(10px)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ‹
        </button>
      )}

      {/* Contenedor principal de imagen con límites responsivos */}
      <div style={{
        maxWidth: '90vw', // Máximo 90% del ancho de viewport
        maxHeight: '90vh', // Máximo 90% del alto de viewport
        width: 'auto',
        height: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <img 
          src={currentImage} 
          alt={`Imagen ${imageModal.currentIndex + 1}`}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain', // Mantiene relación de aspecto
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            background: '#f5f5f5' // Fondo para imágenes con transparencia
          }}
          onClick={(e) => e.stopPropagation()}
          onError={(e) => {
            // Fallback si la imagen no carga
            console.error('Error cargando imagen:', currentImage);
            e.currentTarget.alt = 'Imagen no disponible';
          }}
        />
      </div>

      {/* Botón siguiente */}
      {imageModal.images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          style={{
            position: 'absolute',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            fontSize: '28px',
            cursor: 'pointer',
            zIndex: 1001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(10px)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ›
        </button>
      )}

      {/* Indicador de imágenes (puntos) - Solo mostrar si hay más de 1 imagen */}
      {imageModal.images.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '12px',
          zIndex: 1001,
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.5)',
          padding: '10px 20px',
          borderRadius: '25px',
          backdropFilter: 'blur(10px)'
        }}>
          {imageModal.images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setImageModal(prev => ({ ...prev, currentIndex: index }));
              }}
              style={{
                width: index === imageModal.currentIndex ? '14px' : '10px',
                height: index === imageModal.currentIndex ? '14px' : '10px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: index === imageModal.currentIndex ? COLORS.white : 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: index === imageModal.currentIndex ? 'scale(1.2)' : 'scale(1)'
              }}
            />
          ))}
        </div>
      )}

      {/* Contador de imágenes */}
      <div style={{
        position: 'absolute',
        top: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: COLORS.white,
        fontSize: '16px',
        fontWeight: '600',
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '8px 16px',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)'
      }}>
        {imageModal.currentIndex + 1} / {imageModal.images.length}
      </div>

      {/* Indicadores de navegación con teclado */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        right: '30px',
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '12px',
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '8px 12px',
        borderRadius: '8px',
        backdropFilter: 'blur(10px)'
      }}>
        ← → para navegar • ESC para salir
      </div>
    </div>
  );
};

export default ImageViewerModal;