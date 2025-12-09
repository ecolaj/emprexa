import { supabase } from '../supabaseClient';

export type NotificationType = 'friend_request' | 'mention' | 'like';

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  created_at: string;
};

/**
 * Obtiene notificaciones NO leídas del usuario actual
 */
export const getUnreadNotifications = async (userId: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('read', false)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('❌ Error obteniendo notificaciones:', error);
    return [];
  }

  return (data as Notification[]) || [];
};

/**
 * Marcar notificación como leída
 */
export const markAsRead = async (notificationId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('❌ Error marcando notificación como leída:', error);
    throw error; // 🔧 FIX: Lanzar error para que el componente pueda manejarlo
  }
};

/**
 * Insertar notificación manual (para usar desde otras funciones)
 * 🔧 FIX: Mejorada la lógica de prevención de duplicados
 */
 export const insertNotification = async (
  userId: string,
  type: NotificationType,
  message: string
): Promise<void> => {
  try {
    // ✅ FIX: Validar que userId no sea null/undefined
    if (!userId) {
      console.error('❌ Error: userId es requerido para insertar notificación');
      return;
    }

    // 1. Verificar si ya existe una notificación similar RECIENTE (últimas 24 horas)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const { data: existing, error: checkError } = await supabase
      .from('notifications')
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('type', type)
      .eq('message', message)
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (checkError) {
      console.error('Error verificando duplicados:', checkError);
      return;
    }

    // Si existe una notificación similar reciente, no insertar
    if (existing && existing.length > 0) {
      console.log('ℹ️ Notificación similar ya existe recientemente, no se duplica:', {
        userId,
        type,
        message,
        existingCreatedAt: existing[0].created_at
      });
      return;
    }

    // 2. Insertar la nueva notificación
    const { error: insertError } = await supabase.from('notifications').insert([
      {
        user_id: userId,
        type,
        message,
        read: false,
        created_at: new Date().toISOString()
      }
    ]);

    if (insertError) {
      console.error('❌ Error insertando notificación:', insertError);
      throw insertError;
    }

    console.log('✅ Notificación insertada correctamente:', {
      userId,
      type,
      message
    });

  } catch (error) {
    console.error('❌ Error en insertNotification:', error);
    throw error;
  }
};

/**
 * 🔧 NEW: Obtener todas las notificaciones (tanto leídas como no leídas)
 * Útil para historial de notificaciones
 */
export const getAllNotifications = async (userId: string, limit: number = 50): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('❌ Error obteniendo todas las notificaciones:', error);
    return [];
  }

  return (data as Notification[]) || [];
};

/**
 * 🔧 NEW: Marcar todas las notificaciones de un usuario como leídas
 */
export const markAllAsRead = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    console.error('❌ Error marcando todas las notificaciones como leídas:', error);
    throw error;
  }

  console.log('✅ Todas las notificaciones marcadas como leídas para usuario:', userId);
};

/**
 * 🔧 NEW: Limpiar notificaciones antiguas (mayores a 30 días)
 * Útil para mantener la base de datos limpia
 */
export const cleanupOldNotifications = async (userId: string): Promise<void> => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId)
    .eq('read', true) // Solo eliminar notificaciones leídas
    .lt('created_at', thirtyDaysAgo.toISOString());

  if (error) {
    console.error('❌ Error limpiando notificaciones antiguas:', error);
    throw error;
  }

  console.log('✅ Notificaciones antiguas limpiadas para usuario:', userId);
};