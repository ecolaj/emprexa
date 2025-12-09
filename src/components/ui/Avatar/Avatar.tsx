import React from 'react';
import { DESIGN_SYSTEM } from '../../../utils/designSystem';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  username?: string;
  onClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'User avatar',
  size = 'md',
  username = 'U',
  onClick
}) => {
  const sizeStyles = {
    sm: {
      width: '32px',
      height: '32px',
      fontSize: DESIGN_SYSTEM.typography.fontSize.sm
    },
    md: {
      width: '48px',
      height: '48px',
      fontSize: DESIGN_SYSTEM.typography.fontSize.base
    },
    lg: {
      width: '64px',
      height: '64px',
      fontSize: DESIGN_SYSTEM.typography.fontSize.lg
    },
    xl: {
      width: '80px',
      height: '80px',
      fontSize: DESIGN_SYSTEM.typography.fontSize.xl
    }
  };

  const baseStyles = {
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
    color: DESIGN_SYSTEM.colors.white,
    background: `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.primary[500]}, ${DESIGN_SYSTEM.colors.primary[600]})`,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease-in-out',
    overflow: 'hidden',
    flexShrink: 0
  };

  const [isHovered, setIsHovered] = React.useState(false);

  const styles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...(isHovered && onClick ? { transform: 'scale(1.05)' } : {})
  };

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div
      style={styles}
      onMouseEnter={() => onClick && setIsHovered(true)}
      onMouseLeave={() => onClick && setIsHovered(false)}
      onClick={onClick}
    >
      {src ? (
        <img 
          src={src} 
          alt={alt}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover' 
          }}
        />
      ) : (
        getInitial(username)
      )}
    </div>
  );
};