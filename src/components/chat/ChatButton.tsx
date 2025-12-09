import React, { useState } from 'react';
import { COLORS } from '../../utils/constants';
import { getOrCreateConversation } from '../../services/chatService';
import { ChatModal } from './ChatModal';
import { User } from '../../types';

interface ChatButtonProps {
  currentUser: User;
  targetUser: {
    id: string;
    username: string;
    avatar_url?: string;
    plan_type: string;
  };
  onShowProfile: (userId: string) => void;
}

export const ChatButton: React.FC<ChatButtonProps> = ({
  currentUser,
  targetUser,
  onShowProfile,
}) => {
  const [showChatModal, setShowChatModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpenChat = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      // Crear o obtener conversación
      await getOrCreateConversation(currentUser.id, targetUser.id);
      setShowChatModal(true);
    } catch (error) {
      console.error('Error abriendo chat:', error);
      alert('No se pudo iniciar la conversación');
    } finally {
      setLoading(false);
    }
  };

  // No mostrar botón si es el mismo usuario
  if (currentUser?.id === targetUser.id) return null;

  return (
    <>
      <button
        onClick={handleOpenChat}
        disabled={loading || !currentUser}
        style={{
          background: 'none',
          border: 'none',
          color: COLORS.primary,
          cursor: currentUser ? 'pointer' : 'not-allowed',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          opacity: currentUser ? 1 : 0.5,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (currentUser) {
            e.currentTarget.style.backgroundColor = COLORS.light;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <span>💬</span>
        {loading ? 'Cargando...' : 'Enviar mensaje'}
      </button>

      {showChatModal && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          currentUser={currentUser}
          targetUser={targetUser}
          onShowProfile={onShowProfile}
        />
      )}
    </>
  );
};