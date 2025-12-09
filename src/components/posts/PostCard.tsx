import React, { useState, useEffect, useCallback } from 'react';
import { Post } from '../../types';
import { DESIGN_SYSTEM } from '../../utils/designSystem';
import { COLORS } from '../../utils/constants';
import { Card } from '../ui/Card/Card';
import { Avatar } from '../ui/Avatar/Avatar';
import { ODSBadge } from '../common/ODSBadge';
import { FormattedText } from '../common/FormattedText';
import { PostMedia } from './PostMedia';
import { PostFooter } from './PostFooter';
import { CommentsSection } from './CommentsSection';
import { deletePost } from '../../services/postsService';
import { useNavigation } from '../../contexts/NavigationContext';
import { ReportButton } from '../common/ReportButton';
import { getPlanBadgeData, normalizePlanType } from '../../utils/permissionUtils';
import { EditPostModal } from './EditPostModal';
import { formatUSD, formatDateTime } from '../../utils/formatUtils';

interface DeleteConfirmationModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
  onConfirm, 
  onCancel 
}) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        border: `1px solid ${COLORS.accent}20`,
        animation: 'modalAppear 0.3s ease-out',
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '24px',
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
          }}>
            🗑️
          </div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: COLORS.primary,
            marginBottom: '8px',
          }}>
            ¿Borrar publicación?
          </h3>
          <p style={{
            color: COLORS.gray,
            fontSize: '14px',
            lineHeight: '1.5',
          }}>
            Esta acción no se puede deshacer. La publicación se eliminará permanentemente.
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '12px 24px',
              background: '#f8f9fa',
              color: COLORS.gray,
              border: `2px solid #e2e8f0`,
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              flex: 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e9ecef';
              e.currentTarget.style.color = COLORS.primary;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8f9fa';
              e.currentTarget.style.color = COLORS.gray;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '12px 24px',
              background: `linear-gradient(135deg, ${COLORS.danger}, #dc2626)`,
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              flex: 1,
              boxShadow: `0 4px 12px ${COLORS.danger}30`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 6px 20px ${COLORS.danger}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 4px 12px ${COLORS.danger}30`;
            }}
          >
            Sí, borrar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalAppear {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

interface PostCardProps {
  post;
  currentUser;
  onShowProfile: (userId: string) => void;
  setImageModal: (modal: any) => void;
  onExpandComments: (postId: string) => void;
  onCommentAdded: (comment: any) => void;
  loadCommentsInitially?: boolean;
  onPostLike?: (postId: string, liked: boolean) => void;
}

export const PostCard = React.memo(({
  post,
  currentUser,
  onShowProfile,
  setImageModal,
  onExpandComments,
  onCommentAdded,
  loadCommentsInitially = false,
  onPostLike,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [localPost, setLocalPost] = useState(post);
  const [hasLoadedComments, setHasLoadedComments] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const isAuthor = currentUser?.id === post.user_id;
  const { navigateToHashtag, navigateToUserProfile, navigateToUserPublic, navigateToODS } = useNavigation();

  useEffect(() => {
    const shouldLoadComments = 
      loadCommentsInitially && 
      post.comment_count > 0 && 
      (!post.comments || post.comments.length === 0) &&
      !hasLoadedComments;

    if (shouldLoadComments) {
      console.log(`🔄 Cargando comentarios automáticamente para post: ${post.id}`);
      setHasLoadedComments(true);
      onExpandComments(post.id.toString());
    }
  }, [loadCommentsInitially, post.id, post.comment_count, post.comments, onExpandComments, hasLoadedComments]);

  useEffect(() => {
    setLocalPost(post);
    if (post.id !== localPost.id) {
      setHasLoadedComments(false);
    }
  }, [post, localPost.id]);

  const handleDeleteClick = useCallback(() => {
    setPostToDelete(post.id.toString());
    setShowDeleteModal(true);
    setMenuOpen(false);
  }, [post.id]);

  const handleConfirmDelete = useCallback(async () => {
    if (!postToDelete) return;
    
    await deletePost(postToDelete);
    onCommentAdded({ ...post, _deleted: true });
    setShowDeleteModal(false);
    setPostToDelete(null);
  }, [postToDelete, post, onCommentAdded]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setPostToDelete(null);
  }, []);

  const handleMenuToggle = useCallback(() => {
    setMenuOpen(prev => !prev);
  }, []);

  const handleEdit = useCallback(() => {
    setMenuOpen(false);
    setShowEditModal(true);
  }, []);

  const handleUserClick = useCallback(() => {
    navigateToUserPublic(localPost.author.username);
  }, [localPost.author.username, navigateToUserPublic]);

  const handleODSClick = useCallback((odsNumero: number) => {
    navigateToODS(odsNumero);
  }, [navigateToODS]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (menuOpen) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <>
      {showDeleteModal && (
        <DeleteConfirmationModal
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
      
      {showEditModal && (
        <EditPostModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onPostUpdated={(updatedPost) => {
            onCommentAdded(updatedPost);
            setShowEditModal(false);
          }}
          post={localPost}
        />
      )}
      
      <Card variant="elevated" padding="lg">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: DESIGN_SYSTEM.spacing[4],
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: DESIGN_SYSTEM.spacing[3],
              width: '100%',
            }}
          >
            <Avatar
              src={localPost.author.avatar_url}
              username={localPost.author.username}
              size="md"
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: DESIGN_SYSTEM.spacing[2],
                  marginBottom: DESIGN_SYSTEM.spacing[2],
                  flexWrap: 'wrap',
                }}
              >
                <span
                  onClick={handleUserClick}
                  style={{
                    fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                    color: DESIGN_SYSTEM.colors.primary[600],
                    fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
                    cursor: 'pointer',
                  }}
                >
                  @{localPost.author.username}
                </span>
                {(() => {
                  const badgeData = getPlanBadgeData(
                    normalizePlanType(localPost.author.plan_type || 'free'), 
                    'sm'
                  );
                  
                  if (!badgeData) return null;
                  
                  return (
                    <span style={badgeData.style}>
                      <span style={{ fontSize: badgeData.iconSize }}>{badgeData.icon}</span>
                      {badgeData.text}
                    </span>
                  );
                })()}
              </div>
              
              <span
  style={{
    fontSize: DESIGN_SYSTEM.typography.fontSize.xs,
    color: COLORS.gray,
    display: 'flex',
    flexDirection: 'column',
    lineHeight: '1.2',
  }}
>
  <span>{formatDateTime(localPost.created_at)}</span>
</span>

              {localPost.updated_at && localPost.updated_at !== localPost.created_at && (
                <span
                style={{
                  fontSize: DESIGN_SYSTEM.typography.fontSize.xs,
                  color: COLORS.gray,
                  fontStyle: 'italic',
                  display: 'block',
                  marginTop: '2px'
                }}
                >
                  • editado
                </span>
              )}
            </div>
            {isAuthor && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuToggle();
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: COLORS.gray,
                    cursor: 'pointer',
                    fontSize: '18px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = COLORS.light)}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  ⋮
                </button>
                {menuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      backgroundColor: DESIGN_SYSTEM.colors.white,
                      border: `1px solid ${COLORS.accent}99`,
                      borderRadius: DESIGN_SYSTEM.borderRadius.md,
                      boxShadow: DESIGN_SYSTEM.shadows.md,
                      zIndex: 10,
                      minWidth: '120px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      onClick={handleEdit}
                      style={{
                        padding: `${DESIGN_SYSTEM.spacing[2]} ${DESIGN_SYSTEM.spacing[3]}`,
                        fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                        cursor: 'pointer',
                        borderBottom: `1px solid ${COLORS.accent}33`,
                        transition: 'background-color 0.2s',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = COLORS.light)}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      Editar
                    </div>
                    <div
                      onClick={handleDeleteClick}
                      style={{
                        padding: `${DESIGN_SYSTEM.spacing[2]} ${DESIGN_SYSTEM.spacing[3]}`,
                        fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                        cursor: 'pointer',
                        color: DESIGN_SYSTEM.colors.error[500],
                        transition: 'background-color 0.2s',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = DESIGN_SYSTEM.colors.error[50])}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      Borrar
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: DESIGN_SYSTEM.spacing[4] }}>
          <h3
            style={{
              fontSize: DESIGN_SYSTEM.typography.fontSize.lg,
              fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
              marginBottom: DESIGN_SYSTEM.spacing[2],
              color: '#1f2937',
              lineHeight: DESIGN_SYSTEM.typography.lineHeight.tight,
            }}
          >
            {localPost.title}
          </h3>
          <FormattedText
            text={localPost.content}
            onHashtagClick={navigateToHashtag}
            onMentionClick={navigateToUserProfile}
          />
        </div>

        {localPost.ods && localPost.ods.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: DESIGN_SYSTEM.spacing[2],
              marginBottom: DESIGN_SYSTEM.spacing[4],
            }}
          >
            {localPost.ods.map((ods) => (
              <ODSBadge
                key={ods.id}
                ods={ods}
                onClick={() => handleODSClick(ods.numero)}
              />
            ))}
          </div>
        )}

        {(localPost.budget_approx || 
          localPost.beneficiaries_men || 
          localPost.beneficiaries_women || 
          localPost.partners || 
          localPost.project_status) && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(240, 253, 244, 0.8) 0%, rgba(220, 252, 231, 0.6) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '16px',
            padding: DESIGN_SYSTEM.spacing[4],
            marginBottom: DESIGN_SYSTEM.spacing[4],
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #10b981, #34d399)',
              borderRadius: '16px 16px 0 0'
            }} />
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: DESIGN_SYSTEM.spacing[3],
              marginBottom: DESIGN_SYSTEM.spacing[3]
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #34d399)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                📊
              </div>
              <div>
                <h4 style={{
                  margin: 0,
                  fontSize: DESIGN_SYSTEM.typography.fontSize.base,
                  fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
                  color: '#065f46'
                }}>
                  Métricas de Impacto
                </h4>
                <p style={{
                  margin: '4px 0 0 0',
                  fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                  color: '#047857'
                }}>
                  Información adicional del proyecto
                </p>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: DESIGN_SYSTEM.spacing[3]
            }}>
              {localPost.budget_approx && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: DESIGN_SYSTEM.spacing[3],
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{
                    fontSize: DESIGN_SYSTEM.typography.fontSize.xs,
                    color: '#6b7280',
                    marginBottom: DESIGN_SYSTEM.spacing[1],
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>💰</span> Presupuesto
                  </div>
                  <div style={{
                    fontSize: DESIGN_SYSTEM.typography.fontSize.lg,
                    fontWeight: DESIGN_SYSTEM.typography.fontWeight.bold,
                    color: '#1f2937'
                  }}>
                    {formatUSD(localPost.budget_approx)}
                  </div>
                </div>
              )}

              {(localPost.beneficiaries_men || localPost.beneficiaries_women) && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: DESIGN_SYSTEM.spacing[3],
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{
                    fontSize: DESIGN_SYSTEM.typography.fontSize.xs,
                    color: '#6b7280',
                    marginBottom: DESIGN_SYSTEM.spacing[1],
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>👥</span> Beneficiarios
                  </div>
                  <div style={{
                    fontSize: DESIGN_SYSTEM.typography.fontSize.lg,
                    fontWeight: DESIGN_SYSTEM.typography.fontWeight.bold,
                    color: '#1f2937'
                  }}>
                    {(localPost.beneficiaries_men || 0) + (localPost.beneficiaries_women || 0)}
                  </div>
                  <div style={{
                    fontSize: DESIGN_SYSTEM.typography.fontSize.xs,
                    color: '#9ca3af',
                    marginTop: '2px'
                  }}>
                    👨 {localPost.beneficiaries_men || 0} • 👩 {localPost.beneficiaries_women || 0}
                  </div>
                </div>
              )}

              {localPost.project_status && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: DESIGN_SYSTEM.spacing[3],
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{
                    fontSize: DESIGN_SYSTEM.typography.fontSize.xs,
                    color: '#6b7280',
                    marginBottom: DESIGN_SYSTEM.spacing[1],
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>📋</span> Estado
                  </div>
                  <div style={{
                    fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                    fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
                    color: '#1f2937',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 
                        localPost.project_status === 'planning' ? '#fbbf24' :
                        localPost.project_status === 'execution' ? '#3b82f6' :
                        localPost.project_status === 'completed' ? '#10b981' :
                        '#8b5cf6'
                    }} />
                    {localPost.project_status === 'planning' ? 'Planificación' :
                     localPost.project_status === 'execution' ? 'En ejecución' :
                     localPost.project_status === 'completed' ? 'Completado' : 'Escalando'}
                  </div>
                </div>
              )}

              {localPost.partners && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: DESIGN_SYSTEM.spacing[3],
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{
                    fontSize: DESIGN_SYSTEM.typography.fontSize.xs,
                    color: '#6b7280',
                    marginBottom: DESIGN_SYSTEM.spacing[1],
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>🤝</span> Aliados
                  </div>
                  <div style={{
                    fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
                    fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
                    color: '#1f2937',
                    lineHeight: '1.3'
                  }}>
                    {localPost.partners.split(',')[0].trim()}
                    {localPost.partners.split(',').length > 1 && (
                      <span style={{
                        fontSize: DESIGN_SYSTEM.typography.fontSize.xs,
                        color: '#6b7280',
                        marginLeft: '4px'
                      }}>
                        +{localPost.partners.split(',').length - 1} más
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {(localPost.images?.length > 0 || localPost.videos?.length > 0) && (
          <PostMedia 
            post={localPost}
            setImageModal={setImageModal}
          />
        )}

        {currentUser && currentUser.id !== localPost.user_id && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            marginBottom: '10px',
            padding: '0 16px'
          }}>
            <ReportButton 
              contentId={localPost.id}
              contentType="post"
              onReportSubmitted={() => console.log('Reporte de post enviado')}
            />
          </div>
        )}

        <PostFooter 
          post={localPost} 
          currentUser={currentUser} 
          onPostLike={onPostLike}
          showComments={showComments}
          setShowComments={setShowComments}
        />
        
        <CommentsSection
          post={localPost}
          currentUser={currentUser}
          onCommentAdded={onCommentAdded}
          onShowProfile={onShowProfile}
          onExpandComments={onExpandComments}
          showComments={showComments}
          setShowComments={setShowComments}
        />
      </Card>
    </>
  );
});

PostCard.displayName = 'PostCard';