import { supabase } from '../supabaseClient';

/**
 * Extrae hashtags del texto (#sostenibilidad)
 */
export const extractHashtags = (text: string): string[] => {
  const hashtagRegex = /#(\w+)/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map(tag => tag.substring(1).toLowerCase()) : [];
};

/**
 * Extrae menciones del texto (@usuario)
 */
export const extractMentions = (text: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const matches = text.match(mentionRegex);
  return matches ? matches.map(mention => mention.substring(1).toLowerCase()) : [];
};

/**
 * Procesa y guarda hashtags de un post
 */
export const processPostHashtags = async (postId: string, text: string) => {
  try {
    const hashtags = extractHashtags(text);
    
    if (hashtags.length === 0) return;

    console.log(`🏷️ Procesando hashtags para post ${postId}:`, hashtags);

    for (const tagText of hashtags) {
      // 1. Buscar o crear el hashtag
      const { data: hashtag, error: hashtagError } = await supabase
        .from('hashtags')
        .select('id, usage_count')
        .eq('tag_text', tagText)
        .single();

      let hashtagId;

      if (hashtagError || !hashtag) {
        // Crear nuevo hashtag
        const { data: newHashtag, error: createError } = await supabase
          .from('hashtags')
          .insert([{ tag_text: tagText, usage_count: 1 }])
          .select()
          .single();

        if (createError) {
          console.error('Error creando hashtag:', createError);
          continue;
        }
        hashtagId = newHashtag.id;
      } else {
        // Actualizar contador de hashtag existente
        hashtagId = hashtag.id;
        await supabase
          .from('hashtags')
          .update({ 
            usage_count: (hashtag.usage_count || 0) + 1,
            last_used_at: new Date().toISOString()
          })
          .eq('id', hashtagId);
      }

      // 2. Crear relación post-hashtag
      const { error: relationError } = await supabase
        .from('post_hashtags')
        .insert([{ post_id: postId, hashtag_id: hashtagId }]);

      if (relationError) {
        console.error('Error creando relación post-hashtag:', relationError);
      }
    }

    console.log(`✅ Hashtags procesados para post ${postId}`);
  } catch (error) {
    console.error('❌ Error en processPostHashtags:', error);
  }
};

/**
 * Verifica si un usuario mencionado existe
 */
export const validateMentionedUser = async (username: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('Error validando usuario mencionado:', error);
    return false;
  }
};

/**
 * Procesa hashtags en comentarios y los guarda en comment_hashtags
 */
 export const processCommentHashtags = async (commentId: string, content: string) => {
  try {
    const hashtags = extractHashtags(content);
    console.log(`🏷️ Hashtags encontrados en comentario:`, hashtags);

    for (const hashtagText of hashtags) {
      // 1. Buscar o crear el hashtag
      const { data: hashtag, error: hashtagError } = await supabase
        .from('hashtags')
        .select('id')
        .eq('tag_text', hashtagText.toLowerCase())
        .single();

      let hashtagId;

      if (hashtagError || !hashtag) {
        // Crear nuevo hashtag
        const { data: newHashtag, error: createError } = await supabase
          .from('hashtags')
          .insert([{ tag_text: hashtagText.toLowerCase() }])
          .select()
          .single();

        if (createError) {
          console.error('❌ Error creando hashtag:', createError);
          continue;
        }
        hashtagId = newHashtag.id;
        console.log(`✅ Nuevo hashtag creado: #${hashtagText}`);
      } else {
        hashtagId = hashtag.id;
      }

      // 2. Guardar relación comment-hashtag
      const { error: relationError } = await supabase
        .from('comment_hashtags')
        .insert([{
          comment_id: commentId,
          hashtag_id: hashtagId
        }]);

      if (relationError) {
        console.error('❌ Error guardando relación comment-hashtag:', relationError);
      } else {
        console.log(`✅ Hashtag #${hashtagText} guardado para comentario`);
      }
    }
  } catch (error) {
    console.error('❌ Error procesando hashtags de comentario:', error);
  }
};


/**
 * Procesa y guarda menciones de usuarios en un post
 */
 export const processPostMentions = async (postId: string, text: string, mentionedByUserId: string) => {
  try {
    const mentions = extractMentions(text);
    
    if (mentions.length === 0) return;

    console.log(`👤 Procesando menciones para post ${postId}:`, mentions);

    for (const username of mentions) {
      // 1. Buscar el usuario mencionado
      const { data: mentionedUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (userError || !mentionedUser) {
        console.log(`⚠️ Usuario mencionado no encontrado: @${username}`);
        continue;
      }

      // 2. Crear relación de mención
      const { error: relationError } = await supabase
        .from('post_mentions')
        .insert([{
          post_id: postId,
          mentioned_user_id: mentionedUser.id,
          mentioned_by_user_id: mentionedByUserId,
          mention_text: `@${username}`
        }]);

      if (relationError) {
        console.error('Error creando mención:', relationError);
      } else {
        console.log(`✅ Mención creada: @${username} para usuario ${mentionedUser.id}`);
      }
    }

    console.log(`✅ Menciones procesadas para post ${postId}`);
  } catch (error) {
    console.error('❌ Error en processPostMentions:', error);
  }
};