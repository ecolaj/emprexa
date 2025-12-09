import React, { useState, useEffect, useRef } from 'react';
import { COLORS } from '../../utils/constants';
import { Message, sendMessage, getMessages, markMessagesAsRead, getOrCreateConversation } from '../../services/chatService';
import { User } from '../../types';
import { supabase } from '../../supabaseClient';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  targetUser: {
    id: string;
    username: string;
    avatar_url?: string;
    plan_type: string;
  };
  conversationId?: string;
  onShowProfile: (userId: string) => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  targetUser,
  conversationId,
  onShowProfile,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const tempIdRef = useRef<string>('');

  useEffect(() => {
    if (isOpen) {
      // 🔧 FIX: Guardar la posición actual del scroll
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // 🔧 FIX: Restaurar la posición del scroll al cerrar
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
    
    return () => {
      // Limpiar al desmontar
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !currentUser) return;
    let sub: any;

    const load = async () => {
      setLoading(true);
      try {
        const convId = conversationId || await getOrCreateConversation(currentUser.id, targetUser.id);
        const msgs = await getMessages(convId);
        setMessages(msgs);
        await markMessagesAsRead(convId, currentUser.id);

        sub = supabase
          .channel(`chat-${convId}`)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${convId}` },
            (payload) => {
              console.log('📡 Modal - mensaje recibido por Realtime:', payload);
              const real = payload.new as Message;
              setMessages(prev => {
                const exist = prev.find(m => m.id === real.id);
                if (exist) return prev;
                const cleaned = prev.filter(m => m.id !== tempIdRef.current);
                return [...cleaned, real];
              });
              if (real.sender_id !== currentUser.id) markMessagesAsRead(convId, currentUser.id);
              scrollToBottom();
            }
          )
          .subscribe((status) => console.log('📡 Modal canal status:', status));
      } catch (e) { console.error(e); } finally { setLoading(false); scrollToBottom(); }
    };
    load();
    return () => { if (sub) supabase.removeChannel(sub); };
  }, [isOpen, currentUser, targetUser.id, conversationId]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || sending) return;
    setSending(true);
    const text = newMsg.trim();
    const convId = conversationId || await getOrCreateConversation(currentUser.id, targetUser.id);
    const tempId = `temp-${Date.now()}`;
    tempIdRef.current = tempId;
    const temp: Message = { id: tempId, conversation_id: convId, sender_id: currentUser.id, content: text, is_read: true, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, temp]);
    setNewMsg('');
    scrollToBottom();
    try {
      await sendMessage(convId, currentUser.id, text);
      // 🔄 Notificar al Header que recalcule
      window.dispatchEvent(new Event('chat:sent'));
      // 🔄 Notificar al Header que recalcule
window.dispatchEvent(new Event('chat:sent'));
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      alert('No se pudo enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1000,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '60px'
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: COLORS.white, borderRadius: 12, width: '90%', maxWidth: 500,
        maxHeight: 'calc(80vh - 60px)', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,.3)'
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${COLORS.accent}33`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  {console.log("🔵 ChatModal render - targetUser:", targetUser)}
  {console.log("🔵 ChatModal render - targetUser.id:", targetUser?.id)}
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div onClick={() => {
  console.log("🟡 ChatModal - targetUser:", targetUser);
  console.log("🟡 ChatModal - targetUser.id:", targetUser?.id);
  onShowProfile(targetUser.id);
}} style={{
  width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', cursor: 'pointer',
  background: targetUser.avatar_url ? 'transparent' : COLORS.secondary, color: COLORS.white,
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 16
}}>
              {targetUser.avatar_url ? <img src={targetUser.avatar_url} alt="A" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                targetUser.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div onClick={() => onShowProfile(targetUser.id)} style={{ fontWeight: 600, color: COLORS.primary, cursor: 'pointer' }}>@{targetUser.username}</div>
              <div style={{ fontSize: 12, color: COLORS.gray }}>{targetUser.plan_type === 'premium' ? '⭐ Premium' : 'Free'}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: COLORS.gray, cursor: 'pointer' }}>✕</button>
        </div>

        {/* Mensajes */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading ? <div style={{ textAlign: 'center', color: COLORS.gray }}>Cargando...</div> :
            messages.length === 0 ?
              <div style={{ textAlign: 'center', color: COLORS.gray, padding: '40px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>💬</div>
                <p>Inicia una conversación con @{targetUser.username}</p>
              </div> :
              messages.map(m => (
                <div key={m.id} style={{ display: 'flex', justifyContent: m.sender_id === currentUser.id ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '70%', padding: '10px 14px', borderRadius: 18, wordBreak: 'break-word',
                    background: m.sender_id === currentUser.id ? COLORS.primary : COLORS.light,
                    color: m.sender_id === currentUser.id ? COLORS.white : COLORS.primary,
                    opacity: m.id.startsWith('temp-') ? .7 : 1
                  }}>
                    {m.content}{m.id.startsWith('temp-') && ' ⏳'}
                  </div>
                </div>
              ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} style={{ padding: '16px 20px', borderTop: `1px solid ${COLORS.accent}33` }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder="Escribe un mensaje..."
              disabled={sending}
              style={{ flex: 1, padding: '12px 16px', border: `1px solid ${COLORS.accent}`, borderRadius: 24, outline: 'none' }}
            />
            <button
              type="submit"
              disabled={!newMsg.trim() || sending}
              style={{
                background: COLORS.primary, color: COLORS.white, border: 'none', borderRadius: 24,
                padding: '12px 20px', cursor: newMsg.trim() && !sending ? 'pointer' : 'not-allowed',
                opacity: newMsg.trim() && !sending ? 1 : .6, fontWeight: 600
              }}
            >
              {sending ? '⏳' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};