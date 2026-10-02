import type { Contact } from './Atendimentos';
import { User } from 'lucide-react';

interface ContactListProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  selectedContactId?: string;
}

export function ContactList({ contacts, onSelectContact, selectedContactId }: ContactListProps) {
  return (
    <div className="contact-list">
      <div className="contact-list-header">
        <h3>Atendimentos</h3>
      </div>
      <div className="contact-list-body">
        {contacts.length === 0 ? (
          <div className="empty-contacts">Nenhum atendimento no momento</div>
        ) : (
          contacts.map((contact) => {
            const lastMessageObj = contact.messages && contact.messages.length > 0
              ? contact.messages[contact.messages.length - 1]
              : null;

            return (
              <div
                key={contact.id}
                className={`contact-item ${selectedContactId === contact.id ? 'active' : ''}`}
                onClick={() => onSelectContact(contact)}
              >
                <div className="contact-avatar">
                  <User size={24} color="#7f8c8d" />
                </div>
                <div className="contact-info">
                  <h4 className="contact-name">{contact.name}</h4>
                  <p className="contact-last-message">{lastMessageObj ? lastMessageObj.body : 'Sem mensagens'}</p>
                </div>
                <div className="contact-meta">
                  <span className={`source-badge ${contact.source}`}>{contact.source}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
