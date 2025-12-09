import React, { useCallback, useState } from 'react';
import { Post, User } from '../../types';
import { COLORS } from '../../utils/constants';
import { HeartIcon } from '../ui/Icons/HeartIcon';
import { DESIGN_SYSTEM } from '../../utils/designSystem';
import { MessageCircleIcon } from '../ui/Icons/MessageCircleIcon';
import { ShareIcon } from '../ui/Icons/ShareIcon';
import { MessageCircle, X, Facebook } from 'lucide-react'; // 🆕 CORRECCIÓN

interface PostFooterProps {
  post: Post;
  currentUser: User | null;
  onPostLike?: (postId: string, liked: boolean) => void;
  showComments: boolean; // 🆕 NUEVO
  setShowComments: (show: boolean) => void; // 🆕 NUEVO
}

export const PostFooter = React.memo<PostFooterProps>(({ 
  post, 
  currentUser,
  onPostLike,
  showComments, // 🆕 NUEVO
  setShowComments, // 🆕 NUEVO
}) => {
  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  // 🆕 OPTIMIZADO: Handler de like memoizado
  const handleLike = useCallback(() => {
    if (!currentUser) {
      alert('Debes iniciar sesión para dar like');
      return;
    }
  
    try {
      // Usar la función centralizada
      if (onPostLike) {
        onPostLike(post.id, !post.user_has_liked);
      }
    } catch (err: any) {
      console.error('Error al togglear like:', err);
      alert('No se pudo actualizar el like: ' + err.message);
    }
  }, [currentUser, onPostLike, post.id, post.user_has_liked]);

  // 🆕 OPTIMIZADO: Handler de compartir memoizado
  const handleShare = useCallback((platform: string) => {
    const text = `Mira este post: ${post.title}`;
    const url = window.location.href;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
    }
    
    setShareMenuOpen(false);
  }, [post.title]);

  // 🆕 OPTIMIZADO: Handler de comentarios memoizado
  const handleCommentClick = useCallback(() => {
    if (!currentUser) {
      alert('Debes iniciar sesión para comentar');
      return;
    }
    
    // 🆕 NUEVO: Control centralizado de visibilidad
    const newShowState = !showComments;
    setShowComments(newShowState);
    
    // 🆕 NUEVO: Scroll suave a los comentarios si se abren
    if (newShowState) {
      setTimeout(() => {
        const commentsSection = document.getElementById(`comments-${post.id}`);
        if (commentsSection) {
          commentsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  }, [currentUser, showComments, setShowComments, post.id]);

  // 🆕 OPTIMIZADO: Toggle del menú compartir memoizado
  const toggleShareMenu = useCallback(() => {
    setShareMenuOpen(prev => !prev);
  }, []);

  // 🆕 OPTIMIZADO: Cerrar menú compartir al hacer click fuera
  const handleCloseShareMenu = useCallback(() => {
    setShareMenuOpen(false);
  }, []);

  // Estilo para botones deshabilitados
  const disabledStyle = {
    opacity: 0.5,
    cursor: 'not-allowed'
  };

  // 🆕 OPTIMIZADO: Estilos memoizados para mejor rendimiento
  const buttonBaseStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s'
  } as const;

  const likeButtonStyle = {
    ...buttonBaseStyle,
    color: post.user_has_liked ? DESIGN_SYSTEM.colors.error[500] : DESIGN_SYSTEM.colors.text.secondary,
  };

  const commentButtonStyle = {
    ...buttonBaseStyle,
    color: DESIGN_SYSTEM.colors.text.secondary,
    ...(!currentUser ? disabledStyle : {})
  };

  const shareButtonStyle = {
    ...buttonBaseStyle,
    color: DESIGN_SYSTEM.colors.text.secondary,
  };

  return (
    <div style={{ 
      marginTop: '15px', 
      borderTop: `1px solid ${COLORS.accent}33`, 
      paddingTop: '15px' 
    }}>
      {/* Contadores */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '10px',
        color: COLORS.gray,
        fontSize: '14px'
      }}>
        <span>{post.like_count || 0} me gusta</span>
        <span>{(post.comments?.length || post.comment_count || 0)} comentarios</span>
      </div>
      
      {/* Botones de acción */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-around',
        borderTop: `1px solid ${COLORS.accent}33`,
        borderBottom: `1px solid ${COLORS.accent}33`,
        padding: '8px 0'
      }}>
        {/* Botón Like */}
        <button 
          onClick={handleLike}
          style={likeButtonStyle}
          onMouseEnter={(e) => {
            if (currentUser) {
              e.currentTarget.style.color = DESIGN_SYSTEM.colors.error[500];
              e.currentTarget.style.transform = 'scale(1.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (currentUser) {
              e.currentTarget.style.color = post.user_has_liked ? DESIGN_SYSTEM.colors.error[500] : DESIGN_SYSTEM.colors.text.secondary;
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          <HeartIcon 
            size={18} 
            filled={post.user_has_liked}
            color={post.user_has_liked ? DESIGN_SYSTEM.colors.error[500] : DESIGN_SYSTEM.colors.text.secondary}
          />
          {post.like_count || 0}
        </button>
        
        {/* Botón Comentar */}
        <button 
          onClick={handleCommentClick}
          disabled={!currentUser}
          style={commentButtonStyle}
          onMouseOver={(e) => {
            if (currentUser) {
              e.currentTarget.style.backgroundColor = COLORS.light;
              e.currentTarget.style.color = DESIGN_SYSTEM.colors.primary[600];
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseOut={(e) => {
            if (currentUser) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = DESIGN_SYSTEM.colors.text.secondary;
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          <MessageCircleIcon 
            size={18} 
            color={DESIGN_SYSTEM.colors.text.secondary}
          />
          Comentar
        </button>
        
        {/* Botón Compartir */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={toggleShareMenu}
            style={shareButtonStyle}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.light;
              e.currentTarget.style.color = DESIGN_SYSTEM.colors.primary[600];
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = DESIGN_SYSTEM.colors.text.secondary;
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <ShareIcon 
              size={18} 
              color={DESIGN_SYSTEM.colors.text.secondary}
            />
            Compartir
          </button>
          
          {/* Menú desplegable de compartir */}
          {shareMenuOpen && (
            <div
            style={{
              position: 'absolute',
              bottom: '100%', // 🆕 CAMBIO: Ahora se despliega hacia arriba
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: COLORS.white,
              border: `1px solid ${COLORS.accent}`,
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              padding: '8px',
              zIndex: 10,
              minWidth: '120px',
              marginBottom: '8px', // 🆕 NUEVO: Espacio entre el botón y el menú
            }}
              onMouseEnter={() => setShareMenuOpen(true)}
              onMouseLeave={handleCloseShareMenu}
            >
              <button 
  onClick={() => handleShare('whatsapp')}
  style={{
    background: 'none',
    border: 'none',
    padding: '8px 12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    borderRadius: '4px',
    color: COLORS.primary,
    fontSize: '13px',
    transition: 'background-color 0.2s',
  }}
  onMouseOver={(e) => e.currentTarget.style.backgroundColor = COLORS.light}
  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
>
  <MessageCircle size={16} /> {/* 🆕 CAMBIO: Icono Lucide */}
  WhatsApp
</button>
              <button 
                onClick={() => handleShare('twitter')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  borderRadius: '4px',
                  color: COLORS.primary,
                  fontSize: '13px',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = COLORS.light}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
               <X size={16} /> {/* 🆕 CORRECCIÓN: Icono correcto de X */}
X
              </button>
              <button 
                onClick={() => handleShare('facebook')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  borderRadius: '4px',
                  color: COLORS.primary,
                  fontSize: '13px',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = COLORS.light}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Facebook size={16} /> {/* 🆕 CAMBIO: Icono Lucide */}
Facebook
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// 🆕 NUEVO: Display name para mejor debugging
PostFooter.displayName = 'PostFooter';