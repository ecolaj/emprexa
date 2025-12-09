import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { Button } from '../ui/Button/Button';
import { NotificationsDropdown } from './NotificationsDropdown';
import { MessagesIcon } from './MessagesIcon';
import { ProfileIcon } from './ProfileIcon';
import { HomeIcon } from '../ui/Icons/HomeIcon';
import { DESIGN_SYSTEM } from '../../utils/designSystem';
import { Plus } from 'lucide-react';
import { SquarePlusIcon } from '../ui/Icons/SquarePlusIcon';
import { BarChart3Icon } from '../ui/Icons/BarChart3Icon';
import { BellIcon } from '../ui/Icons/BellIcon';
import { MessageCircleIcon } from '../ui/Icons/MessageCircleIcon';
import { ConversationsList } from '../chat/ConversationsList';
import { ChatModal } from '../chat/ChatModal';
import { getUserConversations, Conversation } from '../../services/chatService';
import { supabase } from '../../supabaseClient';
import { useRealtimeNotifications } from '../../hooks/useRealtimeNotifications';
import { isUserAdmin } from '../../services/reportService';
import { ReportsPanel } from '../admin/ReportsPanel';
import { UpgradeButton } from './UpgradeButton';
import { canUserCreatePost, normalizePlanType } from '../../utils/permissionUtils';

