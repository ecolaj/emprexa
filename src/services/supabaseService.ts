import { supabase } from '../supabaseClient';

// Función para verificar si el usuario dio like
export const checkUserLiked = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const realPostUUID = postId;
    if (!realPostUUID) {
      console.log('❌ No se pudo encontrar UUID real para verificar like');
      return false;
    }

    console.log('🔍 Verificando like en BD:');
    console.log('   Post UUID:', realPostUUID);
    console.log('   User UUID:', userId);
    
    // Verificación DIRECTA en la base de datos
    const { data, error } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', realPostUUID)  
      .eq('user_id', userId);

    console.log('📊 Resultado de la consulta:');
    console.log('   Data:', data);
    console.log('   Error:', error);
    console.log('   Cantidad de likes encontrados:', data?.length || 0);

    const userLiked = !error && data && data.length > 0;
    console.log('✅ Usuario ya dio like?:', userLiked);
    
    return userLiked;
  } catch (error) {
    console.error('❌ Error en checkUserLiked:', error);
    return false;
  }
};

// Función para obtener contador de likes
export const getPostLikeCount = async (postId: string): Promise<number> => {
  try {
    // Convertir a string primero para asegurar que tenemos el método .includes()
    const postIdStr = String(postId);
    
    // Si el postId ya es un UUID (tiene guiones), usarlo directamente
    let realPostUUID = postIdStr;
    
    // UUID directo
realPostUUID = postIdStr;

    console.log('🔢 Obteniendo like_count para:', realPostUUID);
    
    // Obtener directamente de la tabla posts
    const { data, error } = await supabase
      .from('posts')
      .select('like_count')
      .eq('id', realPostUUID)
      .single();

    if (error) {
      console.error('Error obteniendo like_count:', error);
      return 0;
    }

    console.log('📊 Like_count obtenido:', data?.like_count || 0);
    return data?.like_count || 0;
  } catch (error) {
    console.error('Error en getPostLikeCount:', error);
    return 0;
  }
};

// Función para toggle like
export const togglePostLike = async (postId: string, userId: string) => {
  try {
    // 1. Obtener el UUID real del post
    const realPostUUID = postId;
    
    if (!realPostUUID) {
      console.error('No se pudo encontrar el UUID real para el post:', postId);
      throw new Error('No se pudo encontrar el post');
    }

    // 2. Obtener el UUID real del usuario
    const realUserId = (await supabase.auth.getUser()).data.user?.id;
    console.log('🎯 Operación like con:');
    console.log('   Post UUID:', realPostUUID);
    console.log('   User UUID:', realUserId);

    if (!realUserId) {
      throw new Error('No hay sesión activa');
    }

    // 3. Verificar si ya existe el like
    console.log('🔍 Verificando like existente...');
    const alreadyLiked = await checkUserLiked(realPostUUID, realUserId);
    console.log('   Like existente?:', alreadyLiked);

    if (alreadyLiked) {
      // QUITAR LIKE
      console.log('🗑️ Eliminando like...');
      const { error: deleteError } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', realPostUUID)
        .eq('user_id', realUserId);

      if (deleteError) {
        console.error('Error eliminando like:', deleteError);
        throw new Error('Error al quitar like: ' + deleteError.message);
      }

      // Decrementar contador
      console.log('📉 Decrementando contador...');
      await supabase.rpc('increment_like_count', {
        p_post_id: realPostUUID,
        p_delta: -1,
      });

      console.log('✅ Like eliminado exitosamente');

    } else {
      // AGREGAR LIKE
      console.log('💖 Agregando like...');
      const { error: insertError } = await supabase
        .from('post_likes')
        .insert({ 
          post_id: realPostUUID, 
          user_id: realUserId, 
          reaction_type: 'like' 
        });

      if (insertError) {
        console.error('Error insertando like:', insertError);
        throw new Error('Error al dar like: ' + insertError.message);
      }

      // Incrementar contador
      console.log('📈 Incrementando contador...');
      await supabase.rpc('increment_like_count', {
        p_post_id: realPostUUID,
        p_delta: 1,
      });

      console.log('✅ Like agregado exitosamente');
    }

  } catch (error) {
    console.error('❌ Error general en togglePostLike:', error);
    throw error;
  }
};

// Exportar supabase para que los componentes lo usen
export { supabase };

// NUEVA FUNCIÓN: insertar post con user_id automático Y métricas de impacto
export const insertPost = async (payload: {
  title: string;
  content_text: string;
  ods: number[];
  image_urls?: string[];
  video_url?: string;
  // 🆕 NUEVO: Campos de métricas de impacto
  budget_approx?: number | null;
  beneficiaries_men?: number | null;
  beneficiaries_women?: number | null;
  partners?: string | null;
  project_status?: string;
}) => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('No hay sesión activa');

  const { data, error } = await supabase
    .from('posts')
    .insert({
      title: payload.title,
      content_text: payload.content_text,
      image_urls: payload.image_urls || [],
      video_url: payload.video_url || '',
      user_id: user.id,
      // 🆕 NUEVO: Insertar métricas de impacto
      budget_approx: payload.budget_approx,
      beneficiaries_men: payload.beneficiaries_men,
      beneficiaries_women: payload.beneficiaries_women,
      partners: payload.partners,
      project_status: payload.project_status || 'planning',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export { supabase };

export const insertPostODS = async (postId: string, odsIds: number[]) => {
  if (!odsIds.length) return;
  const rows = odsIds.map((odsId) => ({ post_id: postId, ods_id: odsId }));
  const { error } = await supabase.from('post_ods').insert(rows);
  if (error) throw error;
};