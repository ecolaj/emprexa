import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Post, User } from '../../types';
import { COLORS } from '../../utils/constants';
import { PostCard } from '../posts/PostCard';
import { FriendshipButton } from '../common/FriendshipButton';
import { getPlanBadgeData, normalizePlanType } from '../../utils/permissionUtils';

interface UserProfileFeedProps {
  username: string;
  currentUser: User | null;
  setImageModal: React.Dispatch<React.SetStateAction<{
    isOpen: boolean;
    images: string[];
    currentIndex: number;
  }>>;
  onShowProfile: (userId: string) => void;
  onPostLike?: (postId: string, liked: boolean) => void;
}

// Componente interno para el badge del plan
const PlanBadge = ({ planType }: { planType: string }) => {
  const normalizedType = normalizePlanType(planType || 'free');
  const badgeData = getPlanBadgeData(normalizedType, 'md');
  
  if (!badgeData) return null;
  
  return (
    <div style={{
      ...badgeData.style,
      marginBottom: '15px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
    }}>
      <span style={{ fontSize: badgeData.iconSize }}>{badgeData.icon}</span>
      {badgeData.text}
    </div>
  );
};

// Componente de carga
const LoadingState = () => (
  <div style={{ 
    textAlign: 'center', 
    padding: '40px',
    color: COLORS.primary
  }}>
    <div style={{ fontSize: '18px', marginBottom: '10px' }}>🔄</div>
    <div>Cargando perfil...</div>
  </div>
);

// Componente de usuario no encontrado
const UserNotFound = ({ username }: { username: string }) => (
  <div style={{ 
    textAlign: 'center', 
    padding: '60px 20px',
    color: COLORS.gray
  }}>
    <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
    <h3 style={{ color: COLORS.primary }}>Usuario no encontrado</h3>
    <p>El usuario @{username} no existe.</p>
  </div>
);

// Componente sin posts
const NoPosts = ({ username }: { username: string }) => (
  <div style={{ 
    textAlign: 'center', 
    padding: '60px 20px',
    color: COLORS.gray
  }}>
    <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
    <h3 style={{ color: COLORS.primary }}>No hay posts aún</h3>
    <p>@{username} no ha publicado ningún contenido.</p>
  </div>
);

export const UserProfileFeed: React.FC<UserProfileFeedProps> = ({ 
  username, 
  currentUser, 
  setImageModal,
  onShowProfile,
  onPostLike
}) => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfileAndPosts();
  }, [username]);

  const loadUserProfileAndPosts = async () => {
    try {
      setLoading(true);
      console.log(`👤 Cargando perfil y posts de: @${username}`);

      // 1. Cargar perfil del usuario
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError || !profileData) {
        console.log(`❌ Usuario @{username} no encontrado`);
        setUserProfile(null);
        setUserPosts([]);
        return;
      }

      setUserProfile(profileData);

      // 2. Cargar posts del usuario
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            username,
            plan_type,
            avatar_url
          )
        `)
        .eq('user_id', profileData.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // 3. Procesar posts con ODS
      if (postsData && postsData.length > 0) {
        const postIds = postsData.map(post => post.id);
        
        const { data: postOdsData } = await supabase
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

        // Agrupar ODS por post_id
        const odsByPostId: Record<string, any[]> = {};
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

        const userPostsFormatted: Post[] = postsData.map(post => {
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
            user_id: post.user_id
          };
        });

        setUserPosts(userPostsFormatted);
        console.log(`✅ Encontrados ${userPostsFormatted.length} posts de @${username}`);
      } else {
        setUserPosts([]);
        console.log(`📭 @${username} no tiene posts publicados`);
      }

    } catch (error) {
      console.error('❌ Error cargando perfil y posts:', error);
      setUserProfile(null);
      setUserPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentAdded = (updatedPost: Post) => {
    const updatedPosts = userPosts.map(p => 
      p.id === updatedPost.id ? updatedPost : p
    );
    setUserPosts(updatedPosts);
  };

  // Estados de carga
  if (loading) return <LoadingState />;
  if (!userProfile) return <UserNotFound username={username} />;

  return (
    <div>
      {/* Header del Perfil */}
      <div style={{
        backgroundColor: COLORS.white,
        borderRadius: '12px',
        padding: '30px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        textAlign: 'center'
      }}>
        {/* Avatar */}
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          backgroundColor: userProfile.avatar_url ? 'transparent' : COLORS.secondary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: COLORS.white,
          fontWeight: 'bold',
          fontSize: '36px',
          margin: '0 auto 20px',
          overflow: 'hidden'
        }}>
          {userProfile.avatar_url ? (
            <img 
              src={userProfile.avatar_url} 
              alt={`Avatar de ${userProfile.username}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            userProfile.username?.charAt(0).toUpperCase() || 'U'
          )}
        </div>

        {/* Nombre de usuario */}
        <h1 style={{ 
          margin: '0 0 10px 0', 
          color: COLORS.primary,
          fontSize: '28px'
        }}>
          @{userProfile.username}
        </h1>

        {/* Badge del Plan */}
        <PlanBadge planType={userProfile.plan_type} />

        {/* Biografía */}
        {userProfile.bio && (
          <p style={{ 
            margin: '0 0 15px 0', 
            color: COLORS.gray,
            fontSize: '16px',
            lineHeight: '1.5',
            maxWidth: '500px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            {userProfile.bio}
          </p>
        )}

        {/* Estadísticas */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '30px',
          marginBottom: '20px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: COLORS.primary }}>
              {userPosts.length}
            </div>
            <div style={{ fontSize: '14px', color: COLORS.gray }}>Posts</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: COLORS.primary }}>
              {userProfile.followers_count || 0}
            </div>
            <div style={{ fontSize: '14px', color: COLORS.gray }}>Seguidores</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: COLORS.primary }}>
              {userProfile.following_count || 0}
            </div>
            <div style={{ fontSize: '14px', color: COLORS.gray }}>Siguiendo</div>
          </div>
        </div>

        {/* Botón de amistad (solo si no es el usuario actual) */}
        {currentUser && currentUser.id !== userProfile.id && (
          <FriendshipButton 
            currentUserId={currentUser.id}
            targetUserId={userProfile.id}
            friendshipStatus="none"
          />
        )}
      </div>

      {/* Lista de Posts del Usuario */}
      {userPosts.length === 0 ? (
        <NoPosts username={username} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {userPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onShowProfile={onShowProfile}
              setImageModal={setImageModal}
              onExpandComments={() => {
                console.log(`💬 Expandir comentarios para post: ${post.id}`);
              }}
              onCommentAdded={handleCommentAdded}
              onPostLike={onPostLike}
            />
          ))}
        </div>
      )}
    </div>
  );
};