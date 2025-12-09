import React from 'react';
import { DESIGN_SYSTEM } from '../../../utils/designSystem';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  type = 'button',
  className = ''
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DESIGN_SYSTEM.spacing[2],
    fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary,
    fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
    borderRadius: DESIGN_SYSTEM.borderRadius.medium,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease-in-out',
    transform: 'translateY(0)',
    opacity: disabled ? 0.6 : 1,
    outline: 'none',
    position: 'relative',
    overflow: 'hidden'
  };

  const sizeStyles = {
    sm: {
      padding: `${DESIGN_SYSTEM.spacing[2]} ${DESIGN_SYSTEM.spacing[3]}`,
      fontSize: DESIGN_SYSTEM.typography.fontSize.sm
    },
    md: {
      padding: `${DESIGN_SYSTEM.spacing[3]} ${DESIGN_SYSTEM.spacing[6]}`,
      fontSize: DESIGN_SYSTEM.typography.fontSize.sm
    },
    lg: {
      padding: `${DESIGN_SYSTEM.spacing[4]} ${DESIGN_SYSTEM.spacing[8]}`,
      fontSize: DESIGN_SYSTEM.typography.fontSize.base
    }
  };

  const variantStyles = {
    primary: {
      background: `linear-gradient(135deg, ${DESIGN_SYSTEM.colors.primary[500]}, ${DESIGN_SYSTEM.colors.primary[600]})`,
      color: DESIGN_SYSTEM.colors.white,
      boxShadow: DESIGN_SYSTEM.shadows.medium
    },
    secondary: {
      background: 'transparent',
      color: DESIGN_SYSTEM.colors.text.primary,
      border: `1px solid ${DESIGN_SYSTEM.colors.border.primary}`,
      boxShadow: DESIGN_SYSTEM.shadows.sm
    },
    ghost: {
      background: 'transparent',
      color: DESIGN_SYSTEM.colors.text.primary,
      border: 'none',
      boxShadow: 'none'
    },
    danger: {
      background: DESIGN_SYSTEM.colors.error[500],
      color: DESIGN_SYSTEM.colors.white,
      boxShadow: DESIGN_SYSTEM.shadows.medium
    }
  };

  const hoverStyles = {
    primary: {
      transform: 'translateY(-2px)',
      boxShadow: DESIGN_SYSTEM.shadows.large
    },
    secondary: {
      background: DESIGN_SYSTEM.colors.primary[50],
      color: DESIGN_SYSTEM.colors.primary[600],
      borderColor: DESIGN_SYSTEM.colors.primary[300]
    },
    ghost: {
      background: DESIGN_SYSTEM.colors.primary[50],
      color: DESIGN_SYSTEM.colors.primary[600]
    },
    danger: {
      transform: 'translateY(-2px)',
      boxShadow: DESIGN_SYSTEM.shadows.large
    }
  };

  const [isHovered, setIsHovered] = React.useState(false);

  const styles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...(isHovered && !disabled ? hoverStyles[variant] : {})
  };

  return (
    <button
      type={type}
      style={styles}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => !disabled && setIsHovered(false)}
      className={className}
    >
      {children}
    </button>
  );
};