// src/components/common/NotificationsDropdown.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { DESIGN_SYSTEM } from '../../utils/designSystem';
import {
  Notification,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
} from '../../services/notificationService';
import { NotificationItem } from './NotificationItem';
import { useRealtimeNotifications } from '../../hooks/useRealtimeNotifications';
import { BellIcon } from '../ui/Icons/BellIcon';

type Props = { currentUser: any };

export const NotificationsDropdown: React.FC<Props> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

    // 🆕 CERRAR AL HACER CLICK FUERA
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.notifications-container')) {
          setIsOpen(false);
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

  /* ----------  CARGAR NOTIFICACIONES  ---------- */
  const loadNotifications = useCallback(async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const unread = await getUnreadNotifications(currentUser.id);
      setNotifications(unread);
    } catch (e) {
      console.error('Error cargando notificaciones:', e);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  /* ----------  ABRIR / CERRAR DROPDOWN  ---------- */
  const openDropdown = useCallback(async () => {
    setIsOpen(true);
    // 🆕 SOLO cargar notificaciones, NO marcar como leídas automáticamente
    if (currentUser?.id) {
      loadNotifications();
    }
  }, [currentUser?.id, loadNotifications]);

  const closeDropdown = useCallback(() => setIsOpen(false), []);

  /* ----------  CLICK EN UNA FILA (por si quiere interactuar)  ---------- */
  const handleNotificationClick = (notif: Notification) => {
    if (notif.read) return;
    // marcar individual y actualizar estado
    markAsRead(notif.id).catch(() => {});
    setNotifications(prev =>
      prev.map(n => (n.id === notif.id ? { ...n, read: true } : n))
    );
  };

  // 🆕 PREVENIR SCROLL BUBBLING CUANDO EL DROPDOWN ESTÁ ABIERTO
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const dropdown = document.querySelector('.notifications-container > div:last-child');
      if (dropdown && dropdown.contains(e.target as Node)) {
        e.stopPropagation();
      }
    };

    if (isOpen) {
      document.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, [isOpen]);

  // 🆕 Escuchar evento de actualización forzada
  useEffect(() => {
    const handleRefresh = () => {
      console.log('🔄 Actualizando notificaciones por evento');
      loadNotifications();
    };

    window.addEventListener('refreshNotifications', handleRefresh);
    return () => {
      window.removeEventListener('refreshNotifications', handleRefresh);
    };
  }, [loadNotifications]);

  useEffect(() => {
    // limpiar al salir
    if (!currentUser?.id) setNotifications([]);
  }, [currentUser?.id]);

  /* ----------  RENDER  ---------- */
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ position: 'relative' }} className="notifications-container">
      {/* Campanita */}
      {/* Campanita */}
<button
  onClick={isOpen ? closeDropdown : openDropdown}
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
  title="Notificaciones"
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
  <BellIcon 
    size={18} 
    color={DESIGN_SYSTEM.colors.white}
  />
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

      {/* Dropdown */}
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
            width: '320px',
            maxHeight: '400px',
            overflow: 'hidden',
            zIndex: 1001,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
              backgroundColor: DESIGN_SYSTEM.colors.background.tertiary,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
                color: DESIGN_SYSTEM.colors.text.primary,
              }}
            >
              Notificaciones
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {unreadCount > 0 && (
                <>
                  <div
                    style={{
                      fontSize: '11px',
                      color: DESIGN_SYSTEM.colors.primary.main,
                      backgroundColor: DESIGN_SYSTEM.colors.primary.light,
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontWeight: 'bold',
                    }}
                  >
                    {unreadCount} nuevo{unreadCount !== 1 ? 's' : ''}
                  </div>
                  <button
                    onClick={async () => {
                      if (currentUser?.id) {
                        try {
                          await markAllAsRead(currentUser.id);
                          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                        } catch (e) {
                          console.error('Error marcando como leídas:', e);
                        }
                      }
                    }}
                    style={{
                      fontSize: '11px',
                      color: DESIGN_SYSTEM.colors.text.secondary,
                      background: 'none',
                      border: `1px solid ${DESIGN_SYSTEM.colors.primary.main}`,
                      padding: '2px 6px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    Marcar leídas
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Lista */}
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {loading ? (
              <div
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: DESIGN_SYSTEM.colors.text.secondary,
                  fontSize: '14px',
                }}
              >
                Cargando notificaciones...
              </div>
            ) : notifications.length === 0 ? (
              <div
  style={{
    padding: '24px 20px',
    textAlign: 'center',
    color: DESIGN_SYSTEM.colors.text.secondary,
    fontSize: '14px',
  }}
>
  <div style={{ marginBottom: '8px' }}>
    <BellIcon 
      size={32} 
      color={DESIGN_SYSTEM.colors.text.secondary}
    />
  </div>
  No tienes notificaciones pendientes
</div>
            ) : (
              <div>
                {notifications.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    notif={notif}
                    onClick={() => handleNotificationClick(notif)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};