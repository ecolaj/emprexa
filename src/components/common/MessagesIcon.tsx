import React, { useState } from 'react';
import { DESIGN_SYSTEM } from '../../utils/designSystem';

export const MessagesIcon: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Simulamos 2 mensajes no leídos
  const unreadCount = 2;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '20px',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        💬
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              backgroundColor: 'red',
              color: 'white',
              fontSize: '10px',
              padding: '2px 5px',
              borderRadius: '10px',
              fontWeight: 'bold'
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            backgroundColor: DESIGN_SYSTEM.colors.background.secondary,
            border: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
            borderRadius: '8px',
            boxShadow: DESIGN_SYSTEM.shadows.large,
            width: '250px',
            zIndex: 1001,
            padding: '12px',
            fontSize: '14px',
            color: DESIGN_SYSTEM.colors.text.secondary
          }}
        >
          <div
            style={{
              fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
              marginBottom: '8px',
              borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
              paddingBottom: '6px'
            }}
          >
            Mensajes
          </div>
          <div>
            Pronto podrás chatear con otros usuarios.
          </div>
        </div>
      )}
    </div>
  );
};