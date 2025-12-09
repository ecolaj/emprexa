import React, { useEffect } from 'react';
import { COLORS } from '../../utils/constants';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 4000
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return `rgba(46, 204, 113, 0.9)`; // Verde traslúcido
      case 'error':
        return `rgba(231, 76, 60, 0.9)`; // Rojo traslúcido
      case 'info':
        return `rgba(52, 152, 219, 0.9)`; // Azul traslúcido
      default:
        return `rgba(52, 152, 219, 0.9)`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return '💡';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: getBackgroundColor(),
        color: COLORS.white,
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(10px)',
        border: `1px solid rgba(255, 255, 255, 0.2)`,
        zIndex: 9999,
        maxWidth: '350px',
        animation: 'slideIn 0.3s ease-out',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontWeight: '500',
        fontSize: '14px'
      }}
    >
      <span style={{ fontSize: '16px' }}>
        {getIcon()}
      </span>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: COLORS.white,
          cursor: 'pointer',
          fontSize: '18px',
          marginLeft: 'auto',
          opacity: 0.8,
          padding: '0',
          minWidth: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.opacity = '0.8';
        }}
      >
        ×
      </button>
    </div>
  );
};

// Agregar estilos CSS para la animación
const styles = `
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
`;

// Injectar estilos
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default Toast;