type HeaderProps = {
  currentUser: any;
  onLogout: () => void;
  onOpenCreatePost: () => void;
  onOpenProfile: (userId: string) => void;
};

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onOpenCreatePost,
  onOpenProfile
}) => {
  const { currentView, navigateToMain, navigateToUserProfile, navigateToUserPublic } = useNavigation();
  
  // 🆕 ESTADOS PARA EL CHAT
  const [showConversationsList, setShowConversationsList] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [selectedTargetUser, setSelectedTargetUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // 🆕 ESTADOS PARA LA BÚSQUEDA
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // 🆕 ESTADOS PARA PANEL DE REPORTES ADMIN
const [isAdmin, setIsAdmin] = useState(false);
const [showReportsPanel, setShowReportsPanel] = useState(false);
const [pendingReportsCount, setPendingReportsCount] = useState(0);

  // 🆕 HOOK PARA NOTIFICACIONES EN TIEMPO REAL
  useRealtimeNotifications(currentUser?.id);

// 🆕 VERIFICAR SI ES ADMINISTRADOR Y CARGAR CONTADOR
useEffect(() => {
  const checkAdminAndLoadCount = async () => {
    if (currentUser?.id) {
      const adminStatus = await isUserAdmin();
      setIsAdmin(adminStatus);
      
      // 🆕 Cargar contador de reportes pendientes si es admin
      if (adminStatus) {
        const { getPendingReportsCount } = await import('../../services/reportService');
        const count = await getPendingReportsCount();
        setPendingReportsCount(count);
      }
    }
  };
  checkAdminAndLoadCount();
}, [currentUser?.id]);

  // 🆕 Contador en tiempo real
  useEffect(() => {
    if (!currentUser?.id) return;

    // 🆕 Sincronizar notificaciones existentes al cargar el header
    const syncExistingNotifications = async () => {
      try {
        const { syncAllNotifications } = await import('../../services/notificationSync');
        await syncAllNotifications(currentUser.id);
        console.log('✅ Notificaciones sincronizadas');
      } catch (error) {
        console.error('❌ Error sincronizando notificaciones:', error);
      }
    };
    
    syncExistingNotifications();

    let sub: RealtimeChannel;

    const loadUnreadCount = async () => {
      try {
        const conversations = await getUserConversations(currentUser.id);
        const unread = conversations.reduce((total, conv) => total + (conv.unread_count || 0), 0);
        setUnreadCount(unread);
        
        // 🆕 FORZAR ACTUALIZACIÓN del dropdown de notificaciones
        // Esto hace que el NotificationsDropdown recargue sus notificaciones
        const event = new CustomEvent('refreshNotifications');
        window.dispatchEvent(event);
        
      } catch (error) {
        console.error('Error cargando contador:', error);
      }
    };

    // 🆕 Cargar notificaciones existentes al iniciar sesión
    const loadExistingNotifications = async () => {
      try {
        const { getUnreadNotifications } = await import('../../services/notificationService');
        const notifications = await getUnreadNotifications(currentUser.id);
        console.log('📥 Notificaciones existentes cargadas:', notifications.length);
        // El contador se actualizará automáticamente cuando se abra el dropdown
      } catch (error) {
        console.error('Error cargando notificaciones existentes:', error);
      }
    };

    loadExistingNotifications();
    // Primera carga
    loadUnreadCount();

    // Escuchar cualquier cambio en mensajes que afecten al usuario
    sub = supabase
      .channel('header-unread')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          // Solo recalcular si el mensaje es de una conversación nuestra
          const msg = payload.new as { conversation_id: string; sender_id: string; is_read: boolean };
          if (!msg) return;
          loadUnreadCount(); // Recalcular siempre (barato y seguro)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') console.log('📡 Header unread realtime activo');
      });

    return () => {
      sub?.unsubscribe();
    };
  }, [currentUser?.id]);

  // 🆕 BÚSQUEDA EN TIEMPO REAL
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      setSearchLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, plan_type')
          .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
          .limit(10);

        if (!error && data) {
          setSearchResults(data);
        }
      } catch (error) {
        console.error('Error buscando usuarios:', error);
      } finally {
        setSearchLoading(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // 🆕 CERRAR BÚSQUEDA AL HACER CLICK FUERA
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🆕 Manejar selección de conversación
  const handleSelectConversation = (conversation: Conversation, otherUser: any) => {
    console.log("🟠 Header - otherUser recibido:", otherUser);
    console.log("🟠 Header - otherUser.id:", otherUser?.id);
    setSelectedConversation(conversation);
    setSelectedTargetUser(otherUser);
    setShowChatModal(true);
  };

  return (
    <header
      style={{
        backgroundColor: DESIGN_SYSTEM.colors.background.primary,
        color: DESIGN_SYSTEM.colors.text.primary,
        padding: `${DESIGN_SYSTEM.spacing[4]} 0`,
        boxShadow: DESIGN_SYSTEM.shadows.medium,
        borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backdropFilter: 'blur(10px)'
      }}
    >
      <div
        style={{
          maxWidth: DESIGN_SYSTEM.layout.maxWidth,
          margin: '0 auto',
          padding: `0 ${DESIGN_SYSTEM.spacing[6]}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: DESIGN_SYSTEM.spacing[4],
          flexWrap: 'wrap'
        }}
      >
        {/* Logo y Home */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
            onClick={navigateToMain}
          >
            <img 
              src="/images/logo.png" 
              alt="EMPREXA Logo" 
              style={{
                width: '32px',
                height: '32px',
                objectFit: 'contain'
              }}
            />
            <span
              style={{
                margin: 0,
                fontSize: DESIGN_SYSTEM.typography.fontSize['2xl'],
                fontWeight: DESIGN_SYSTEM.typography.fontWeight.bold,
              }}
            >
              EMPREXA
            </span>
          </div>
          
          {/* Botón Home con SVG */}
          <button 
            onClick={navigateToMain}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.1)',
              border: `1px solid rgba(255, 255, 255, 0.3)`,
              color: DESIGN_SYSTEM.colors.white,
              padding: '8px 12px',
              borderRadius: DESIGN_SYSTEM.borderRadius.lg,
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              width: '40px',
              height: '40px'
            }}
            title="Inicio"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.white;
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <HomeIcon 
              size={18} 
              color={DESIGN_SYSTEM.colors.white}
            />
          </button>
        </div>

{/* 🆕 PANEL DE REPORTES ADMIN */}
{isAdmin && (
  <button 
    onClick={() => setShowReportsPanel(true)}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255, 255, 255, 0.1)',
      border: `1px solid rgba(255, 255, 255, 0.3)`,
      color: DESIGN_SYSTEM.colors.white,
      padding: '8px 12px',
      borderRadius: DESIGN_SYSTEM.borderRadius.lg,
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      width: '40px',
      height: '40px',
      position: 'relative' // 🆕 IMPORTANTE
    }}
    title="Panel de Reportes"
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
      e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.white;
      e.currentTarget.style.transform = 'scale(1.05)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
      e.currentTarget.style.transform = 'scale(1)';
    }}
  >
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="18" 
      height="18" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
      <path d="M12 9v4"/>
      <path d="M12 17h.01"/>
    </svg>
    
    {/* 🆕 NOTIFICACIÓN DE REPORTES PENDIENTES */}
    {pendingReportsCount > 0 && (
      <span
        style={{
          position: 'absolute',
          top: 2,
          right: 2,
          backgroundColor: '#ef4444',
          color: 'white',
          fontSize: '10px',
          padding: '2px 5px',
          borderRadius: '10px',
          fontWeight: 'bold',
          animation: 'pulse 1.5s infinite',
          minWidth: '18px',
          textAlign: 'center'
        }}
      >
        {pendingReportsCount}
      </span>
    )}
  </button>
)}  

        {/* Iconos - ORDEN CORREGIDO (de derecha a izquierda) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* 🔍 BÚSQUEDA DE USUARIOS - NUEVO */}
          <div style={{ position: 'relative' }} className="search-container">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.1)',
                border: `1px solid rgba(255, 255, 255, 0.3)`,
                color: DESIGN_SYSTEM.colors.white,
                padding: '8px 12px',
                borderRadius: DESIGN_SYSTEM.borderRadius.lg,
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                width: '40px',
                height: '40px'
              }}
              title="Buscar usuarios"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.white;
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="m21 21-4.34-4.34"/>
                <circle cx="11" cy="11" r="8"/>
              </svg>
            </button>

            {/* DROPDOWN DE BÚSQUEDA */}
            {showSearch && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                width: '320px',
                background: DESIGN_SYSTEM.colors.background.primary,
                border: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
                borderRadius: DESIGN_SYSTEM.borderRadius.lg,
                boxShadow: DESIGN_SYSTEM.shadows.medium,
                padding: '15px',
                marginTop: '8px',
                zIndex: 1001
              }}>
                <input
                  type="text"
                  placeholder="Buscar usuarios por nombre o username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
                    borderRadius: DESIGN_SYSTEM.borderRadius.md,
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#1f2937', // ← Color oscuro fijo
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setShowSearch(false);
                  }}
                />

                {/* RESULTADOS */}
                <div style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '10px' }}>
                  {searchLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: DESIGN_SYSTEM.colors.text.secondary }}>
                      Buscando...
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map(user => (
                      <div
                        key={user.id}
                        onClick={() => {
                          navigateToUserPublic(user.username);
                          setShowSearch(false);
                          setSearchQuery('');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px',
                          borderRadius: DESIGN_SYSTEM.borderRadius.md,
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: user.avatar_url ? 'transparent' : DESIGN_SYSTEM.colors.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          overflow: 'hidden'
                        }}>
                          {user.avatar_url ? (
                            <img 
                              src={user.avatar_url} 
                              alt="Avatar" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            user.username?.charAt(0).toUpperCase() || 'U'
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            fontSize: '14px', 
                            fontWeight: '600',
                            color: DESIGN_SYSTEM.colors.text.primary 
                          }}>
                            {user.full_name || 'Usuario'}
                          </div>
                          <div style={{ 
                            fontSize: '12px', 
                            color: DESIGN_SYSTEM.colors.text.secondary 
                          }}>
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : searchQuery && !searchLoading ? (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '20px', 
                      color: DESIGN_SYSTEM.colors.text.secondary,
                      fontSize: '14px'
                    }}>
                      No se encontraron usuarios
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>

{/* 🔼 BOTÓN UPGRADE - VISIBLE PARA TODOS */}
{currentUser && (
          <UpgradeButton 
            size="sm"
            variant="secondary"
            showIcon={true}
            label="Upgrade"
          />
        )}

          {/* Crear post - MÁS A LA DERECHA */}
          {currentUser && canUserCreatePost(normalizePlanType(currentUser.plan_type)) && (
            <button 
              onClick={onOpenCreatePost}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.1)',
                border: `1px solid rgba(255, 255, 255, 0.3)`,
                color: DESIGN_SYSTEM.colors.white,
                padding: '8px 12px',
                borderRadius: DESIGN_SYSTEM.borderRadius.lg,
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                width: '40px',
                height: '40px',
                gap: '0px'
              }}
              title="Crear nuevo proyecto"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.white;
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <SquarePlusIcon 
                size={18} 
                color={DESIGN_SYSTEM.colors.white}
              />
            </button>
          )}

          {/* Notificaciones con dropdown */}
          <NotificationsDropdown currentUser={currentUser} />

          {/* 🆕 MENSAJES - ACTUALIZADO CON CONTADOR */}
          {currentUser && (
            <button 
              onClick={async () => {
                if (currentUser) {
                  try {
                    const conversations = await getUserConversations(currentUser.id);
                    const unread = conversations.reduce((total, conv) => total + (conv.unread_count || 0), 0);
                    setUnreadCount(unread);
                  } catch (e) { console.error(e); }
                }
                setShowConversationsList(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.1)',
                border: `1px solid rgba(255, 255, 255, 0.3)`,
                color: DESIGN_SYSTEM.colors.white,
                padding: '8px 12px',
                borderRadius: DESIGN_SYSTEM.borderRadius.lg,
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                width: '40px',
                height: '40px',
                position: 'relative'
              }}
              title="Mensajes"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.white;
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <MessageCircleIcon 
                size={18} 
                color={DESIGN_SYSTEM.colors.white}
              />
              
              {/* 🆕 NOTIFICACIÓN DE MENSAJES NO LEÍDOS */}
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    backgroundColor: '#ef4444',
                    color: 'white',
                    fontSize: '10px',
                    padding: '2px 5px',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    animation: 'pulse 1.5s infinite',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Dashboard premium */}
          {currentUser && canUserCreatePost(normalizePlanType(currentUser.plan_type)) && (
            <button 
              onClick={() => {
                console.log('>>> Navegando al dashboard');
                if (window.__realNavigation?.navigateToDashboard) {
                  window.__realNavigation.navigateToDashboard();
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.1)',
                border: `1px solid rgba(255, 255, 255, 0.3)`,
                color: DESIGN_SYSTEM.colors.white,
                padding: '8px 12px',
                borderRadius: DESIGN_SYSTEM.borderRadius.lg,
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                width: '40px',
                height: '40px'
              }}
              title="Estadísticas y métricas"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.white;
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <BarChart3Icon 
                size={18} 
                color={DESIGN_SYSTEM.colors.white}
              />
            </button>
          )}

          {/* Perfil - MÁS A LA IZQUIERDA (pegado al centro) */}
          {currentUser && (
            <ProfileIcon
              currentUser={currentUser}
              onOpenProfile={() => onOpenProfile(currentUser.id)}
              onLogout={onLogout}
            />
          )}
        </div>
      </div>

      {/* 🆕 MODALES DE CHAT */}
      {showConversationsList && (
        <ConversationsList
          isOpen={showConversationsList}
          onClose={() => setShowConversationsList(false)}
          currentUser={currentUser}
          onSelectConversation={handleSelectConversation}
          onShowProfile={onOpenProfile}
        />
      )}

      {showChatModal && selectedTargetUser && (
        console.log("🟢 Header - selectedTargetUser:", selectedTargetUser),
        console.log("🟢 Header - selectedTargetUser.id:", selectedTargetUser?.id),
        <ChatModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          currentUser={currentUser}
          targetUser={selectedTargetUser}
          conversationId={selectedConversation?.id}
          onShowProfile={(userId) => {
            console.log("🔄 ChatModal quiere abrir perfil del usuario:", userId);
            onOpenProfile(userId);
          }}
        />
      )}

{/* 🆕 MODAL DE PANEL DE REPORTES */}
{showReportsPanel && (
  <ReportsPanel 
    onClose={() => setShowReportsPanel(false)}
  />
)}

    </header>
  );
};