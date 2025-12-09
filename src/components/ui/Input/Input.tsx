import React from 'react';
import { DESIGN_SYSTEM } from '../../../utils/designSystem';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'textarea';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  rows?: number;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  value,
  onChange,
  placeholder = '',
  label = '',
  error = '',
  disabled = false,
  rows = 3,
  className = ''
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const containerStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: DESIGN_SYSTEM.spacing[2],
    width: '100%'
  };

  const labelStyles = {
    fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
    fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
    color: error ? DESIGN_SYSTEM.colors.error[500] : DESIGN_SYSTEM.colors.text.primary,
    fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary
  };

  const inputBaseStyles = {
    width: '100%',
    padding: `${DESIGN_SYSTEM.spacing[3]} ${DESIGN_SYSTEM.spacing[4]}`,
    fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary,
    fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
    borderRadius: DESIGN_SYSTEM.borderRadius.medium,
    border: `1px solid ${error ? DESIGN_SYSTEM.colors.error[300] : DESIGN_SYSTEM.colors.border.primary}`,
    backgroundColor: DESIGN_SYSTEM.colors.background.card,
    color: DESIGN_SYSTEM.colors.text.inverted,
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    resize: 'none' as const
  };

  const inputStates = {
    normal: {
      borderColor: error ? DESIGN_SYSTEM.colors.error[300] : DESIGN_SYSTEM.colors.border.primary,
      boxShadow: 'none'
    },
    focused: {
      borderColor: error ? DESIGN_SYSTEM.colors.error[500] : DESIGN_SYSTEM.colors.primary[500],
      boxShadow: `0 0 0 3px ${error ? DESIGN_SYSTEM.colors.error[100] : DESIGN_SYSTEM.colors.primary[100]}`
    },
    disabled: {
      backgroundColor: DESIGN_SYSTEM.colors.primary[50],
      borderColor: DESIGN_SYSTEM.colors.border.light,
      color: DESIGN_SYSTEM.colors.text.secondary,
      cursor: 'not-allowed'
    }
  };

  const getInputStyles = () => {
    if (disabled) return { ...inputBaseStyles, ...inputStates.disabled };
    if (isFocused) return { ...inputBaseStyles, ...inputStates.focused };
    return { ...inputBaseStyles, ...inputStates.normal };
  };

  const errorStyles = {
    fontSize: DESIGN_SYSTEM.typography.fontSize.xs,
    color: DESIGN_SYSTEM.colors.error[500],
    fontFamily: DESIGN_SYSTEM.typography.fontFamily.primary,
    marginTop: DESIGN_SYSTEM.spacing[1]
  };

  return (
    <div style={containerStyles} className={className}>
      {label && <label style={labelStyles}>{label}</label>}
      
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          style={getInputStyles()}
          onFocus={() => !disabled && setIsFocused(true)}
          onBlur={() => !disabled && setIsFocused(false)}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          style={getInputStyles()}
          onFocus={() => !disabled && setIsFocused(true)}
          onBlur={() => !disabled && setIsFocused(false)}
        />
      )}
      
      {error && <span style={errorStyles}>{error}</span>}
    </div>
  );
};