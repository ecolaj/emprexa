import { supabase } from './supabaseService';

// Verificar estado de amistad entre dos usuarios
export const checkFriendshipStatus = async (currentUserId: string, targetUserId: string): Promise<'pending' | 'accepted' | 'rejected' | 'none'> => {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .select('status, user_id')
      .or(`and(user_id.eq.${currentUserId},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${currentUserId})`)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return 'none';
      console.error('Error verificando amistad:', error);
      return 'none';
    }

    return data?.status || 'none';
  } catch (error) {
    console.error('Error en checkFriendshipStatus:', error);
    return 'none';
  }
};

// Enviar solicitud de amistad
export const sendFriendRequest = async (currentUserId: string, targetUserId: string) => {
  try {
    // Verificar si ya existe una solicitud
    const { data: existing } = await supabase
      .from('friendships')
      .select('id')
      .or(`and(user_id.eq.${currentUserId},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${currentUserId})`)
      .single();

    if (existing) {
      throw new Error('Ya existe una solicitud de amistad entre estos usuarios');
    }

    const { data, error } = await supabase
      .from('friendships')
      .insert([
        {
          user_id: currentUserId,
          friend_id: targetUserId,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error enviando solicitud de amistad:', error);
    throw error;
  }
};

// Aceptar solicitud de amistad
export const acceptFriendRequest = async (friendshipId: string) => {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .update({ 
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('id', friendshipId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error aceptando solicitud:', error);
    throw error;
  }
};

// Rechazar o cancelar solicitud de amistad
export const rejectOrCancelFriendship = async (currentUserId: string, targetUserId: string) => {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .delete()
      .or(`and(user_id.eq.${currentUserId},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${currentUserId})`);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error rechazando/cancelando amistad:', error);
    throw error;
  }
};

// Obtener solicitudes pendientes del usuario actual
export const getPendingFriendRequests = async (userId: string) => {
  try {
    console.log('Buscando solicitudes para usuario:', userId);
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id,
        user_id,
        friend_id,
        status,
        created_at,
        profiles!friendships_user_id_fkey (
          username,
          plan_type,
          avatar_url
        )
      `)
      .eq('friend_id', userId)
      .eq('status', 'pending');

    if (error) throw error;
    console.log('Solicitudes encontradas:', data);
    return data || [];
  } catch (error) {
    console.error('Error obteniendo solicitudes pendientes:', error);
    return [];
  }
};