import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Post, User, ImageModalState } from '../../types';
import { COLORS } from '../../utils/constants';
import { useNavigation } from '../../contexts/NavigationContext';
import { PostCard } from '../posts/PostCard';
import { Avatar } from '../ui/Avatar/Avatar';
import { ChatButton } from '../chat/ChatButton';
import { getPlanBadgeData, normalizePlanType } from '../../utils/permissionUtils';

interface UserPublicProps {
  username: string;
  currentUser: User | null;
  setImageModal: React.Dispatch<React.SetStateAction<ImageModalState>>;
  onShowProfile: (userId: string) => void;
  onPostLike // 🆕 NUEVO
}

export const UserPublicProfile: React.FC = ({
  username,
  currentUser,
  setImageModal,
  onShowProfile,
  onPostLike, // 🆕 AGREGAR ESTA PROP
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const { navigateToHashtag, navigateToUserProfile } = useNavigation();

  useEffect(() => {
    loadUserProfile();
  }, [username]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);

      // 1. Obtener perfil del usuario
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, username, plan_type, avatar_url, full_name, bio')
        .eq('username', username)
        .single();

      if (userError || !userData) {
        setProfile(null);
        setPosts([]);
        return;
      }

      setProfile(userData);

      // 2. Posts de ese usuario
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (username, plan_type, avatar_url)
        `)
        .eq('user_id', userData.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // 3. Cargar ODS por post
      const postIds = postsData?.map(p => p.id) || [];
      const { data: odsList } = await supabase
        .from('post_ods')
        .select(`
          post_id,
          ods:ods_id (id, numero, nombre, color_principal)
        `)
        .in('post_id', postIds);

      const odsByPostId: Record<string, any[]> = {};
      odsList?.forEach(item => {
        if (!odsByPostId[item.post_id]) odsByPostId[item.post_id] = [];
        if (item.ods) odsByPostId[item.post_id].push(item.ods);
      });

      // 4. Mapear a tipo Post
      const mapped: Post[] = (postsData || []).map(post => ({
        id: post.id,
        title: post.title || '',
        content: post.content_text || '',
        ods: (odsByPostId[post.id] || []).map((o: any) => ({
          id: o.id,
          numero: o.numero,
          nombre: o.nombre,
          color_principal: o.color_principal,
        })),
        like_count: post.like_count || 0,
        comment_count: post.comment_count || 0,
        author: {
          username: post.profiles?.username || 'usuario',
          plan_type: post.profiles?.plan_type || 'free',
          avatar_url: post.profiles?.avatar_url || '',
        },
        images: post.image_urls || [],
        videos: post.video_url ? [post.video_url] : [],
        created_at: post.created_at,
        comments: [],
        user_id: post.user_id,
      }));

      setPosts(mapped);
    } catch (e) {
      console.error(e);
      setProfile(null);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: COLORS.primary }}>
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>🔄</div>
        <div>Cargando perfil...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: COLORS.gray }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>😕</div>
        <h3>Usuario no encontrado</h3>
        <p>El usuario @{username} no existe.</p>
      </div>
    );
  }

  return (
    <>
      {/* Header del perfil */}
  <div style={{ maxWidth: '800px', margin: '0 auto 25px', padding: '0 20px' }}>
    <div
      style={{
        backgroundColor: COLORS.white,
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
      }}
    >
      <Avatar src={profile.avatar_url} username={profile.username} size="lg" />
      <div style={{ flex: 1 }}>
        <h1 style={{ margin: '0 0 5px 0', color: COLORS.primary }}>@{profile.username}</h1>
        {profile.full_name && (
          <p style={{ margin: '0 0 5px 0', fontWeight: '600' }}>{profile.full_name}</p>
        )}
        {profile.bio && (
          <p style={{ margin: 0, color: COLORS.gray, fontSize: '14px' }}>{profile.bio}</p>
        )}


{/* Y en el JSX */}
{(() => {
  const badgeData = getPlanBadgeData(
    normalizePlanType(profile.plan_type || 'free'), 
    'sm'
  );
  
  return (
    <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: COLORS.secondary }}>
      Plan: {badgeData ? (
        <span style={badgeData.style}>
          <span style={{ fontSize: badgeData.iconSize }}>{badgeData.icon}</span>
          {badgeData.text}
        </span>
      ) : 'Free'}
    </p>
  );
})()}
        
        {/* 🆕 BOTÓN DE CHAT */}
        {currentUser && (
          <div style={{ marginTop: '15px' }}>
            <ChatButton
              currentUser={currentUser}
              targetUser={{
                id: profile.id,
                username: profile.username,
                avatar_url: profile.avatar_url,
                plan_type: profile.plan_type
              }}
              onShowProfile={onShowProfile}
            />
          </div>
        )}
      </div>
    </div>
  </div>

      {/* Posts del usuario */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: COLORS.gray }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
            <h3 style={{ color: COLORS.primary }}>Sin publicaciones</h3>
            <p>@{username} aún no ha compartido ningún proyecto.</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard
            key={post.id}
            post={post}
            currentUser={currentUser}
            onShowProfile={onShowProfile}
            setImageModal={setImageModal}
            navigateToHashtag={navigateToHashtag}
            navigateToUserProfile={navigateToUserProfile}
            onPostLike={onPostLike} // 🆕 NUEVO: Usar la prop real
          />
          ))
        )}
      </div>
    </>
  );
};