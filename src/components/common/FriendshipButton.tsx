import React, { useState, useEffect } from 'react';
import { COLORS } from '../../utils/constants';

interface FriendshipButtonProps {
  currentUserId: string;
  targetUserId: string;
  friendshipStatus: 'pending' | 'accepted' | 'rejected' | 'none';
}

// Importar funciones reales del servicio
import {
  sendFriendRequest,
  getPendingFriendRequests,
  acceptFriendRequest,
  rejectOrCancelFriendship
} from '../../services/friendshipService';

export const FriendshipButton: React.FC<FriendshipButtonProps> = ({ 
  currentUserId, 
  targetUserId, 
  friendshipStatus 
}) => {
  const [status, setStatus] = useState(friendshipStatus);
  const [loading, setLoading] = useState(false);

  // Actualizar estado cuando cambie la prop
  useEffect(() => {
    setStatus(friendshipStatus);
  }, [friendshipStatus]);

  const handleFriendshipAction = async (action: 'send' | 'accept' | 'reject' | 'cancel') => {
    if (loading) return;
    
    setLoading(true);
    try {
      if (action === 'send') {
        await sendFriendRequest(currentUserId, targetUserId);
        setStatus('pending');
      } else if (action === 'accept') {
        // Para aceptar necesitamos el ID de la amistad
        const requests = await getPendingFriendRequests(currentUserId);
        const request = requests.find(req => req.user_id === targetUserId);
        if (request) {
          await acceptFriendRequest(request.id);
          setStatus('accepted');
        }
      } else if (action === 'reject' || action === 'cancel') {
        await rejectOrCancelFriendship(currentUserId, targetUserId);
        setStatus('none');
      }
      
    } catch (error: any) {
      console.error('Error en acción de amistad:', error);
      alert(error.message || 'Error al procesar la solicitud de amistad');
    } finally {
      setLoading(false);
    }
  };

  if (currentUserId === targetUserId) return null;

  switch (status) {
    case 'none':
      return (
        <button
          onClick={() => handleFriendshipAction('send')}
          disabled={loading}
          style={{
            background: COLORS.primary,
            color: COLORS.white,
            border: 'none',
            padding: '8px 16px',
            borderRadius: '20px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Enviando...' : '➕ Enviar solicitud'}
        </button>
      );
    
    case 'pending':
      // Determinar si el usuario actual envió o recibió la solicitud
      // Por ahora simplificamos - en una versión futura detectaremos si es sender o receiver
      const isSender = true; // Temporalmente siempre mostrar como sender
      
      if (isSender) {
        return (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleFriendshipAction('cancel')}
              disabled={loading}
              style={{
                background: COLORS.gray,
                color: COLORS.white,
                border: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '11px',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? '...' : 'Cancelar'}
            </button>
            <div style={{ 
              padding: '8px 12px',
              background: COLORS.accent,
              color: COLORS.primary,
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              Pendiente
            </div>
          </div>
        );
      } else {
        return (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleFriendshipAction('accept')}
              disabled={loading}
              style={{
                background: COLORS.success,
                color: COLORS.white,
                border: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '11px',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? '...' : 'Aceptar'}
            </button>
            <button
              onClick={() => handleFriendshipAction('reject')}
              disabled={loading}
              style={{
                background: COLORS.danger,
                color: COLORS.white,
                border: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '11px',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? '...' : 'Rechazar'}
            </button>
          </div>
        );
      }
    
    case 'accepted':
      return (
        <div style={{ 
          padding: '8px 12px',
          background: COLORS.success,
          color: COLORS.white,
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: '600'
        }}>
          ✅ Amigos
        </div>
      );
    
    default:
      return null;
  }
};