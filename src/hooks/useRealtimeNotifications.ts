import { useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { insertNotification } from '../services/notificationService';

export const useRealtimeNotifications = (userId: string | undefined) => {
  const subscriptionsRef = useRef<Set<string>>(new Set());
  const isSubscribedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!userId) {
      console.log('🔔 Hook de notificaciones: userId no definido');
      return;
    }

    // 🆕 NUEVO: Prevenir suscripciones duplicadas
    if (isSubscribedRef.current) {
      console.log('🔔 Ya hay suscripciones activas, omitiendo nueva suscripción');
      return;
    }

    console.log('🔔 Hook de notificaciones activado para usuario:', userId);
    console.log('🔔 Creando suscripciones realtime...');

    isSubscribedRef.current = true;
    const channels: any[] = [];

    // 🆕 OPTIMIZADO: Función helper para crear suscripciones
    const createSubscription = (channelName: string, config: any, handler: (payload: any) => void) => {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          config,
          handler
        )
        .subscribe((status) => {
          console.log(`🔔 Suscripción a ${channelName} - Status:`, status);
          if (status === 'SUBSCRIBED') {
            subscriptionsRef.current.add(channelName);
          }
        });
      
      channels.push(channel);
      return channel;
    };

    // 1. Escuchar menciones
    createSubscription(
      'realtime-mentions',
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'post_mentions'
      },
      async (payload) => {
        const mention = payload.new;
        console.log('🔔 Mención recibida:', mention);
        
        if (mention.mentioned_user_id !== mention.mentioned_by_user_id) {
          const message = `📢 Te mencionaron en un post.`;
          console.log('🔔 Enviando notificación de mención a:', mention.mentioned_user_id);
          await insertNotification(mention.mentioned_user_id, 'mention', message);
        } else {
          console.log('🔔 No se envía notificación de mención (auto-mención)');
        }
      }
    );

    // 2. Escuchar likes a tus posts
    createSubscription(
      'realtime-post-likes',
      { event: 'INSERT', schema: 'public', table: 'post_likes' },
      async (payload) => {
        const like = payload.new;
        console.log('🔔 Like recibido:', like);
        
        const { data: post } = await supabase
          .from('posts')
          .select('user_id')
          .eq('id', like.post_id)
          .single();

        console.log('🔔 Post encontrado:', post);

        if (post && post.user_id !== like.user_id) {
          const message = `❤️ A alguien le gustó tu post.`;
          console.log('🔔 Enviando notificación a:', post.user_id);
          await insertNotification(post.user_id, 'like', message);
        } else {
          console.log('🔔 No se envía notificación (auto-like o post no encontrado)');
        }
      }
    );

    // 3. Escuchar nuevos comentarios en tus posts
    createSubscription(
      'realtime-comments',
      { event: 'INSERT', schema: 'public', table: 'comments' },
      async (payload) => {
        const comment = payload.new;
        console.log('🔔 Nuevo comentario recibido:', comment);
        
        const { data: post } = await supabase
          .from('posts')
          .select('user_id')
          .eq('id', comment.post_id)
          .single();

        console.log('🔔 Post encontrado:', post);

        if (post && post.user_id !== comment.user_id) {
          const { data: commenter } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', comment.user_id)
            .single();

          const commenterName = commenter?.username || 'Alguien';
          const message = `💬 ${commenterName} comentó en tu post: "${comment.content.substring(0, 30)}${comment.content.length > 30 ? '...' : ''}"`;
          
          console.log('🔔 Enviando notificación de comentario a:', post.user_id);
          await insertNotification(post.user_id, 'mention', message);
        } else {
          console.log('🔔 No se envía notificación de comentario (auto-comentario o post no encontrado)');
        }
      }
    );

    // 4. Escuchar likes a tus comentarios
    createSubscription(
      'realtime-comment-likes',
      { event: 'INSERT', schema: 'public', table: 'comment_likes' },
      async (payload) => {
        const like = payload.new;
        console.log('🔔 Like de comentario recibido:', like);
        
        const { data: comment } = await supabase
          .from('comments')
          .select('user_id')
          .eq('id', like.comment_id)
          .single();

        console.log('🔔 Comentario encontrado:', comment);

        if (comment && comment.user_id !== like.user_id) {
          const message = `👍 A alguien le gustó tu comentario.`;
          console.log('🔔 Enviando notificación de comentario a:', comment.user_id);
          await insertNotification(comment.user_id, 'like', message);
        } else {
          console.log('🔔 No se envía notificación de comentario (auto-like o comentario no encontrado)');
        }
      }
    );

    // 5. Escuchar solicitudes de amistad
    createSubscription(
      'realtime-friend-requests',
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'friendships', 
        filter: `friend_id=eq.${userId}` 
      },
      async (payload) => {
        const friendship = payload.new;
        console.log('🔔 Solicitud de amistad recibida:', friendship);
        console.log('🔔 Enviando notificación de amistad a:', friendship.friend_id);
        
        const message = `👥 Tienes una nueva solicitud de amistad.`;
        await insertNotification(friendship.friend_id, 'friend_request', message);
      }
    );

    // 6. Escuchar nuevos mensajes de chat
    createSubscription(
      'realtime-chat-messages',
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `sender_id=neq.${userId}`
      },
      async (payload) => {
        const message = payload.new;
        console.log('🔔 Mensaje de chat recibido:', message);
        
        const { data: conversation } = await supabase
          .from('conversations')
          .select('user1_id, user2_id')
          .eq('id', message.conversation_id)
          .single();

        console.log('🔔 Conversación encontrada:', conversation);

        if (conversation && (conversation.user1_id === userId || conversation.user2_id === userId)) {
          const { data: sender } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', message.sender_id)
            .single();

          const senderName = sender?.username || 'Alguien';
          const notificationMessage = `💬 ${senderName} te envió un mensaje: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`;
          
          console.log('🔔 Enviando notificación de chat a:', userId);
          await insertNotification(userId, 'mention', notificationMessage);
        } else {
          console.log('🔔 No se envía notificación de chat (mensaje no para este usuario)');
        }
      }
    );

    // 🆕 NUEVO: Cleanup mejorado y completo
    return () => {
      console.log('🔔 Limpiando suscripciones de notificaciones');
      console.log('🔔 Canales a limpiar:', channels.length);
      
      channels.forEach(channel => {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.error('🔔 Error removiendo canal:', error);
        }
      });

      // 🆕 NUEVO: Limpiar también el canal de debug si existe
      try {
        const debugChannel = supabase.channel('debug-comments');
        if (debugChannel) {
          supabase.removeChannel(debugChannel);
        }
      } catch (error) {
        console.error('🔔 Error removiendo canal debug:', error);
      }

      subscriptionsRef.current.clear();
      isSubscribedRef.current = false;
      
      console.log('🔔 Suscripciones limpiadas correctamente');
    };
  }, [userId]); // 🆕 SOLO userId como dependencia
};