import React, { useState, useEffect } from 'react';
import { COLORS } from '../../utils/constants';
import { getUserConversations, Conversation } from '../../services/chatService';
import { User } from '../../types';
import { supabase } from '../../supabaseClient';

interface ConversationsListProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSelectConversation: (conversation: Conversation, otherUser: any) => void;
  onShowProfile: (userId: string) => void;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectConversation,
  onShowProfile,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{isOpen: boolean; conversationId: string | null}>({
    isOpen: false,
    conversationId: null
  });

  // 🆕 Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  // Cargar conversaciones
  useEffect(() => {
    if (!isOpen || !currentUser) return;

    const loadConversations = async () => {
      setLoading(true);
      try {
        const userConversations = await getUserConversations(currentUser.id);
        setConversations(userConversations);
        
        const unread = userConversations.reduce((total, conv) => 
          total + (conv.unread_count || 0), 0
        );
        setUnreadCount(unread);
        
      } catch (error) {
        console.error('Error cargando conversaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();

    const subscription = supabase
      .channel('conversations-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          loadConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [isOpen, currentUser]);

  const handleConversationClick = (conversation: Conversation) => {
    const otherUser = conversation.other_user;
    console.log("🟣 ConversationsList - otherUser:", otherUser);
    console.log("🟣 ConversationsList - otherUser.id:", otherUser?.id);
    onSelectConversation(conversation, otherUser);
    onClose();
  };

  // 🆕 Función para abrir modal de confirmación
  const handleOpenDeleteConfirm = (conversationId: string) => {
    setConfirmDelete({ isOpen: true, conversationId });
    setOpenMenuId(null);
  };

  // 🆕 Función para borrar conversación
  const handleDeleteConversation = async () => {
    const { conversationId } = confirmDelete;
    if (!conversationId) return;

    try {
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (messagesError) throw messagesError;

      const { error: convError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (convError) throw convError;

      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      console.log('✅ Conversación eliminada correctamente');
    } catch (error) {
      console.error('❌ Error eliminando conversación:', error);
    } finally {
      setConfirmDelete({ isOpen: false, conversationId: null });
    }
  };

  // 🆕 Cerrar modal al hacer click fuera del contenido
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 1000,
        paddingTop: '60px',
      }}
      onClick={handleBackdropClick}
    >
      <div 
        style={{
          backgroundColor: COLORS.white,
          borderRadius: '12px',
          width: '90%',
          maxWidth: '400px',
          maxHeight: 'calc(80vh - 60px)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${COLORS.accent}33`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h3 style={{ margin: 0, color: COLORS.primary }}>
            Mensajes {unreadCount > 0 && `(${unreadCount})`}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              color: COLORS.gray,
              cursor: 'pointer',
              padding: '5px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Lista de conversaciones */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px 0',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: COLORS.gray }}>
              Cargando conversaciones...
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: COLORS.gray }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>💬</div>
              <p>No tienes conversaciones activas</p>
              <p style={{ fontSize: '14px', marginTop: '10px' }}>
                Inicia una conversación desde el perfil de otro usuario
              </p>
            </div>
          ) : (
            conversations.map((conversation) => {
              const otherUser = conversation.other_user;
              const unread = conversation.unread_count || 0;
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation)}
                  style={{
                    padding: '12px 20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    borderBottom: `1px solid ${COLORS.accent}15`,
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.light;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {/* Avatar */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowProfile(otherUser.id);
                    }}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: otherUser.avatar_url ? 'transparent' : COLORS.secondary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: COLORS.white,
                      fontWeight: 'bold',
                      fontSize: '16px',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    {otherUser.avatar_url ? (
                      <img 
                        src={otherUser.avatar_url} 
                        alt="Avatar" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      otherUser.username.charAt(0).toUpperCase()
                    )}
                  </div>

                  {/* Información de la conversación */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          onShowProfile(otherUser.id);
                        }}
                        style={{
                          fontWeight: '600',
                          color: COLORS.primary,
                          cursor: 'pointer',
                          fontSize: '14px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        @{otherUser.username}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {conversation.last_message_at && (
                          <div style={{ 
                            fontSize: '11px', 
                            color: COLORS.gray,
                            whiteSpace: 'nowrap',
                          }}>
                            {new Date(conversation.last_message_at).toLocaleDateString('es-ES', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        )}
                        {/* 🆕 Menú de tres puntos */}
                        <div style={{ position: 'relative' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === conversation.id ? null : conversation.id);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '16px',
                              color: COLORS.gray,
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '24px',
                              height: '24px',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = COLORS.light;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            ⋯
                          </button>

                          {openMenuId === conversation.id && (
                            <div style={{
                              position: 'absolute',
                              top: '100%',
                              right: 0,
                              backgroundColor: COLORS.white,
                              border: `1px solid ${COLORS.accent}33`,
                              borderRadius: '6px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              zIndex: 10,
                              minWidth: '140px',
                            }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDeleteConfirm(conversation.id);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  background: 'none',
                                  border: 'none',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  color: COLORS.danger,
                                  fontSize: '13px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = COLORS.light;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                🗑️ Eliminar chat
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ 
                      fontSize: '13px', 
                      color: COLORS.gray,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginTop: '2px'
                    }}>
                      {conversation.last_message || 'Inicia la conversación'}
                    </div>
                  </div>

                  {/* Notificación de mensajes no leídos */}
                  {unread > 0 && (
                    <div style={{
                      backgroundColor: COLORS.danger,
                      color: COLORS.white,
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      flexShrink: 0,
                    }}>
                      {unread}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 🆕 Modal de confirmación personalizado */}
        {confirmDelete.isOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
          }}>
            <div style={{
              backgroundColor: COLORS.white,
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            }}>
              <h3 style={{ margin: '0 0 16px 0', color: COLORS.primary }}>
                ¿Eliminar conversación?
              </h3>
              <p style={{ margin: '0 0 24px 0', color: COLORS.gray, lineHeight: '1.5' }}>
                Esta acción no se puede deshacer. Se eliminarán todos los mensajes de esta conversación.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setConfirmDelete({ isOpen: false, conversationId: null })}
                  style={{
                    padding: '10px 20px',
                    border: `1px solid ${COLORS.gray}`,
                    backgroundColor: 'transparent',
                    color: COLORS.gray,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConversation}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    backgroundColor: COLORS.danger,
                    color: COLORS.white,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};