import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  filled?: boolean; // 🆕 Para like activo/inactivo
}

export const HeartIcon: React.FC<IconProps> = ({ 
  size = 20, 
  color = 'currentColor',
  className = '',
  filled = false
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? color : 'none'}
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{
      transition: 'all 0.2s ease-in-out',
    }}
  >
    {filled ? (
      // Corazón relleno
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    ) : (
      // Corazón vacío
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    )}
  </svg>
);