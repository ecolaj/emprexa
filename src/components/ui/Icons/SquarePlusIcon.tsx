import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const SquarePlusIcon: React.FC<IconProps> = ({ 
  size = 20, 
  color = 'currentColor',
  className = ''
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{
      transition: 'all 0.2s ease-in-out',
    }}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
    <line x1="12" y1="8" x2="12" y2="16"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);