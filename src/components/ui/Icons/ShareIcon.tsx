import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const ShareIcon: React.FC<IconProps> = ({ 
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
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
    <polyline points="16 6 12 2 8 6"/>
    <line x1="12" y1="2" x2="12" y2="15"/>
  </svg>
);