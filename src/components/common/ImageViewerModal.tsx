import React from 'react';
import { ImageModalState } from '../../types';
import { COLORS } from '../../utils/constants';

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

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        cursor: 'pointer'
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
          width: '40px',
          height: '40px',
          fontSize: '20px',
          cursor: 'pointer',
          zIndex: 1001
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
            width: '50px',
            height: '50px',
            fontSize: '24px',
            cursor: 'pointer',
            zIndex: 1001
          }}
        >
          ‹
        </button>
      )}

      {/* Imagen principal */}
      <div style={{
        maxWidth: '90%',
        maxHeight: '90%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img 
          src={currentImage} 
          alt={`Imagen ${imageModal.currentIndex + 1}`}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: '8px'
          }}
          onClick={(e) => e.stopPropagation()}
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
            width: '50px',
            height: '50px',
            fontSize: '24px',
            cursor: 'pointer',
            zIndex: 1001
          }}
        >
          ›
        </button>
      )}

      {/* Indicador de imágenes (puntos) */}
      {imageModal.images.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '8px',
          zIndex: 1001
        }}>
          {imageModal.images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setImageModal(prev => ({ ...prev, currentIndex: index }));
              }}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: index === imageModal.currentIndex ? COLORS.white : 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer'
              }}
            />
          ))}
        </div>
      )}

      {/* Contador de imágenes */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: COLORS.white,
        fontSize: '16px',
        fontWeight: '600'
      }}>
        {imageModal.currentIndex + 1} / {imageModal.images.length}
      </div>
    </div>
  );
};