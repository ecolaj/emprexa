import React, { useState, useEffect } from 'react';
import { COLORS } from '../../utils/constants';

interface FriendshipRequestsProps {
  currentUserId: string;
}

// Importar funciones reales del servicio
import {
  getPendingFriendRequests,
  acceptFriendRequest,
  rejectOrCancelFriendship
} from '../../services/friendshipService';

// Importar supabase real
import { supabase } from '../../services/supabaseService';

export const FriendshipRequests: React.FC<FriendshipRequestsProps> = ({ currentUserId }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [showRequests, setShowRequests] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cargar solicitudes pendientes
  const loadFriendRequests = async () => {
    setLoading(true);
    try {
      const pendingRequests = await getPendingFriendRequests(currentUserId);
      setRequests(pendingRequests);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      loadFriendRequests();

      // SUSCRIPCIÓN EN TIEMPO REAL (simulada por ahora)
      const subscription = supabase
        .channel('friendship-requests')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'friendships',
            filter: `friend_id=eq.${currentUserId}`
          },
          (payload) => {
            console.log('Cambio en friendships:', payload);
            loadFriendRequests(); // Recargar cuando haya cambios
          }
        )
        .subscribe();

      // Limpiar suscripción al desmontar
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [currentUserId]);

  const handleRequestResponse = async (requestId: string, response: 'accept' | 'reject') => {
    try {
      if (response === 'accept') {
        await acceptFriendRequest(requestId);
      } else {
        // Para rechazar, necesitamos obtener los user_ids primero
        const request = requests.find(req => req.id === requestId);
        if (request) {
          await rejectOrCancelFriendship(currentUserId, request.user_id);
        }
      }
      
      // Recargar solicitudes después de la acción
      await loadFriendRequests();
      
    } catch (error: any) {
      console.error('Error respondiendo solicitud:', error);
      alert(error.message || 'Error al procesar la solicitud');
    }
  };

  if (requests.length === 0) return null;

  return (
    <div style={{ marginBottom: '20px' }}>
      <button
        onClick={() => setShowRequests(!showRequests)}
        disabled={loading}
        style={{
          background: COLORS.secondary,
          color: COLORS.white,
          border: 'none',
          padding: '10px 16px',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          opacity: loading ? 0.7 : 1
        }}
      >
        👥 Solicitudes de amistad ({requests.length})
        <span>{showRequests ? '▲' : '▼'}</span>
        {loading && ' 🔄'}
      </button>

      {showRequests && (
        <div style={{
          marginTop: '10px',
          padding: '15px',
          background: COLORS.light,
          borderRadius: '8px',
          border: `1px solid ${COLORS.accent}`
        }}>
          {requests.map(request => (
            <div key={request.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px',
              background: COLORS.white,
              borderRadius: '6px',
              marginBottom: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Avatar del usuario */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: COLORS.secondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: COLORS.white,
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  {request.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <strong style={{ color: COLORS.primary }}>
                    @{request.profiles?.username || 'Usuario'}
                  </strong>
                  <div style={{ fontSize: '12px', color: COLORS.gray }}>
                    quiere ser tu amigo
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleRequestResponse(request.id, 'accept')}
                  style={{
                    background: COLORS.success,
                    color: COLORS.white,
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}
                >
                  Aceptar
                </button>
                <button
                  onClick={() => handleRequestResponse(request.id, 'reject')}
                  style={{
                    background: COLORS.danger,
                    color: COLORS.white,
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};