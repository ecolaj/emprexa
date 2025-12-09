import { supabase } from '../supabaseClient';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message_at: string;
  created_at: string;
  other_user?: {
    id: string; // 🆕 NUEVO: Agregar el id
    username: string;
    avatar_url?: string;
    plan_type: string;
  };
  last_message?: string;
  unread_count?: number;
}

export const getOrCreateConversation = async (user1Id: string, user2Id: string): Promise<string> => {
  const { data, error } = await supabase
    .rpc('get_or_create_conversation', { user1_uuid: user1Id, user2_uuid: user2Id });
  if (error) throw error;
  return data;
};

export const sendMessage = async (conversationId: string, senderId: string, content: string): Promise<Message> => {
  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        conversation_id: conversationId,
        sender_id: senderId,
        content: content.trim(),
        is_read: false // ✅ Solo columnas que sabemos que existen
        // ❌ NO incluir topic, extension, created_at
      }
    ])
    .select()
    .single();
  
  if (error) throw error;

  // Actualizar last_message_at en la conversación
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId);

  return data;
};

export const getMessages = async (conversationId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true }); // ✅ FIX: Usar created_at que sí existe
  if (error) throw error;
  return data || [];
};

export const markMessagesAsRead = async (conversationId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .eq('is_read', false);
  if (error) console.error('Error marcando mensajes como leídos:', error);
};

export const getUserConversations = async (userId: string): Promise<Conversation[]> => {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      user1:user1_id(id, username, avatar_url, plan_type),
      user2:user2_id(id, username, avatar_url, plan_type),
      messages!inner(id, is_read, sender_id, content, created_at)
    `)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('last_message_at', { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map((conv: any) => {
    const otherUser = conv.user1_id === userId ? conv.user2 : conv.user1;
    const unread = conv.messages?.filter((m: any) => m.sender_id !== userId && !m.is_read).length || 0;
    
    // Obtener el último mensaje
    const lastMessage = conv.messages?.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
    
    return { 
      ...conv, 
      other_user: otherUser, 
      unread_count: unread,
      last_message: lastMessage?.content || ''
    };
  });
};