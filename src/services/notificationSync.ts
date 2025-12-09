import { supabase } from '../supabaseClient';
import { insertNotification } from './notificationService';

/**
 * Sync solicitudes de amistad pendientes → notificaciones
 */
export const syncFriendRequests = async (userId: string) => {
  const { data, error } = await supabase
    .from('friendships')
    .select('id, user_id, friend_id, created_at')
    .eq('friend_id', userId)
    .eq('status', 'pending');

  if (error || !data) return;

  for (const row of data) {
    const message = `Tienes una solicitud de amistad.`;
    await insertNotification(row.friend_id, 'friend_request', message);
  }
};

/**
 * Sync menciones en posts → notificaciones
 */
export const syncMentions = async (userId: string) => {
  const { data, error } = await supabase
    .from('post_mentions')
    .select('id, mentioned_user_id, mentioned_by_user_id, created_at')
    .eq('mentioned_user_id', userId);

  if (error || !data) return;

  for (const row of data) {
    const message = `Te mencionaron en un post.`;
    await insertNotification(row.mentioned_user_id, 'mention', message);
  }
};

/**
 * Sync likes a tus posts → notificaciones
 */
export const syncPostLikes = async (userId: string) => {
  const { data, error } = await supabase
    .from('posts')
    .select('id')
    .eq('user_id', userId);

  if (error || !data) return;

  const postIds = data.map(p => p.id);

  const { data: likes, error: likesError } = await supabase
    .from('post_likes')
    .select('id, user_id, post_id, created_at')
    .in('post_id', postIds);

  if (likesError || !likes) return;

  for (const like of likes) {
    const message = `A alguien le gustó tu post.`;
    await insertNotification(userId, 'like', message);
  }
};

/**
 * Sync likes a tus comentarios → notificaciones
 */
export const syncCommentLikes = async (userId: string) => {
  const { data, error } = await supabase
    .from('comments')
    .select('id')
    .eq('user_id', userId);

  if (error || !data) return;

  const commentIds = data.map(c => c.id);

  const { data: likes, error: likesError } = await supabase
    .from('comment_likes')
    .select('id, user_id, comment_id, created_at')
    .in('comment_id', commentIds);

  if (likesError || !likes) return;

  for (const like of likes) {
    const message = `A alguien le gustó tu comentario.`;
    await insertNotification(userId, 'like', message);
  }
};

/**
 * Ejecutar todos los sync (sin duplicados)
 */
export const syncAllNotifications = async (userId: string) => {
  await syncFriendRequests(userId);
  await syncMentions(userId);
  await syncPostLikes(userId);
  await syncCommentLikes(userId);
};