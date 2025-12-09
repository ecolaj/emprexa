import React from 'react';
import { DESIGN_SYSTEM } from '../../../utils/designSystem';

interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'md',
  className = '',
  onClick
}) => {
  const baseStyles = {
    borderRadius: DESIGN_SYSTEM.borderRadius.lg,
    fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary,
    transition: 'all 0.3s ease-in-out',
    overflow: 'hidden',
    position: 'relative' as const
  };

  const variantStyles = {
    elevated: {
      backgroundColor: DESIGN_SYSTEM.colors.background.card,
      border: `1px solid ${DESIGN_SYSTEM.colors.border.light}`,
      boxShadow: DESIGN_SYSTEM.shadows.medium
    },
    outlined: {
      backgroundColor: DESIGN_SYSTEM.colors.background.card,
      border: `1px solid ${DESIGN_SYSTEM.colors.border.primary}`,
      boxShadow: 'none'
    },
    filled: {
      backgroundColor: DESIGN_SYSTEM.colors.primary[50],
      border: `1px solid ${DESIGN_SYSTEM.colors.primary[100]}`,
      boxShadow: 'none'
    }
  };

  const paddingStyles = {
    none: { padding: '0' },
    sm: { padding: DESIGN_SYSTEM.spacing[4] },
    md: { padding: DESIGN_SYSTEM.spacing[6] },
    lg: { padding: DESIGN_SYSTEM.spacing[8] }
  };

  const hoverStyles = {
    elevated: {
      transform: 'translateY(-4px)',
      boxShadow: DESIGN_SYSTEM.shadows.xl
    },
    outlined: {
      transform: 'translateY(-2px)',
      borderColor: DESIGN_SYSTEM.colors.primary[300],
      boxShadow: DESIGN_SYSTEM.shadows.medium
    },
    filled: {
      transform: 'translateY(-2px)',
      backgroundColor: DESIGN_SYSTEM.colors.primary[100]
    }
  };

  const [isHovered, setIsHovered] = React.useState(false);

  const styles = {
    ...baseStyles,
    ...variantStyles[variant],
    ...paddingStyles[padding],
    ...(isHovered && onClick ? hoverStyles[variant] : {}),
    cursor: onClick ? 'pointer' : 'default'
  };

  return (
    <div
      style={styles}
      className={className}
      onMouseEnter={() => onClick && setIsHovered(true)}
      onMouseLeave={() => onClick && setIsHovered(false)}
      onClick={onClick}
    >
      {children}
    </div>
  );
};