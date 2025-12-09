import React from 'react';

interface LogoProps {
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ size = 80 }) => {
  return (
    <img 
      src="/images/logos/logo.png" 
      alt="EMPREXA Logo"
      style={{
        width: size,
        height: size,
        display: 'block'
      }}
    />
  );
};