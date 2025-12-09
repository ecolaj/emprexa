import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

// ==============================================
// SERVICIOS
// ==============================================

import { 
  checkUserLiked, 
  togglePostLike, 
  getPostLikeCount, 
  mapNumericIdToUUID 
} from './services/likeService';
import { processPostHashtags, processPostMentions } from './services/textProcessingService';
import { uploadAvatar, uploadPostImages } from './services/imageService';

// ==============================================
// TIPOS
// ==============================================
import { Post, User, ImageModalState } from './types';

// ==============================================
// CONSTANTES
// ==============================================
import { COLORS } from './utils/constants';
import { DESIGN_SYSTEM } from './utils/designSystem';

// ==============================================
// COMPONENTES COMUNES
// ==============================================
import { ODSBadge } from './components/common/ODSBadge';
import { WelcomeScreen } from './components/common/WelcomeScreen';
import { InfoODSScreen } from './components/common/InfoODSScreen';
import { InfoEmprexaScreen } from './components/common/InfoEmprexaScreen';
import { InfiniteScrollObserver } from './components/common/InfiniteScrollObserver';
import { Toast } from './components/common/Toast';
import { Header } from './components/common/Header';
import { FormattedText } from './components/common/FormattedText';

// ==============================================
// COMPONENTES DE POSTS
// ==============================================
import { PostFooter } from './components/posts/PostFooter';
import { PostMedia } from './components/posts/PostMedia';
import { CommentsSection } from './components/posts/CommentsSection';
import { PostCard } from './components/posts/PostCard';

// ==============================================
// CONTEXTOS
// ==============================================
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';

// ==============================================
// COMPONENTES UI
// ==============================================
import { Button } from './components/ui/Button/Button';
import { Card } from './components/ui/Card/Card';
import { Avatar } from './components/ui/Avatar/Avatar';

// ==============================================
// COMPONENTES DE NAVEGACIÓN (HASHTAGS Y MENCIONES)
// ==============================================
import { HashtagFeed } from './components/hashtag/HashtagFeed';
import { UserProfileFeed } from './components/profile/UserProfileFeed';
import { ODSFeed } from './components/ods/ODSFeed';
import { UserPublicProfile } from './components/profile/UserPublicProfile';

// ==============================================
// MODALES
// ==============================================
import { AuthModal } from './components/modals/AuthModal';
import { CreatePostModal } from './components/modals/CreatePostModal';
import { UserProfileModal } from './components/modals/UserProfileModal';
import { ImageViewerModal } from './components/modals/ImageViewerModal';
import { PricingPage } from './pages/PricingPage';

// ==============================================
// DASHBOARD PREMIUM
// ==============================================
import { DashboardPage } from './components/dashboard/DashboardPage';

// ==============================================
// HOOKS
// ==============================================
import { useRealtimeNotifications } from './hooks/useRealtimeNotifications';

// ==============================================
// COMPONENTE INTERNO CON NAVEGACIÓN
// ==============================================

