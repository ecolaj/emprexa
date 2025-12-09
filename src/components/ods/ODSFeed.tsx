import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Post, User, ImageModalState } from '../../types';
import { COLORS } from '../../utils/constants';
import { useNavigation } from '../../contexts/NavigationContext';
import { PostCard } from '../posts/PostCard';

interface ODSFeedProps {
  odsNumero: number;
  currentUser: User | null;
  setImageModal: React.Dispatch<React.SetStateAction<ImageModalState>>;
  onShowProfile: (userId: string) => void;
  onPostLike?: (postId: string, liked: boolean) => void; // 🆕 NUEVO
}

export const ODSFeed: React.FC<ODSFeedProps> = ({
  odsNumero,
  currentUser,
  setImageModal,
  onShowProfile,
  onPostLike,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [odsInfo, setOdsInfo] = useState<{nombre: string; color_principal: string} | null>(null);
  const { navigateToHashtag, navigateToUserProfile } = useNavigation();

  // 🆕 NUEVO: Manejar comentarios agregados
  const handleCommentAdded = (updatedPost: any) => {
    if (updatedPost._deleted) {
      setPosts(prev => prev.filter(p => p.id !== updatedPost.id));
    } else {
      setPosts(prev => prev.map(p => 
        p.id === updatedPost.id ? updatedPost : p
      ));
    }
  };

  useEffect(() => {
    loadODSPosts();
  }, [odsNumero]);
    // 🆕 NUEVO: Función para cargar comentarios
    const loadPostComments = async (postId: string) => {
      try {
        const { data: commentsData, error } = await supabase
          .from('comments')
          .select(`
            *,
            profiles:user_id (username, plan_type, avatar_url)
          `)
          .eq('post_id', postId)
          .order('created_at', { ascending: false });
  
        if (error) throw error;
  
        return (commentsData || []).map(comment => ({
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
      } catch (error) {
        console.error(`Error cargando comentarios para post ${postId}:`, error);
        return [];
      }
    };

  const loadODSPosts = async () => {
    try {
      setLoading(true);

            // 1. Buscar el ODS por número (con nombre completo)
            const { data: odsData, error: odsError } = await supabase
            .from('ods')
            .select('id, nombre, color_principal')
            .eq('numero', odsNumero)
            .single();

            if (odsError || !odsData) {
              setPosts([]);
              setOdsInfo(null);
              return;
            }
      
            // 🆕 NUEVO: Guardar información del ODS
            setOdsInfo({
              nombre: odsData.nombre,
              color_principal: odsData.color_principal
            });

      // 2. Posts que tienen ese ODS
      const { data: postIdsData } = await supabase
  .from('post_ods')
  .select('post_id')
  .eq('ods_id', odsData.id);

if (!postIdsData || postIdsData.length === 0) {
  setPosts([]);
  return;
}

const postIds = postIdsData.map(item => item.post_id);

// 3. Obtener posts ordenados por fecha descendente
const { data: rawPosts } = await supabase
  .from('posts')
  .select(`
    *,
    profiles:user_id (username, plan_type, avatar_url)
  `)
  .in('id', postIds)
  .order('created_at', { ascending: false });
        


      // 3. Cargar ODS completos por post
      const postIdsForODS = rawPosts ? rawPosts.map((p: any) => p.id) : [];
      const { data: odsList } = await supabase
        .from('post_ods')
        .select(`
          post_id,
          ods:ods_id (id, numero, nombre, color_principal)
        `)
        .in('post_id', postIdsForODS);

      const odsByPostId: Record<string, any[]> = {};
      odsList?.forEach((item) => {
        if (!odsByPostId[item.post_id]) odsByPostId[item.post_id] = [];
        if (item.ods) odsByPostId[item.post_id].push(item.ods);
      });

      // 4. Mapear a tipo Post
      const mapped: Post[] = rawPosts.map((post: any) => ({
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
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
                  {/* Header del ODS */}
      <div style={{ maxWidth: '800px', margin: '0 auto 25px', padding: '0 20px' }}>
        <div
          style={{
            backgroundColor: odsInfo?.color_principal 
              ? `${odsInfo.color_principal}15` 
              : COLORS.white,
            border: `2px solid ${odsInfo?.color_principal || COLORS.primary}30`,
            borderRadius: '16px',
            padding: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}
        >
          <h1 style={{ 
            margin: '0 0 8px 0', 
            color: odsInfo?.color_principal || COLORS.primary, 
            fontSize: '32px',
            fontWeight: '800'
          }}>
            ODS {odsNumero}
          </h1>
          <h2 style={{ 
            margin: '0 0 15px 0', 
            color: odsInfo?.color_principal || COLORS.dark, 
            fontSize: '20px',
            fontWeight: '600',
            lineHeight: '1.4'
          }}>
            {odsInfo?.nombre || `Objetivo de Desarrollo Sostenible ${odsNumero}`}
          </h2>
          <p style={{ 
            margin: 0, 
            color: COLORS.gray, 
            fontSize: '16px',
            fontWeight: '500'
          }}>
            {posts.length} {posts.length === 1 ? 'proyecto inspirador' : 'proyectos inspiradores'}
          </p>
        </div>
      </div>

      {/* Posts */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: COLORS.primary }}>
            <div style={{ fontSize: '18px', marginBottom: '10px' }}>🔄</div>
            <div>Cargando posts con ODS {odsNumero}…</div>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: COLORS.gray }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
            <h3 style={{ color: COLORS.primary }}>No hay posts con ODS {odsNumero}</h3>
            <p>Sé el primero en etiquetar un post con <strong>ODS {odsNumero}</strong>.</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
  key={post.id}
  post={post}
  currentUser={currentUser}
  onShowProfile={onShowProfile}
  setImageModal={setImageModal}
  onExpandComments={async (postId: string) => {
    // 🆕 NUEVO: Cargar comentarios cuando se expandan
    const updatedPosts = [...posts];
    const postIndex = updatedPosts.findIndex(p => p.id === postId);
    if (postIndex !== -1) {
      const comments = await loadPostComments(postId);
      updatedPosts[postIndex] = {
        ...updatedPosts[postIndex],
        comments: comments,
        comment_count: comments.length
      };
      setPosts(updatedPosts);
    }
  }}
  onCommentAdded={handleCommentAdded} // 🆕 NUEVO: Pasar la función
  onPostLike={onPostLike}
/>
          ))
        )}
      </div>
    </>
  );
};