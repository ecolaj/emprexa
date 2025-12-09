import React from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { COLORS } from '../../utils/constants';
import { Button } from '../ui/Button/Button';

interface UpgradeButtonProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
  showIcon?: boolean;
  label?: string;
  className?: string;
}

export const UpgradeButton: React.FC<UpgradeButtonProps> = ({
  size = 'md',
  variant = 'primary',
  showIcon = true,
  label = 'Upgrade',
  className = ''
}) => {
  const { navigateToDashboard } = useNavigation(); // Temporal - luego cambiaremos a página de planes

  const { navigateToPricing } = useNavigation();

  const handleClick = () => {
    console.log('🔼 Redirigiendo a página de planes');
    navigateToPricing();
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={className}
      style={{
        background: variant === 'primary' 
          ? `linear-gradient(135deg, ${COLORS.success}, ${COLORS.primary})`
          : undefined,
        border: variant === 'secondary' 
          ? `1px solid ${COLORS.success}` 
          : undefined,
        color: variant === 'secondary' ? COLORS.success : undefined
      }}
    >
      {showIcon && (
        <span style={{ 
          marginRight: '6px',
          fontSize: size === 'sm' ? '14px' : '16px'
        }}>
          ⭐
        </span>
      )}
      {label}
    </Button>
  );
};