function AppContent() {
  const { currentView, currentHashtag, currentUserProfile, currentODS, currentUsername, navigateToHashtag, navigateToUserProfile, navigateToODS, navigateToUserPublic, navigateToDashboard } = useNavigation();

  // Exponer navegación real para el dashboard
  React.useEffect(() => {
    window.__realNavigation = { navigateToDashboard };
    return () => {
      window.__realNavigation = null;
    };
  }, [navigateToDashboard]);

  // ==============================================
  // ESTADOS
  // ==============================================
  
  // Estado de posts y carga
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usarDatosReales, setUsarDatosReales] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [postsPerPage] = useState(10);

  // Estado de autenticación y usuario
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Estado de toast notifications
const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  });

  // 🆕 NUEVO: Estado para prevenir doble envío
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado de pantallas informativas
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'ods-info' | 'emprexa-info'>('welcome');
  
  // Estado de modales
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [profileModal, setProfileModal] = useState({
    isOpen: false,
    userId: ''
  });
  const [imageModal, setImageModal] = useState<ImageModalState>({
    isOpen: false,
    images: [],
    currentIndex: 0
  });
  
  // Referencias
  const hasLoaded = useRef(false);
  const postsLoadedRef = useRef<Set<string>>(new Set()); // 🆕 NUEVO: Track posts ya cargados

  // ==============================================
  // FUNCIONES PRINCIPALES - MEMOIZADAS
  // ==============================================

  /**
   * Verifica qué posts tienen like del usuario actual
   */
  const verifyUserLikesForPosts = useCallback(async (postsToVerify: Post[], userId: string) => {
    try {
      console.log('🔍 Verificando likes del usuario para', postsToVerify.length, 'posts');
      
      // 🆕 OPTIMIZACIÓN: Solo verificar posts que no tengan like verificado
      const postsToCheck = postsToVerify.filter(post => 
        post.user_has_liked === undefined || post.user_has_liked === false
      );
      
      if (postsToCheck.length === 0) {
        console.log('✅ Todos los posts ya tienen like verificado');
        return;
      }
      
      const postIds = postsToCheck.map(post => post.id);
      
      const { data: userLikes, error } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', userId)
        .in('post_id', postIds);

      if (error) {
        console.error('Error verificando likes:', error);
        return;
      }

      const likedPostIds = new Set(userLikes?.map(like => like.post_id) || []);
      
      setPosts(prevPosts => 
        prevPosts.map(post => ({
          ...post,
          user_has_liked: likedPostIds.has(post.id)
        }))
      );

      console.log('✅ Likes verificados:', likedPostIds.size, 'posts con like');
      
    } catch (error) {
      console.error('Error en verifyUserLikesForPosts:', error);
    }
  }, []);

  /**
   * Maneja el like/unlike de un post
   */
  const handlePostLike = useCallback(async (postId: string, liked: boolean) => {
    if (!currentUser) return;

    try {
      console.log('❤️  Actualizando like para post:', postId, 'liked:', liked);
      
      // Actualizar estado inmediatamente (optimistic update)
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                user_has_liked: liked,
                like_count: liked ? post.like_count + 1 : Math.max(0, post.like_count - 1)
              }
            : post
        )
      );

      // Ejecutar la operación en BD
      await togglePostLike(postId, currentUser.id);
      
      console.log('✅ Like sincronizado con BD correctamente');

    } catch (error) {
      console.error('❌ Error en handlePostLike:', error);
      
      // Revertir en caso de error
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                user_has_liked: !liked,
                like_count: liked ? Math.max(0, post.like_count - 1) : post.like_count + 1
              }
            : post
        )
      );
      
      alert('No se pudo actualizar el like. Intenta nuevamente.');
    }
  }, [currentUser]);

  /**
   * Carga los comentarios para un post específico
   */
  const loadPostComments = useCallback(async (postId: string): Promise<any[]> => {
    try {
      console.log(`💬 Cargando comentarios para post: ${postId}`);
      
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            username,
            plan_type,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedComments = (commentsData || []).map(comment => ({
        id: comment.id,
        post_id: comment.post_id,
        content: comment.content,
        author: {
          username: comment.profiles?.username || 'usuario',
          plan_type: comment.profiles?.plan_type || 'free',
          avatar_url: comment.profiles?.avatar_url || ''
        },
        created_at: comment.created_at,
        like_count: comment.like_count || 0,
        replies: []
      }));

      console.log(`✅ Comentarios cargados: ${formattedComments.length} para post ${postId}`);
      return formattedComments;

    } catch (error) {
      console.error(`❌ Error cargando comentarios para post ${postId}:`, error);
      return [];
    }
  }, []);

  /**
   * Expande comentarios para un post
   */
  const handleExpandComments = useCallback(async (postId: string) => {
    try {
      // Encontrar el post en el estado actual
      const postIndex = posts.findIndex(post => post.id.toString() === postId.toString());
      if (postIndex === -1) return;

      // Verificar si ya tiene comentarios cargados
      const currentPost = posts[postIndex];
      if (currentPost.comments && currentPost.comments.length > 0) {
        console.log(`✅ Comentarios ya cargados para post ${postId}`);
        return;
      }

      // 🆕 NUEVO: Marcar que estamos cargando comentarios para evitar loops
      if (currentPost._loadingComments) {
        console.log(`⏳ Comentarios ya cargándose para post ${postId}`);
        return;
      }

      console.log(`🔄 Expandiendo comentarios para post: ${postId}`);

      // Marcar como cargando
      const updatedPosts = [...posts];
      updatedPosts[postIndex] = {
        ...currentPost,
        _loadingComments: true
      };

      setPosts(updatedPosts);

      // Cargar comentarios usando el UUID real
      const comments = await loadPostComments(postId);

      // Actualizar el post con los comentarios cargados
      updatedPosts[postIndex] = {
        ...currentPost,
        comments: comments,
        comment_count: comments.length,
        _loadingComments: false
      };

      setPosts(updatedPosts);
      console.log(`✅ Comentarios actualizados para post ${postId}: ${comments.length} comentarios`);

    } catch (error) {
      console.error(`❌ Error expandiendo comentarios para post ${postId}:`, error);
      // En caso de error, quitar marca de cargando
      const postIndex = posts.findIndex(post => post.id.toString() === postId.toString());
      if (postIndex !== -1) {
        const updatedPosts = [...posts];
        updatedPosts[postIndex] = {
          ...posts[postIndex],
          _loadingComments: false
        };
        setPosts(updatedPosts);
      }
    }
  }, [posts, loadPostComments]);

  /**
   * Carga posts con paginación
   */
  const loadPosts = useCallback(async (page: number = 0) => {
    // 🆕 NUEVO: Prevenir carga duplicada durante transiciones
    if (page === 0 && hasLoaded.current && posts.length > 0 && currentView === 'main') {
      console.log('⏭️  Saltando carga inicial - ya hay posts cargados');
      setLoading(false);
      return;
    }

    console.log(`🔍 CARGANDO PÁGINA ${page}, postsPerPage: ${postsPerPage}`);

    if (page === 0) {
      hasLoaded.current = true;
      setLoading(true);
      postsLoadedRef.current.clear(); // 🆕 Limpiar tracking al cargar página 0
    } else {
      setLoadingMore(true);
    }

    try {
      const { data: postsData, error, count } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            username,
            plan_type,
            avatar_url
          ),
          user_id
        `, { count: 'exact' })
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(page * postsPerPage, (page + 1) * postsPerPage - 1);

      if (error) throw error;

      const totalPosts = count || 0;
      const loadedPostsCount = (page + 1) * postsPerPage;
      setHasMorePosts(loadedPostsCount < totalPosts);

      console.log(`✅ Página ${page} cargada: ${postsData?.length || 0} posts`);
      console.log(`📊 Total posts: ${totalPosts}, Hay más: ${loadedPostsCount < totalPosts}`);

      if (postsData && postsData.length > 0) {
        // 1. CARGAR ODS SOLO PARA LOS POSTS DE ESTA PÁGINA
        const postIds = postsData.map(post => post.id);
        const { data: postOdsData, error: odsError } = await supabase
          .from('post_ods')
          .select(`
            post_id,
            ods:ods_id (
              id,
              numero,
              nombre,
              color_principal
            )
          `)
          .in('post_id', postIds);

        if (odsError) throw odsError;

        // 2. AGRUPAR ODS POR POST_ID
        const odsByPostId: { [key: string]: any[] } = {};
        if (postOdsData) {
          postOdsData.forEach(item => {
            if (!odsByPostId[item.post_id]) {
              odsByPostId[item.post_id] = [];
            }
            if (item.ods) {
              odsByPostId[item.post_id].push(item.ods);
            }
          });
        }

        const postsReales: Post[] = postsData.map(post => {
          const postOds = odsByPostId[post.id] || [];
          
          return {
            id: post.id,
            title: post.title || '',
            content: post.content_text || '',
            ods: postOds.map(ods => ({
              id: ods.id,
              numero: ods.numero,
              nombre: ods.nombre,
              color_principal: ods.color_principal
            })),
            like_count: post.like_count || 0,
            comment_count: post.comment_count || 0,
            author: {
              username: post.profiles?.username || 'usuario',
              plan_type: post.profiles?.plan_type || 'free',
              avatar_url: post.profiles?.avatar_url || ''
            },
            images: post.image_urls || [],
            videos: post.video_url ? [post.video_url] : [],
            created_at: post.created_at,
            comments: [],
            user_id: post.user_id,
            user_has_liked: false,
            // 🆕 CRÍTICO: AÑADIR LOS NUEVOS CAMPOS AQUÍ
            budget_approx: post.budget_approx || null,
            beneficiaries_men: post.beneficiaries_men || 0,
            beneficiaries_women: post.beneficiaries_women || 0,
            partners: post.partners || null,
            project_status: post.project_status || 'planning'
          };
        });

        // 🆕 NUEVO: Lógica explícita de reemplazo/agregado con prevención de duplicados
        if (page === 0) {
          console.log('🔄 Reemplazando TODOS los posts con nueva página 0');
          setPosts(postsReales);
        } else {
          console.log('📥 Agregando posts de página', page, 'a los existentes');
          setPosts(prevPosts => {
            const existingIds = new Set(prevPosts.map(p => p.id));
            const newPosts = postsReales.filter(post => !existingIds.has(post.id));
            return [...prevPosts, ...newPosts];
          });
        }

        // 🆕 CRÍTICO: VERIFICAR LIKES SOLO SI HAY USUARIO Y POSTS
        if (currentUser && postsReales.length > 0) {
          console.log('🔍 Verificando likes para usuario:', currentUser.id);
          // Usar setTimeout para no bloquear el render inicial
          setTimeout(() => {
            verifyUserLikesForPosts(postsReales, currentUser.id);
          }, 100);
        }

      } else {
        if (page === 0) setPosts([]);
        console.log('📭 No hay posts para cargar');
      }
    } catch (error) {
      console.error('❌ Error cargando posts:', error);
      if (page === 0) setPosts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [currentUser, currentView, posts.length, postsPerPage, verifyUserLikesForPosts]);

  /**
   * Carga la siguiente página de posts
   */
  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMorePosts) return;
    
    const nextPage = currentPage + 1;
    console.log(`🔄 Cargando más posts automáticamente, página: ${nextPage}`);
    
    setCurrentPage(nextPage);
    await loadPosts(nextPage);
  }, [currentPage, hasMorePosts, loadingMore, loadPosts]);

  /**
   * Muestra una notificación toast
   */
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      isVisible: true,
      message,
      type
    });
  }, []);

  // ==============================================
  // EFECTOS PRINCIPALES - OPTIMIZADOS
  // ==============================================

  // 🆕 NUEVO: Verificar sesión existente al cargar - EFECTO ÚNICO
  useEffect(() => {
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('plan_type, username, avatar_url')
          .eq('id', session.user.id)
          .single();

        const userWithPlan: User = {
          id: session.user.id,
          email: session.user.email!,
          username: profileData?.username || session.user.email!.split('@')[0],
          plan_type: profileData?.plan_type || 'free',
          avatar_url: profileData?.avatar_url || ''
        };
      
        setCurrentUser(userWithPlan);
        // Suscripción a notificaciones realtime (una sola vez)
        useRealtimeNotifications(userWithPlan.id);
      } else {
        console.log('📭 No hay sesión activa');
        setCurrentUser(null);
      }
    };

    checkExistingSession();
  }, []); // 🆕 NUEVO: Empty dependencies - solo al mount

  // 🆕 NUEVO: Cargar posts cuando cambiar usarDatosReales - EFECTO SEPARADO
  useEffect(() => {
    if (usarDatosReales && !hasLoaded.current) {
      console.log('🎯 INICIANDO CARGA INICIAL DE POSTS desde useEffect');
      hasLoaded.current = true;
      setCurrentPage(0);
      setHasMorePosts(true);
      setPosts([]);
      loadPosts(0);
    }
  }, [usarDatosReales, loadPosts]);

  // 🆕 NUEVO: Configurar funciones globales para los botones informativos
  useEffect(() => {
    (window as any).showODSInfo = () => setCurrentScreen('ods-info');
    (window as any).showEmprexaInfo = () => setCurrentScreen('emprexa-info');
    
    return () => {
      (window as any).showODSInfo = undefined;
      (window as any).showEmprexaInfo = undefined;
    };
  }, []);

  // ==============================================
  // MANEJADORES DE EVENTOS PRINCIPALES - MEMOIZADOS
  // ==============================================

  /**
   * Maneja el éxito de autenticación
   */
  const handleAuthSuccess = useCallback(async (user: User) => {
    try {
      console.log('Buscando en profiles el UUID:', user.id);

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('plan_type, username, avatar_url')
        .eq('id', user.id)
        .single();

      console.log('Resultado de la query:', { data: profileData, error: JSON.stringify(error) });

      if (error && error.code !== 'PGRST116') throw error;

      const plan_type = profileData?.plan_type ?? 'free';
      const username = profileData?.username ?? user.email.split('@')[0];
      const avatar_url = profileData?.avatar_url ?? '';

      const userWithRealData = {
        ...user,
        username,
        plan_type,
        avatar_url
      };

      setCurrentUser(userWithRealData);
      setShowAuthModal(false);
      console.log('Usuario autenticado CON PLAN REAL:', userWithRealData);

    } catch (err) {
      console.error('Error en handleAuthSuccess:', err);
      setCurrentUser({ ...user, plan_type: 'free', avatar_url: '' });
      setShowAuthModal(false);
    }
  }, []);

  /**
   * Maneja el cierre de sesión
   */
  const handleLogout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error);
    } else {
      setCurrentUser(null);
      setPosts([]); // 🆕 NUEVO: Limpiar posts al logout
      hasLoaded.current = false;
    }
  }, []);

  /**
   * Maneja la creación de posts
   */
  const handleCreatePost = useCallback((createdPost: Post) => {
    setPosts(prevPosts => [createdPost, ...prevPosts]);
  }, []);

  // ==============================================
  // RENDERIZADO CONDICIONAL POR VISTA
  // ==============================================

  /**
   * Renderiza el header con navegación dinámica
   */
  const renderHeader = useCallback(() => {
    return (
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenCreatePost={() => setShowCreatePostModal(true)}
        onOpenProfile={(userId) => setProfileModal({ isOpen: true, userId })}
      />
    );
  }, [currentUser, handleLogout]);

  /**
   * Renderiza el feed principal
   */
  const renderMainFeed = useCallback(() => {
    return (
      <main style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        {/* Indicador de estado - solo mostrar en vista principal con usuario */}
        {currentUser && (
          <div style={{
            marginBottom: '30px',
            padding: '15px',
            backgroundColor: COLORS.light,
            borderRadius: '10px',
            border: `1px solid ${COLORS.accent}`
          }}>
            <div>
              <strong style={{ color: COLORS.primary }}>
                Bienvenido, {currentUser.username}
              </strong>
              <div style={{ fontSize: '14px', color: COLORS.gray, marginTop: '5px' }}>
                Actualmente hay {posts.length} historias compartidas en Emprexa
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: DESIGN_SYSTEM.colors.text.secondary
          }}>
            <div style={{ 
              fontSize: '48px', 
              marginBottom: DESIGN_SYSTEM.spacing[4],
              animation: 'spin 2s linear infinite'
            }}>🌱</div>
            <div style={{
              fontSize: DESIGN_SYSTEM.typography.fontSize.lg,
              fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
              marginBottom: DESIGN_SYSTEM.spacing[2]
            }}>
              Cargando proyectos inspiradores
            </div>
            <div style={{
              fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
              color: DESIGN_SYSTEM.colors.text.secondary
            }}>
              Conectando con la comunidad de innovadores...
            </div>
          </div>
        )}

        {/* Lista de Posts */}
        {!loading && posts.length === 0 && currentView === 'main' && (
          <Card variant="filled" padding="lg">
            <div style={{ 
              textAlign: 'center', 
              padding: DESIGN_SYSTEM.spacing[12]
            }}>
              <div style={{ 
                fontSize: '64px', 
                marginBottom: DESIGN_SYSTEM.spacing[6]
              }}>🌍</div>
              <h3 style={{ 
                color: DESIGN_SYSTEM.colors.text.primary,
                fontSize: DESIGN_SYSTEM.typography.fontSize.xl,
                fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
                marginBottom: DESIGN_SYSTEM.spacing[3]
              }}>
                Bienvenido a la comunidad
              </h3>
              <p style={{ 
                marginBottom: DESIGN_SYSTEM.spacing[6],
                color: DESIGN_SYSTEM.colors.text.secondary,
                fontSize: DESIGN_SYSTEM.typography.fontSize.base,
                lineHeight: DESIGN_SYSTEM.typography.lineHeight.relaxed
              }}>
                Sé el primero en compartir un proyecto inspirador para los Objetivos de Desarrollo Sostenible.
              </p>
              {currentUser?.plan_type === 'premium' && (
                <Button 
                  onClick={() => setShowCreatePostModal(true)}
                  size="lg"
                >
                  ✨ Crear el primer proyecto
                </Button>
              )}
            </div>
          </Card>
        )}

        {!loading && posts.length > 0 && currentView === 'main' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onShowProfile={(userId) => setProfileModal({ isOpen: true, userId })}
                setImageModal={setImageModal}
                onExpandComments={handleExpandComments}
                onCommentAdded={(updatedPost) => {
                  if (updatedPost._deleted) {
                    setPosts(prev => prev.filter(p => p.id !== updatedPost.id));
                  } else {
                    setPosts(prev => prev.map(p => 
                      p.id === updatedPost.id ? updatedPost : p
                    ));
                  }
                }}
                loadCommentsInitially={post.comment_count > 0 && (!post.comments || post.comments.length === 0)}
                onPostLike={handlePostLike}
              />
            ))}
          </div>
        )}
        
        {/* 🆕 OBSERVADOR DE SCROLL INFINITO - solo en vista principal */}
        {currentView === 'main' && (
          <InfiniteScrollObserver 
            onLoadMore={loadMorePosts}
            hasMore={hasMorePosts}
            loading={loadingMore}
          />
        )}
      </main>
    );
  }, [currentUser, currentView, loading, posts, handleExpandComments, handlePostLike, loadMorePosts, hasMorePosts, loadingMore]);

  /**
   * Renderiza el contenido principal basado en la vista actual
   */
  const renderMainContent = useCallback(() => {
    if (currentView === 'dashboard') {
      return <DashboardPage currentUser={currentUser} />;
    }
  
    switch (currentView) {
      case 'hashtag':
        return (
          <HashtagFeed 
            hashtag={currentHashtag}
            currentUser={currentUser}
            onShowProfile={(userId) => setProfileModal({ isOpen: true, userId })}
            setImageModal={setImageModal}
            onPostLike={handlePostLike}
          />
        );

      case 'ods':
        return (
          <ODSFeed
            odsNumero={currentODS!}
            currentUser={currentUser}
            onShowProfile={(userId) => setProfileModal({ isOpen: true, userId })}
            setImageModal={setImageModal}
            onPostLike={handlePostLike}
          />
        );

      case 'user-public':
        return (
          <UserPublicProfile
            username={currentUsername!}
            currentUser={currentUser}
            onShowProfile={(userId) => setProfileModal({ isOpen: true, userId })}
            setImageModal={setImageModal}
            onPostLike={handlePostLike}
          />
        );

      case 'user-profile':
        return (
          <UserProfileFeed 
            username={currentUserProfile}
            currentUser={currentUser}
            onShowProfile={(userId) => setProfileModal({ isOpen: true, userId })}
            setImageModal={setImageModal}
            onPostLike={handlePostLike}
          />
        );
        case 'pricing':  // ← NUEVO CASE
        return (
          <PricingPage 
            currentUserPlan={currentUser?.plan_type || 'free'} 
          />
        );
      case 'main':
      default:
        return renderMainFeed();
    }
  }, [currentView, currentHashtag, currentODS, currentUsername, currentUserProfile, currentUser, handlePostLike, renderMainFeed]);

  // ==============================================
  // RENDER PRINCIPAL DEL COMPONENTE INTERNO
  // ==============================================

  return (
    <div className="App">
      {currentUser ? (
        // INTERFAZ PRINCIPAL (usuario logueado)
        <>
          {renderHeader()}
          {renderMainContent()}
        </>
      ) : (
        // PANTALLA DE BIENVENIDA O INFORMATIVA (usuario NO logueado)
        <>
          {currentScreen === 'welcome' && (
            <WelcomeScreen onShowAuthModal={() => setShowAuthModal(true)} />
          )}
          {currentScreen === 'ods-info' && (
            <InfoODSScreen onBack={() => setCurrentScreen('welcome')} />
          )}
          {currentScreen === 'emprexa-info' && (
            <InfoEmprexaScreen onBack={() => setCurrentScreen('welcome')} />
          )}
        </>
      )}

      {/* ============================================== */}
      {/* MODALES (se mantienen igual) */}
      {/* ============================================== */}

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <CreatePostModal 
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        onPostCreated={handleCreatePost}
        showToast={showToast}
      />

      <UserProfileModal
        isOpen={profileModal.isOpen}
        onClose={() => setProfileModal({ isOpen: false, userId: '' })}
        userId={profileModal.userId}
        currentUserId={currentUser?.id || ''}
        onProfileUpdate={(updatedProfile) => {
          if (currentUser && currentUser.id === updatedProfile.id) {
            const oldUsername = currentUser.username;
            const newUsername = updatedProfile.username;
            
            setCurrentUser(prev => prev ? {
              ...prev,
              username: newUsername,
              plan_type: updatedProfile.plan_type,
              avatar_url: updatedProfile.avatar_url
            } : prev);
            
            console.log(`✅ Usuario actualizado: ${oldUsername} → ${newUsername}`);
          }
        }}
      />

      <ImageViewerModal 
        imageModal={imageModal} 
        setImageModal={setImageModal} 
      />
      
      {/* 🆕 NUEVO: Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
        duration={4000}
      />
    </div>
  );
}

// ==============================================
// COMPONENTE PRINCIPAL APP (WRAPPER CON PROVIDERS)
// ==============================================

function App() {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  );
}

export default App;