import { useState, useEffect } from 'react';
import type { Contact, Message } from './Atendimentos';
import { Send, User } from 'lucide-react';
import { api } from '../../config/api';
import { useSocket } from '../../hooks/useSocket';

interface ChatBoxProps {
  contact: Contact;
}

export function ChatBox({ contact }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  // Load history messages when a contact is selected
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/messages/${contact.id}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Failed to fetch messages, using fallback:', error);
        setMessages(contact.messages || []); // Fallback to mock data if backend fetch fails
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [contact.id, contact.messages]);

  // Listen for realtime incoming messages specifically for this chat box
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (payload: any) => {
      const incomingContactId = payload.contact?.id || payload.contact_id;
      if (incomingContactId === contact.id) {
        const newMsg: Message = {
          id: payload.message?.id || payload.id || Date.now().toString(),
          body: payload.message?.body || payload.body,
          direction: payload.message?.direction || payload.direction || 'in',
          created_at: payload.message?.timestamp || payload.created_at || new Date().toISOString()
        };

        setMessages(prev => {
          // Avoid duplicates (Socket.io sometimes fires multiple times in dev or due to emit)
          if (prev.find(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('new_message_sent', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('new_message_sent', handleNewMessage);
    };
  }, [socket, contact.id]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const body = inputValue;
    setInputValue(''); // Optimistic clear

    try {
      // Typically you'd get the actual logged-in user id, sending a fake uuid for MVP if undefined
      const userId = '00000000-0000-0000-0000-000000000000';
      await api.post('/messages', {
        contactId: contact.id,
        body,
        userId
      });
      // The socket event 'new_message_sent' will echo the message back and append it to the chat
    } catch (error) {
      console.error('Failed to send message, appending locally:', error);
      // Fallback: append message locally if API is not available
      const newMsg: Message = {
          id: Date.now().toString(),
          body,
          direction: 'out',
          created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMsg]);
    }
  };

  return (
    <div className="chat-box">
      <div className="chat-header">
        <div className="contact-avatar">
           <User size={24} color="#7f8c8d" />
        </div>
        <div className="contact-info">
          <h3>{contact.name}</h3>
          <span>{contact.phone}</span>
        </div>
      </div>

      <div className="chat-messages">
        {loading ? (
          <div style={{ textAlign: 'center', color: '#7f8c8d', marginTop: 20 }}>Carregando histórico...</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#7f8c8d', marginTop: 20 }}>Nenhuma mensagem encontrada</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.direction}`}>
              <div className="message-bubble">
                <p>{msg.body}</p>
                <span className="message-time">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          placeholder="Digite sua mensagem..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="send-button" onClick={handleSend}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
