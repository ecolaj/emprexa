import { supabase } from '../supabaseClient';

/**
 * Carga los posts del feed con paginación
 */
export const getFeedPosts = async (page: number = 0, limit: number = 10) => {
  const start = page * limit;
  const end = start + limit - 1;

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:user_id (
        username,
        plan_type,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .range(start, end);

  if (error) throw error;
  return data || [];
};

/**
 * Carga TODOS los likes de múltiples posts en una sola consulta
 */
 export const getPostsLikes = async (postIds: string[]) => {
  if (postIds.length === 0) return {};

  // FILTRAR: Solo usar UUIDs válidos, ignorar IDs numéricos
  const validUUIDs = postIds.filter(id => id.includes('-'));
  
  if (validUUIDs.length === 0) {
    console.log('⚠️  No hay UUIDs válidos para cargar likes');
    return {};
  }

  console.log('🔍 Cargando likes para', validUUIDs.length, 'UUIDs válidos');
  
  const { data, error } = await supabase
    .from('post_likes')
    .select('post_id, user_id')
    .in('post_id', validUUIDs);

  if (error) {
    console.error('Error cargando likes batch:', error);
    return {};
  }

  // Agrupar por post_id
  const likesByPost: { [postId: string]: string[] } = {};
  data?.forEach(like => {
    if (!likesByPost[like.post_id]) {
      likesByPost[like.post_id] = [];
    }
    likesByPost[like.post_id].push(like.user_id);
  });

  console.log('📊 Likes cargados para', Object.keys(likesByPost).length, 'posts');
  return likesByPost;
};

  const { data, error } = await supabase
    .from('post_likes')
    .select('post_id, user_id')
    .in('post_id', realPostUUIDs);

  if (error) {
    console.error('Error cargando likes múltiples:', error);
    return {};
  }

  // Agrupar por post_id
  const likesByPost: { [postId: string]: string[] } = {};
  data?.forEach(like => {
    if (!likesByPost[like.post_id]) {
      likesByPost[like.post_id] = [];
    }
    likesByPost[like.post_id].push(like.user_id);
  });

  return likesByPost;
};

/**
 * Carga TODOS los comentarios de múltiples posts en una sola consulta
 */
export const getPostsComments = async (postIds: string[]) => {
  if (postIds.length === 0) return {};

  const realPostUUIDs = await Promise.all(
    postIds.map(async (id) => {
      if (id.includes('-')) return id;
      return id;
    })
  );

  const { data, error } = await supabase
    .from('comments')
    .select('post_id, id, content, created_at, user_id, like_count')
    .in('post_id', realPostUUIDs)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error cargando comentarios múltiples:', error);
    return {};
  }

  // Agrupar por post_id
  const commentsByPost: { [postId: string]: any[] } = {};
  data?.forEach(comment => {
    if (!commentsByPost[comment.post_id]) {
      commentsByPost[comment.post_id] = [];
    }
    commentsByPost[comment.post_id].push(comment);
  });

  return commentsByPost;
};