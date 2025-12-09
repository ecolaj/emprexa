import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toggleCommentLike } from '../../services/commentLikeService';
import { Post, Comment, User } from '../../types';
import { COLORS } from '../../utils/constants';
import { supabase } from '../../services/supabaseService';
import { FormattedText } from '../../components/common/FormattedText';
import { useNavigation } from '../../contexts/NavigationContext';
import { processCommentHashtags } from '../../services/textProcessingService';
import { useCommentLikes } from '../../hooks/useCommentLikes';
import { createComment, deleteComment, updateComment } from '../../services/commentsService';
import { ReportButton } from '../common/ReportButton';

interface CommentsSectionProps {
  post: Post;
  onCommentAdded: (post: Post) => void;
  onShowProfile: (userId: string) => void;
  onExpandComments: (postId: string) => void;
  showComments: boolean; // 🆕 NUEVO
  setShowComments: (show: boolean) => void; // 🆕 NUEVO
}

export const CommentsSection = React.memo<CommentsSectionProps>(({
  post,
  onCommentAdded,
  onShowProfile,
  onExpandComments,
  showComments, // 🆕 NUEVO
  setShowComments, // 🆕 NUEVO
}) => {
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { navigateToHashtag, navigateToUserProfile } = useNavigation();
  const [commentsPage, setCommentsPage] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [totalCommentsCount, setTotalCommentsCount] = useState(post.comment_count || 0);
  const [isLoadingComments, setIsLoadingComments] = useState(false); // 🆕 NUEVO: Estado de carga

  // 🆕 OPTIMIZADO: Cargar usuario una sola vez
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, plan_type, avatar_url')
          .eq('id', session.user.id)
          .single();

        setCurrentUser({
          id: session.user.id,
          email: session.user.email!,
          username: profile?.username || session.user.email?.split('@')[0] || 'usuario',
          plan_type: profile?.plan_type || 'free',
          avatar_url: profile?.avatar_url || '',
        });
      }
    };
    fetchUser();
  }, []); // 🆕 Empty dependencies - solo al mount

  // 🆕 OPTIMIZADO: Cargar comentarios solo cuando sea necesario
  useEffect(() => {
    const loadComments = async () => {
      // 🆕 NUEVO: Prevenir carga si ya hay comentarios o ya se está cargando
      if (comments.length > 0 || isLoadingComments || !showComments) {
        return;
      }

      try {
        setIsLoadingComments(true);
        const realPostUUID = post.id;
        if (!realPostUUID) return;

        const { data, error, count } = await supabase
          .from('comments')
          .select(
            `
            *,
            profiles:user_id (
              username,
              plan_type,
              avatar_url
            )
          `,
          { count: 'exact' }
          )
          .eq('post_id', realPostUUID)
          .order('created_at', { ascending: true })
          .range(0, 49);

        if (error) throw error;

        if (data && data.length > 0) {
          const map = new Map<string, Comment>();
          const roots: Comment[] = [];

          data.forEach((c: any) => {
            const comment: Comment = {
              id: c.id,
              post_id: post.id,
              content: c.content,
              author: {
                username: c.profiles?.username || 'usuario',
                plan_type: c.profiles?.plan_type || 'free',
                avatar_url: c.profiles?.avatar_url || '',
              },
              created_at: c.created_at,
              like_count: c.like_count || 0,
              replies: [],
              user_id: c.user_id,
            };
            map.set(c.id, comment);
            if (!c.parent_comment_id) roots.push(comment);
          });

          data.forEach((c: any) => {
            if (c.parent_comment_id) {
              const parent = map.get(c.parent_comment_id);
              const child = map.get(c.id);
              if (parent && child) {
                if (!parent.replies) parent.replies = [];
                parent.replies.push(child);
              }
            }
          });

          roots.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setComments(roots);

          const realCommentCount = count || data.length;
          setTotalCommentsCount(realCommentCount);
          setHasMoreComments(realCommentCount > 50);
          
          if (realCommentCount !== post.comment_count) {
            onCommentAdded({
              ...post,
              comment_count: realCommentCount
            });
          }
        } else {
          setComments([]);
        }
      } catch (err) {
        console.error('Error cargando comentarios:', err);
      } finally {
        setIsLoadingComments(false);
      }
    };

    loadComments();
  }, [post.id, showComments, comments.length, isLoadingComments, onCommentAdded, post]); // 🆕 DEPENDENCIAS OPTIMIZADAS

  // 🆕 OPTIMIZADO: Colectar IDs de comentarios de forma eficiente
  const collectIds = useCallback((list: Comment[]): string[] => {
    const ids: string[] = [];
    const walk = (arr: Comment[]) => {
      arr.forEach((c) => {
        ids.push(c.id.toString());
        if (c.replies?.length) walk(c.replies);
      });
    };
    walk(list);
    return ids;
  }, []);

  const allIds = useMemo(() => collectIds(comments), [comments, collectIds]);
  const { likes: likeMap, counts: countMap, setLikes, setCounts } = useCommentLikes(allIds, currentUser?.id);

  // 🆕 OPTIMIZADO: Handler de likes memoizado
  const handleLike = useCallback(async (id: string) => {
    if (!currentUser) {
      alert('Debes iniciar sesión para dar like');
      return;
    }
  
    try {
      const currentLiked = likeMap[id] || false;
      const currentCount = countMap[id] || 0;
      
      setLikes((prev) => ({ ...prev, [id]: !currentLiked }));
      setCounts((prev) => ({ 
        ...prev, 
        [id]: currentCount + (currentLiked ? -1 : 1) 
      }));
  
      const { liked, newLikeCount } = await toggleCommentLike(id, currentUser.id);
      
      setLikes((prev) => ({ ...prev, [id]: liked }));
      setCounts((prev) => ({ ...prev, [id]: newLikeCount }));
  
    } catch (e: any) {
      const currentLiked = likeMap[id] || false;
      const currentCount = countMap[id] || 0;
      
      setLikes((prev) => ({ ...prev, [id]: currentLiked }));
      setCounts((prev) => ({ ...prev, [id]: currentCount }));
      
      console.error('❌ Error en handleLike:', e);
      alert('Error al dar like: ' + e.message);
    }
  }, [currentUser, likeMap, countMap, setLikes, setCounts]);

  // 🆕 OPTIMIZADO: Handler de envío de comentario memoizado
  const handleSubmitComment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    try {
      const realPostUUID = post.id;
      if (!realPostUUID) return alert('No se encontró el post');

      const data = await createComment(realPostUUID, currentUser.id, newComment);

      const comment: Comment = {
        id: data.id,
        post_id: post.id,
        content: data.content,
        author: {
          username: data.profiles?.username || currentUser.username,
          plan_type: data.profiles?.plan_type || 'free',
          avatar_url: data.profiles?.avatar_url || '',
        },
        created_at: data.created_at,
        like_count: data.like_count || 0,
        replies: [],
        user_id: currentUser.id,
      };

      setComments((prev) => [comment, ...prev]);
      
      setTimeout(() => {
        onCommentAdded({
          ...post,
          comment_count: (post.comment_count || 0) + 1
        });
      }, 100);
      
      setNewComment('');
      if (!showComments) setShowComments(true);

      await processCommentHashtags(data.id, newComment);
    } catch (err: any) {
      alert('Error al guardar comentario: ' + err.message);
    }
  }, [newComment, currentUser, post, onCommentAdded, showComments]);

  // 🆕 OPTIMIZADO: Cargar más comentarios memoizado
  const loadMoreComments = useCallback(async () => {
    if (!hasMoreComments || isLoadingComments) return;
    
    const nextPage = commentsPage + 1;
    const start = nextPage * 50;
    const end = start + 49;
    
    try {
      setIsLoadingComments(true);
      const { data, error } = await supabase
        .from('comments')
        .select(
          `
          *,
          profiles:user_id (
            username,
            plan_type,
            avatar_url
          )
        `
        )
        .eq('post_id', post.id)
        .order('created_at', { ascending: true })
        .range(start, end);

      if (error) throw error;

      if (data && data.length > 0) {
        const map = new Map<string, Comment>();
        const newRoots: Comment[] = [];

        data.forEach((c: any) => {
          const comment: Comment = {
            id: c.id,
            post_id: post.id,
            content: c.content,
            author: {
              username: c.profiles?.username || 'usuario',
              plan_type: c.profiles?.plan_type || 'free',
              avatar_url: c.profiles?.avatar_url || '',
            },
            created_at: c.created_at,
            like_count: c.like_count || 0,
            replies: [],
            user_id: c.user_id,
          };
          map.set(c.id, comment);
          if (!c.parent_comment_id) newRoots.push(comment);
        });

        data.forEach((c: any) => {
          if (c.parent_comment_id) {
            const parent = map.get(c.parent_comment_id);
            const child = map.get(c.id);
            if (parent && child) {
              if (!parent.replies) parent.replies = [];
              parent.replies.push(child);
            }
          }
        });

        setComments(prev => [...prev, ...newRoots]);
        setCommentsPage(nextPage);
        setHasMoreComments(totalCommentsCount > comments.length + data.length);
      }
    } catch (error) {
      console.error('Error cargando más comentarios:', error);
    } finally {
      setIsLoadingComments(false);
    }
  }, [hasMoreComments, isLoadingComments, commentsPage, post.id, totalCommentsCount, comments.length]);

  // 🆕 OPTIMIZADO: Handler de respuesta memoizado
  const handleReplySubmit = useCallback(async (parentId: string, content: string) => {
    if (!content.trim() || !currentUser) return;

    try {
      const realPostUUID = post.id;
      const realParentUUID = parentId;

      if (!realPostUUID) return alert('Error al encontrar post');

      const data = await createComment(realPostUUID, currentUser.id, content, realParentUUID);

      const reply: Comment = {
        id: data.id,
        post_id: post.id,
        content: data.content,
        author: {
          username: data.profiles?.username || currentUser.username,
          plan_type: data.profiles?.plan_type || 'free',
          avatar_url: data.profiles?.avatar_url || '',
        },
        created_at: data.created_at,
        like_count: data.like_count || 0,
        replies: [],
        user_id: currentUser.id,
      };

      setComments((prev) =>
        prev.map((c) =>
          c.id.toString() === parentId
            ? { ...c, replies: [...(c.replies || []), reply], showReply: false }
            : { ...c, showReply: false }
        )
      );

      setTimeout(() => {
        onCommentAdded({
          ...post,
          comment_count: (post.comment_count || 0) + 1
        });
      }, 100);

      await processCommentHashtags(data.id, content);
    } catch (err: any) {
      alert('Error al guardar respuesta: ' + err.message);
    }
  }, [currentUser, post, onCommentAdded]);

  // 🆕 OPTIMIZADO: Componente CommentItem memoizado
  const CommentItem = React.memo<{ c: Comment }>(({ c }) => {
    const [menu, setMenu] = useState(false);
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(c.content);

    const isAuthor = currentUser?.id === c.user_id;

    // 🆕 OPTIMIZADO: Handlers memoizados dentro del componente
    const handleDelete = useCallback(async () => {
      if (!confirm('¿Borrar este comentario?')) return;
      const uuid = c.id.toString();
      if (!uuid) return;
      
      setTimeout(() => {
        onCommentAdded({
          ...post,
          comment_count: Math.max(0, (post.comment_count || 0) - 1)
        });
      }, 100);
      
      await deleteComment(uuid);
      setComments((prev) => prev.filter((x) => x.id !== c.id));
    }, [c.id, onCommentAdded, post]);

    const handleSave = useCallback(async () => {
      const uuid = c.id.toString();
      if (!uuid) return;
      await updateComment(uuid, text);
      setEditing(false);
      setComments((prev) => prev.map((x) => (x.id === c.id ? { ...x, content: text } : x)));
    }, [c.id, text]);

    const handleMenuToggle = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setMenu(prev => !prev);
    }, []);

    const handleEdit = useCallback(() => {
      setMenu(false);
      setEditing(true);
    }, []);

    const handleCancelEdit = useCallback(() => {
      setEditing(false);
      setText(c.content);
    }, [c.content]);

    const handleProfileClick = useCallback(() => {
      onShowProfile(c.author.username);
    }, [c.author.username, onShowProfile]);

    const handleToggleReply = useCallback(() => {
      setComments((prev) =>
        prev.map((x) =>
          x.id === c.id ? { ...x, showReply: !(x as any).showReply } : { ...x, showReply: false }
        )
      );
    }, [c.id]);

    // 🆕 NUEVO: Cerrar menú al hacer click fuera
    useEffect(() => {
      const handleClickOutside = () => {
        if (menu) {
          setMenu(false);
        }
      };

      if (menu) {
        document.addEventListener('click', handleClickOutside);
        return () => {
          document.removeEventListener('click', handleClickOutside);
        };
      }
    }, [menu]);

    if (editing) {
      return (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: c.author.avatar_url ? 'transparent' : COLORS.secondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: COLORS.white,
              fontWeight: 'bold',
              fontSize: '14px',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            {c.author.avatar_url ? (
              <img src={c.author.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              c.author.username.charAt(0).toUpperCase()
            )}
          </div>
          <div style={{ flex: 1 }}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: `1px solid ${COLORS.accent}`,
                borderRadius: '6px',
                fontSize: '13px',
                fontFamily: 'Arial, sans-serif',
                resize: 'vertical',
                minHeight: '60px',
              }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button
                onClick={handleSave}
                style={{
                  background: COLORS.primary,
                  color: COLORS.white,
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                Guardar
              </button>
              <button
                onClick={handleCancelEdit}
                style={{
                  background: COLORS.gray,
                  color: COLORS.white,
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <div
          onClick={handleProfileClick}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: c.author.avatar_url ? 'transparent' : COLORS.secondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: COLORS.white,
            fontWeight: 'bold',
            fontSize: '14px',
            flexShrink: 0,
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          {c.author.avatar_url ? (
            <img src={c.author.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            c.author.username.charAt(0).toUpperCase()
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                onClick={handleProfileClick}
                style={{ fontSize: '14px', color: COLORS.primary, fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
              >
                @{c.author.username}
              </span>
              {c.author.plan_type === 'premium' && (
                <span
                  style={{
                    fontSize: '10px',
                    color: COLORS.white,
                    backgroundColor: COLORS.success,
                    padding: '1px 6px',
                    borderRadius: '8px',
                    fontWeight: '600',
                  }}
                >
                  ⭐
                </span>
              )}
              <span style={{ fontSize: '11px', color: COLORS.gray }}>
                {new Date(c.created_at).toLocaleDateString('es-ES')} a las{' '}
                {new Date(c.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {isAuthor && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={handleMenuToggle}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: COLORS.gray,
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '2px 6px',
                  }}
                >
                  ⋮
                </button>
                {menu && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      backgroundColor: '#fff',
                      border: `1px solid ${COLORS.accent}99`,
                      borderRadius: '6px',
                      boxShadow: '0 2px 8px rgba(0,0,0,.15)',
                      zIndex: 10,
                      minWidth: '90px',
                    }}
                  >
                    <div
                      onClick={handleEdit}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        borderBottom: `1px solid ${COLORS.accent}33`,
                      }}
                    >
                      Editar
                    </div>
                    <div
                      onClick={handleDelete}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        color: COLORS.danger,
                      }}
                    >
                      Borrar
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '8px' }}>
            <FormattedText text={c.content} onHashtagClick={navigateToHashtag} onMentionClick={navigateToUserProfile} />
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
  <button
    onClick={() => handleLike(c.id.toString())}
    style={{
      background: 'none',
      border: 'none',
      color: likeMap[c.id.toString()] ? COLORS.danger : COLORS.gray,
      cursor: 'pointer',
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    }}
  >
    {likeMap[c.id.toString()] ? '❤️' : '🤍'} {countMap[c.id.toString()] || 0}
  </button>
  {!c.parent_comment_id && (
    <button
      onClick={handleToggleReply}
      style={{
        background: 'none',
        border: 'none',
        color: COLORS.gray,
        cursor: 'pointer',
        fontSize: '12px',
      }}
    >
      Responder
    </button>
  )}
  
  {/* 🆕 BOTÓN DE REPORTAR PARA COMENTARIOS */}
  {currentUser && currentUser.id !== c.user_id && (
    <ReportButton 
      contentId={c.id}
      contentType="comment"
      onReportSubmitted={() => console.log('Reporte de comentario enviado')}
      buttonStyle="text"
    />
  )}
</div>

          {(c as any).showReply && (
            <div style={{ marginTop: '10px', paddingLeft: '10px', borderLeft: `2px solid ${COLORS.accent}33` }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: currentUser?.avatar_url ? 'transparent' : COLORS.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: COLORS.primary,
                    fontWeight: 'bold',
                    fontSize: '12px',
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}
                >
                  {currentUser?.avatar_url ? (
                    <img src={currentUser.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    currentUser?.username?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <textarea
                    placeholder="Escribe una respuesta..."
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: `1px solid ${COLORS.accent}`,
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontFamily: 'Arial, sans-serif',
                      resize: 'vertical',
                      minHeight: '40px',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                    <button
                      onClick={(e) => {
                        const textarea = e.currentTarget.parentElement?.parentElement?.querySelector('textarea') as HTMLTextAreaElement;
                        const content = textarea.value.trim();
                        if (content) {
                          handleReplySubmit(c.id.toString(), content);
                          textarea.value = '';
                        }
                      }}
                      style={{
                        background: COLORS.primary,
                        color: COLORS.white,
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}
                    >
                      Responder
                    </button>
                    <button
                      onClick={handleToggleReply}
                      style={{
                        background: COLORS.gray,
                        color: COLORS.white,
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {c.replies && c.replies.length > 0 && (
            <div style={{ marginTop: '10px', paddingLeft: '20px', borderLeft: `2px solid ${COLORS.accent}33` }}>
              {c.replies.map((reply) => (
                <CommentItem key={reply.id} c={reply} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  });

  // 🆕 NUEVO: Display name para mejor debugging
  CommentItem.displayName = 'CommentItem';

  return (
    <div style={{ marginTop: '15px' }} id={`comments-${post.id}`}>
      {showComments && (
        <div style={{ marginTop: '15px' }}>
          <form onSubmit={handleSubmitComment} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: currentUser?.avatar_url ? 'transparent' : COLORS.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: COLORS.primary,
                  fontWeight: 'bold',
                  fontSize: '14px',
                  flexShrink: 0,
                  overflow: 'hidden',
                }}
              >
                {currentUser?.avatar_url ? (
                  <img src={currentUser.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  currentUser?.username?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <div style={{ flex: 1 }}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe un comentario..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${COLORS.accent}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'Arial, sans-serif',
                    resize: 'vertical',
                    minHeight: '60px',
                  }}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  style={{
                    marginTop: '8px',
                    background: COLORS.primary,
                    color: COLORS.white,
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '600',
                    opacity: newComment.trim() ? 1 : 0.6,
                  }}
                >
                  Comentar
                </button>
              </div>
            </div>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {comments.map((comment) => (
              <CommentItem key={comment.id} c={comment} />
            ))}
            
            {hasMoreComments && (
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                  onClick={loadMoreComments}
                  disabled={isLoadingComments}
                  style={{
                    background: COLORS.primary,
                    color: COLORS.white,
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    cursor: isLoadingComments ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    opacity: isLoadingComments ? 0.6 : 1,
                  }}
                >
                  {isLoadingComments ? 'Cargando...' : `Cargar más comentarios (${totalCommentsCount - comments.length} restantes)`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

// 🆕 NUEVO: Display name para mejor debugging
CommentsSection.displayName = 'CommentsSection';