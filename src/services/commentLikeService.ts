import { supabase } from '../supabaseClient';

/* ----------  HELPERS  ---------- */
const toUUID = async (numericId: string): Promise<string | null> => {
  if (!/^\d+$/.test(numericId)) return numericId; // ya es UUID

  const { data, error } = await supabase
    .from('comments')
    .select('id')
    .eq('id', numericId) // intentar directo
    .single();

  if (!error && data) return data.id;

  // fallback: búsqueda manual
  const { data: all } = await supabase
    .from('comments')
    .select('id, created_at')
    .order('created_at', { ascending: false });

  if (!all) return null;

  const found = all.find(c => {
    const derived = parseInt(c.id.replace(/-/g, '').slice(0, 8), 16);
    return derived === parseInt(numericId, 10);
  });

  return found?.id || null;
};

/* ----------  LIKES  ---------- */
export const checkCommentLiked = async (
  commentId: string,
  userId: string
): Promise<boolean> => {
  const uuid = commentId;
  if (!uuid || !userId) return false;

  const { count, error } = await supabase
    .from('comment_likes')
    .select('*', { count: 'exact', head: true })
    .eq('comment_id', uuid)
    .eq('user_id', userId);

  return !error && (count || 0) > 0;
};

export const getCommentLikeCount = async (commentId: string): Promise<number> => {
  const uuid = commentId;
  if (!uuid) return 0;

  const { count, error } = await supabase
    .from('comment_likes')
    .select('*', { count: 'exact', head: true })
    .eq('comment_id', uuid);

  return error ? 0 : (count || 0);
};

export const toggleCommentLike = async (
  commentId: string,
  userId: string
): Promise<{ liked: boolean; newLikeCount: number }> => {
  const uuid = commentId;
  if (!uuid) throw new Error('Comentario no encontrado');

  try {
    // 1. Verificar si ya existe el like
    const { data: existing, error: checkError } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', uuid)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('❌ Error verificando like:', checkError);
      throw checkError;
    }

    let newLikeCount = 0;
    let liked = false;

    if (existing) {
      // 2. QUITAR like
      const { error: deleteError } = await supabase
        .from('comment_likes')
        .delete()
        .eq('id', existing.id);

      if (deleteError) {
        console.error('❌ Error eliminando like:', deleteError);
        throw deleteError;
      }

      liked = false;
      console.log('✅ Like eliminado correctamente');
    } else {
      // 3. DAR like
      const { error: insertError } = await supabase
        .from('comment_likes')
        .insert({ comment_id: uuid, user_id: userId });

      if (insertError) {
        console.error('❌ Error insertando like:', insertError);
        throw insertError;
      }

      liked = true;
      console.log('✅ Like agregado correctamente');
    }

    // 4. OBTENER NUEVO CONTADOR (el trigger ya lo actualizó automáticamente)
    const { data: commentData, error: countError } = await supabase
      .from('comments')
      .select('like_count')
      .eq('id', uuid)
      .single();

    if (countError) {
      console.error('❌ Error obteniendo like_count:', countError);
      // No lanzamos error aquí, el like ya se procesó correctamente
      newLikeCount = 0;
    } else {
      newLikeCount = commentData?.like_count || 0;
    }

    console.log(`✅ Like sincronizado: ${liked ? 'ADD' : 'REMOVE'}, nuevo count: ${newLikeCount}`);
    
    return { liked, newLikeCount };

  } catch (error: any) {
    console.error('❌ Error crítico en toggleCommentLike:', error);
    throw new Error(`No se pudo procesar el like: ${error.message}`);
  }
};