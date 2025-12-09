import { supabase } from '../supabaseClient';

/**
 * Devuelve true si el usuario actual ya dio like al post
 */
 export const checkUserLiked = async (postId: string, userId: string): Promise<boolean> => {
  try {
    // Determinar si es UUID o ID numérico
    const isUUID = postId.includes('-');
    const realPostUUID = postId;
    
    if (!realPostUUID) {
      console.log('❌ No se pudo encontrar UUID real para verificar like');
      return false;
    }

    console.log('🔍 Verificando like en BD:');
    console.log('   Post ID recibido:', postId);
    console.log('   Post UUID usado:', realPostUUID);
    console.log('   User UUID:', userId);
    
    // Verificación DIRECTA en la base de datos
    const { data, error } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', realPostUUID)
      .eq('user_id', userId);

    if (error) {
      console.error('Error verificando like:', error);
      return false;
    }

    const userLiked = !error && data && data.length > 0;
    console.log('✅ Usuario ya dio like?:', userLiked);
    
    return userLiked;
  } catch (error) {
    console.error('❌ Error en checkUserLiked:', error);
    return false;
  }
};

/**
 * Toggle like: Operación atómica en BD
 */
 export const togglePostLike = async (postId: string, userId: string) => {
  try {
    console.log('🎯 Operación like con:');
    console.log('   Post UUID:', postId);
    console.log('   User UUID:', userId);

    // Verificar si ya existe el like
    const alreadyLiked = await checkUserLiked(postId, userId);
    console.log('   Like existente?:', alreadyLiked);

    if (alreadyLiked) {
      // QUITAR LIKE
      console.log('🗑️ Eliminando like...');
      const { error: deleteError } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Decrementar contador
      console.log('📉 Decrementando contador...');
      const { error: updateError } = await supabase.rpc('increment_like_count', {
        p_post_id: postId,
        p_delta: -1,
      });

      if (updateError) {
        // Fallback si no existe la RPC
        await supabase
          .from('posts')
          .update({ like_count: supabase.sql`COALESCE(like_count, 0) - 1` })
          .eq('id', postId);
      }

      console.log('✅ Like eliminado exitosamente');

    } else {
      // AGREGAR LIKE
      console.log('💖 Agregando like...');
      const { error: insertError } = await supabase
        .from('post_likes')
        .insert({ 
          post_id: postId, 
          user_id: userId
        });

      if (insertError) {
        // Si es error de duplicado, significa que ya existe (condición de carrera)
        if (insertError.code === '23505') {
          console.log('⚠️  Like ya existía (condición de carrera)');
          return;
        }
        throw insertError;
      }

      // Incrementar contador - CON MEJOR MANEJO DE ERRORES
      console.log('📈 Incrementando contador...');
      try {
        const { error: updateError } = await supabase.rpc('increment_like_count', {
          p_post_id: postId,
          p_delta: 1,
        });

        if (updateError) {
          console.error('❌ Error en RPC increment_like_count:', updateError);
          throw updateError;
        }
        
        console.log('✅ Contador incrementado via RPC');
      } catch (rpcError) {
        console.error('❌ Falló RPC, usando fallback manual:', rpcError);
        // FALLBACK ROBUSTO: Obtener count real y actualizar
        const { count } = await supabase
          .from('post_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId);
          
        await supabase
          .from('posts')
          .update({ like_count: count || 0 })
          .eq('id', postId);
          
        console.log('✅ Contador actualizado manualmente:', count);
      }

      console.log('✅ Like agregado exitosamente');
    }

  } catch (error) {
    console.error('❌ Error general en togglePostLike:', error);
    throw error;
  }
};

/**
 * Obtiene el contador REAL de likes de un post
 */
 export const getPostLikeCount = async (postId: string): Promise<number> => {
  try {
    // Determinar si es UUID o ID numérico
    const isUUID = postId.includes('-');
    const realPostUUID = postId;
    
    if (!realPostUUID) {
      console.error('❌ No se pudo obtener UUID real para contar likes');
      return 0;
    }

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

    const count = data?.like_count || 0;
    console.log('📊 Like_count obtenido:', count);
    return count;
  } catch (error) {
    console.error('Error en getPostLikeCount:', error);
    return 0;
  }
};

/**
 * Obtiene todos los usuarios que dieron like a un post
 */
 export const getPostLikes = async (postId: string): Promise<string[]> => {
  try {
    // SI el postId es numérico, NO hacer consulta (evitar error)
    if (!postId.includes('-')) {
      console.log('⚠️  ID numérico detectado, omitiendo consulta de likes:', postId);
      return [];
    }

    console.log('🔍 Obteniendo todos los likes para UUID:', postId);
    
    const { data, error } = await supabase
      .from('post_likes')
      .select('user_id')
      .eq('post_id', postId);

    if (error) {
      console.error('Error obteniendo likes:', error);
      return [];
    }

    const userIds = data?.map(like => like.user_id) || [];
    console.log('📊 Usuarios que dieron like:', userIds.length);
    return userIds;
  } catch (error) {
    console.error('Error en getPostLikes:', error);
    return [];
  }
};