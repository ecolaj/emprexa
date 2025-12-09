// src/components/hashtag/HashtagFeed.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Post, User, ImageModalState } from '../../types';
import { COLORS } from '../../utils/constants';
import { useNavigation } from '../../contexts/NavigationContext';
import { PostCard } from '../posts/PostCard';

interface HashtagFeedProps {
  hashtag: string;
  currentUser: User | null;
  setImageModal: React.Dispatch<React.SetStateAction<ImageModalState>>;
  onShowProfile: (userId: string) => void;
  onPostLike?: (postId: string, liked: boolean) => void;
}

export const HashtagFeed: React.FC<HashtagFeedProps> = ({
  hashtag,
  currentUser,
  setImageModal,
  onShowProfile,
  onPostLike,
}) => {
  console.log('🔍 HashtagFeed - onPostLike:', onPostLike);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { navigateToUserProfile, navigateToHashtag } = useNavigation();

  useEffect(() => {
    loadHashtagPosts();
  }, [hashtag]);

  const loadHashtagPosts = async () => {
    try {
      setLoading(true);
      const cleanHashtag = hashtag.replace('#', '').toLowerCase();
      console.log('🔍 [1] Buscando hashtag:', cleanHashtag);
  
      // 1. Buscar el hashtag
      const { data: hashtagData, error: hashtagError } = await supabase
        .from('hashtags')
        .select('id')
        .eq('tag_text', cleanHashtag)
        .single();
  
      console.log('🔍 [1] Hashtag data:', hashtagData);
      console.log('🔍 [1] Hashtag error:', hashtagError);
  
      if (hashtagError || !hashtagData) {
        console.log('❌ [1] No se encontró el hashtag:', cleanHashtag);
        setPosts([]);
        return;
      }
  
      console.log('✅ [1] Hashtag encontrado ID:', hashtagData.id);
  
      // 2. Obtener posts DIRECTAMENTE relacionados con el hashtag
      // 2. Obtener posts DIRECTAMENTE relacionados con el hashtag - CON MÁS DETALLES
console.log('🔍 [2.1] Ejecutando query con hashtag_id:', hashtagData.id);
const { data: directPostHashtags, error: directError, count } = await supabase
  .from('post_hashtags')
  .select('post_id', { count: 'exact' }) // ← Agregar count
  .eq('hashtag_id', hashtagData.id);

console.log('🔍 [2.2] Query result:', { 
  data: directPostHashtags, 
  error: directError, 
  count: count,
  hashtagId: hashtagData.id 
});
  
      console.log('🔍 [2] Post hashtags:', directPostHashtags);
      console.log('🔍 [2] Post error:', directError);
  
      // 3. Obtener comentarios relacionados con el hashtag (padres e hijos)
      const { data: commentHashtags, error: commentError } = await supabase
        .from('comment_hashtags')
        .select('comment_id')
        .eq('hashtag_id', hashtagData.id);
  
      console.log('🔍 [3] Comment hashtags:', commentHashtags);
      console.log('🔍 [3] Comment error:', commentError);
  
      if (directError || commentError) {
        console.error('❌ Error cargando relaciones:', directError || commentError);
        setPosts([]);
        return;
      }
  
      // 4. Obtener post_ids únicos de comentarios
      let commentPostIds: string[] = [];
      if (commentHashtags && commentHashtags.length > 0) {
        const commentIds = commentHashtags.map(ch => ch.comment_id);
        console.log('🔍 [4] Comment IDs:', commentIds);
        
        const { data: commentsData } = await supabase
          .from('comments')
          .select('post_id, parent_comment_id')
          .in('id', commentIds);
  
        console.log('🔍 [4] Comments data:', commentsData);
  
        if (commentsData) {
          commentPostIds = [...new Set(commentsData.map(c => c.post_id))];
          console.log('🔍 [4] Comment post IDs:', commentPostIds);
        }
      }
  
      // 5. Combinar todos los post_ids únicos
      const directPostIds = directPostHashtags?.map(ph => ph.post_id) || [];
      const allPostIds = [...new Set([...directPostIds, ...commentPostIds])];
  
      console.log('🔍 [5] Direct post IDs:', directPostIds);
      console.log('🔍 [5] All post IDs:', allPostIds);
  
      if (allPostIds.length === 0) {
        console.log('❌ [5] No hay posts asociados al hashtag');
        setPosts([]);
        return;
      }
  
      // 6. Cargar posts completos con sus relaciones
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (username, plan_type, avatar_url),
          post_ods (ods:ods_id (id, numero, nombre, color_principal))
        `)
        .in('id', allPostIds)
        .order('created_at', { ascending: false });
  
      console.log('🔍 [6] Posts data:', postsData);
      console.log('🔍 [6] Posts error:', postsError);
  
      if (postsError) {
        console.error('❌ Error cargando posts:', postsError);
        setPosts([]);
        return;
      }
  
      // 7. Mapeo a tipo Post
      const mapped: Post[] = (postsData || []).map((post: any) => ({
        id: post.id,
        title: post.title || '',
        content: post.content_text || '',
        ods: (post.post_ods || []).map((po: any) => ({
          id: po.ods.id,
          numero: po.ods.numero,
          nombre: po.ods.nombre,
          color_principal: po.ods.color_principal,
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
      }));
  
      console.log('✅ [7] Posts mapeados:', mapped.length);
      setPosts(mapped);
  
    } catch (e) {
      console.error('❌ Error inesperado:', e);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header del hashtag */}
      <div style={{ maxWidth: '800px', margin: '0 auto 25px', padding: '0 20px' }}>
        <div
          style={{
            backgroundColor: COLORS.white,
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            textAlign: 'center',
          }}
        >
          <h1 style={{ margin: '0 0 10px 0', color: COLORS.primary, fontSize: '24px' }}>#{hashtag}</h1>
          <p style={{ margin: 0, color: COLORS.gray, fontSize: '16px' }}>
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </p>
        </div>
      </div>

      {/* Posts */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: COLORS.primary }}>
            <div style={{ fontSize: '18px', marginBottom: '10px' }}>🔄</div>
            <div>Buscando posts con #{hashtag}…</div>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: COLORS.gray }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
            <h3 style={{ color: COLORS.primary }}>No hay posts con este hashtag</h3>
            <p>Sé el primero en usar <strong>#{hashtag}</strong> en un post.</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onShowProfile={onShowProfile}
              setImageModal={setImageModal}
              navigateToHashtag={navigateToHashtag}
              navigateToUserProfile={navigateToUserProfile}
              onPostLike={onPostLike}
            />
          ))
        )}
      </div>
    </>
  );
};