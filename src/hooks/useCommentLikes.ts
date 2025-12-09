import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export const useCommentLikes = (
  commentIds: string[], // IDs numéricos o UUIDs
  userId: string | undefined
) => {
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!userId || !commentIds.length) return;
  
    const fetchData = async () => {
      try {
        console.log('🔍 Cargando likes para', commentIds.length, 'comentarios');

        // 1. Obtener likes del usuario para TODOS los comentarios en 1 query
        const { data: likedData, error: likedError } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .in('comment_id', commentIds)
          .eq('user_id', userId);
  
        if (likedError) throw likedError;
  
        // 2. Obtener counts para TODOS los comentarios en 1 query
        const { data: countsData, error: countsError } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .in('comment_id', commentIds);
  
        if (countsError) throw countsError;
  
        // 3. Procesar resultados - usar commentIds directamente
        const likesMap: Record<string, boolean> = {};
        const countsMap: Record<string, number> = {};

        commentIds.forEach(commentId => {
          likesMap[commentId] = likedData?.some(like => like.comment_id === commentId) || false;
          countsMap[commentId] = countsData?.filter(like => like.comment_id === commentId).length || 0;
        });
  
        setLikes(likesMap);
        setCounts(countsMap);
      } catch (error) {
        console.error('Error cargando likes batch:', error);
      }
    };
  
    fetchData();
  }, [commentIds.join(','), userId]);

  return { likes, counts, setLikes, setCounts };
};