import React, { useState } from 'react';
import { Avatar } from '../ui/Avatar/Avatar';
import { DESIGN_SYSTEM } from '../../utils/designSystem';
import { useAvatarUrl } from '../../hooks/useAvatarUrl';

type ProfileIconProps = {
  currentUser: any;
  onOpenProfile: () => void;
  onLogout: () => void;
};

export const ProfileIcon: React.FC<ProfileIconProps> = ({
  currentUser,
  onOpenProfile,
  onLogout
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const realAvatarUrl = useAvatarUrl(currentUser?.id);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0
        }}
      >
        {/* Usamos TU Avatar.tsx existente */}
        {(() => {
          console.log('🔍 ProfileIcon - currentUser.avatar_url:', currentUser?.avatar_url);
          console.log('🔍 ProfileIcon - currentUser.username:', currentUser?.username);
          return (
            <Avatar
            src={realAvatarUrl || currentUser?.avatar_url || ''}
              username={currentUser?.username || currentUser?.email?.split('@')[0]}
              size="sm"
              onClick={() => {}}
            />
          );
        })()}
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
            width: '180px',
            zIndex: 1001,
            padding: '8px 0'
          }}
        >
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenProfile(); // abre tu modal actual
            }}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              padding: '10px 12px',
              textAlign: 'left',
              fontSize: '14px',
              cursor: 'pointer',
              color: DESIGN_SYSTEM.colors.text.primary
            }}
          >
            Ver perfil
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              padding: '10px 12px',
              textAlign: 'left',
              fontSize: '14px',
              cursor: 'pointer',
              color: DESIGN_SYSTEM.colors.text.primary
            }}
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
};