import { supabase } from '../supabaseClient';

export const createComment = async (postId: string, userId: string, content: string, parentCommentId?: string) => {
  console.log('📝 Creando comentario para post:', postId);
  console.log('👤 Usuario:', userId);
  console.log('📄 Contenido:', content.substring(0, 50) + '...');
  console.log('💬 Es respuesta?:', !!parentCommentId);

  const { data, error } = await supabase
    .from('comments')
    .insert([
      {
        post_id: postId,
        user_id: userId,
        content: content,
        parent_comment_id: parentCommentId || null,
        like_count: 0,
      },
    ])
    .select(`*, profiles:user_id (username, plan_type, avatar_url)`)
    .single();

  if (error) throw error;

            // ✅ EL TRIGGER ACTUALIZA AUTOMÁTICAMENTE EL CONTADOR PARA TODOS LOS COMENTARIOS
      // (principales + respuestas anidadas)
      console.log('🔄 El trigger actualizará automáticamente comment_count para el post:', postId);
      
      // Verificación opcional para logging
      const { data: postData, error: selectError } = await supabase
        .from('posts')
        .select('comment_count')
        .eq('id', postId)
        .single();
      
      if (!selectError && postData) {
        console.log('📊 comment_count después del comentario:', postData.comment_count);
      } else {
        console.log('📊 comment_count se actualizará vía trigger');
      }

  return data;
};

export const deleteComment = async (commentUUID: string) => {
  const { error } = await supabase.from('comments').delete().eq('id', commentUUID);
  if (error) throw error;
};

export const updateComment = async (commentUUID: string, newContent: string) => {
  const { error } = await supabase.from('comments').update({ content: newContent }).eq('id', commentUUID);
  if (error) throw error;
};