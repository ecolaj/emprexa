import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Avatar } from '../ui/Avatar/Avatar';
import { DESIGN_SYSTEM } from '../../utils/designSystem';
import { Notification } from '../../services/notificationService';

type Props = {
  notif: Notification;
  onClick: () => void;
};

export const NotificationItem: React.FC<Props> = ({ notif, onClick }) => {

  // Determinar texto de avatar según el tipo de notificación
  const getNotificationAvatarText = (type: Notification['type']) => {
    switch (type) {
      case 'friend_request':
        return 'Amigo';
      case 'mention':
        return 'Mención';
      case 'like':
        return 'Like';
      default:
        return 'Notif';
    }
  };

  // Determinar icono según el tipo de notificación
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'friend_request':
        return '👥';
      case 'mention':
        return '📢';
      case 'like':
        return '❤️';
      default:
        return '🔔';
    }
  };

  // Determinar color de fondo según estado de lectura
  const getBackgroundColor = () => {
    return notif.read 
      ? 'transparent' 
      : DESIGN_SYSTEM.colors.background.tertiary;
  };

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '12px 16px',
        borderBottom: `1px solid ${DESIGN_SYSTEM.colors.border.subtle}`,
        backgroundColor: getBackgroundColor(),
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = DESIGN_SYSTEM.colors.background.hover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = getBackgroundColor();
      }}
    >
      {/* Icono de notificación */}
      <div style={{ 
        fontSize: '16px',
        marginTop: '2px',
        flexShrink: 0
      }}>
        {getNotificationIcon(notif.type)}
      </div>

      {/* Indicador de tipo de notificación */}
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: 
          notif.type === 'friend_request' ? DESIGN_SYSTEM.colors.secondary :
          notif.type === 'mention' ? DESIGN_SYSTEM.colors.primary.main :
          DESIGN_SYSTEM.colors.accent,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }} />

      {/* Contenido de la notificación */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ 
          fontSize: '14px', 
          color: DESIGN_SYSTEM.colors.text.primary,
          lineHeight: '1.4',
          marginBottom: '4px'
        }}>
          {notif.message}
        </div>
        
        <div style={{ 
          fontSize: '11px', 
          color: DESIGN_SYSTEM.colors.text.secondary,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>
            {formatDistanceToNow(new Date(notif.created_at), { 
              locale: es, 
              addSuffix: true 
            })}
          </span>
          
          {!notif.read && (
            <span style={{
              width: '6px',
              height: '6px',
              backgroundColor: DESIGN_SYSTEM.colors.primary.main,
              borderRadius: '50%',
              display: 'inline-block'
            }} />
          )}
        </div>
      </div>

      {/* Indicador de no leído */}
      {!notif.read && (
        <div style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '8px',
          height: '8px',
          backgroundColor: DESIGN_SYSTEM.colors.primary.main,
          borderRadius: '50%'
        }} />
      )}
    </div>
  );
};