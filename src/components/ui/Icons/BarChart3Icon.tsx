import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const BarChart3Icon: React.FC<IconProps> = ({ 
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
    <path d="M12 20V10"/>
    <path d="M18 20V4"/>
    <path d="M6 20v-4"/>
  </svg>
);