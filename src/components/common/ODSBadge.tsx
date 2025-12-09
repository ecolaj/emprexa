import React, { useState } from 'react';
import { COLORS } from '../../utils/constants';

interface ODSBadgeProps {
  ods: {
    id: number;
    numero: number;
    nombre: string;
    color_principal: string;
  };
  onClick?: (odsNumero: number) => void;
}

export const ODSBadge: React.FC<ODSBadgeProps> = ({ ods, onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <span
        onClick={() => onClick?.(ods.numero)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{
          cursor: 'pointer',
          padding: '4px 10px',
          borderRadius: '16px',
          backgroundColor: ods.color_principal,
          color: '#fff',
          fontSize: '12px',
          fontWeight: '600',
          transition: 'transform 0.2s',
          display: 'inline-block',
        }}
        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        ODS {ods.numero}
      </span>
      
      {/* Tooltip con el color del ODS */}
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: ods.color_principal, // ← Mismo color que el badge
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            marginBottom: '8px',
            pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          {ods.nombre}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: `6px solid ${ods.color_principal}`, // ← Mismo color para la flecha
            }}
          />
        </div>
      )}
    </div>
  );
};