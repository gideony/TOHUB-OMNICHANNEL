import { useState, useEffect } from 'react';
import { ContactList } from './ContactList';
import { ChatBox } from './ChatBox';
import { api } from '../../config/api';
import { useSocket } from '../../hooks/useSocket';
import './styles.css';

export interface Message {
  id: string;
  body: string;
  direction: 'in' | 'out';
  created_at: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  source: 'whatsapp' | 'webchat';
  messages?: Message[]; // The backend sends messages mapped like this via the nested select
}

const mockInitialContacts: Contact[] = [
  { id: '1', name: 'João Silva', phone: '5585987654321', source: 'whatsapp', messages: [{id: 'm1', body: 'Olá, tudo bem?', direction: 'in', created_at: new Date().toISOString()}] },
  { id: '2', name: 'Maria Souza', phone: '5511999999999', source: 'whatsapp', messages: [{id: 'm2', body: 'Gostaria de um orçamento', direction: 'in', created_at: new Date().toISOString()}] }
];

export function Atendimentos() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  // Fetch all contacts with their latest messages
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await api.get('/messages/contacts');
        setContacts(response.data);
      } catch (error) {
        console.error('Failed to fetch contacts, using fallback data:', error);
        setContacts(mockInitialContacts); // Fallback to mock data if backend fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  // Realtime updates
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (payload: any) => {
      console.log('New message received via socket:', payload);
      const incomingContactId = payload.contact?.id || payload.contact_id;

      setContacts(prev => prev.map(c => {
        if (c.id === incomingContactId) {
          const newMsg: Message = {
            id: payload.message?.id || payload.id || Date.now().toString(),
            body: payload.message?.body || payload.body,
            direction: payload.message?.direction || payload.direction || 'in',
            created_at: payload.message?.timestamp || payload.created_at || new Date().toISOString()
          };
          const existingMessages = c.messages || [];
          return { ...c, messages: [...existingMessages, newMsg] };
        }
        return c;
      }));
    };

    socket.on('new_message', handleNewMessage);
    socket.on('new_message_sent', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('new_message_sent', handleNewMessage);
    };
  }, [socket]);

  if (loading) {
    return <div className="loading-state">Carregando atendimentos...</div>;
  }

  return (
    <div className="atendimentos-container">
      <div className="contacts-sidebar">
        <ContactList
          contacts={contacts}
          onSelectContact={setSelectedContact}
          selectedContactId={selectedContact?.id}
        />
      </div>
      <div className="chat-area">
        {selectedContact ? (
          <ChatBox contact={selectedContact} />
        ) : (
          <div className="empty-chat">
            <p>Selecione um contato para iniciar o atendimento</p>
          </div>
        )}
      </div>
    </div>
  );
}
