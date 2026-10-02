import { NavLink } from 'react-router-dom';
import { MessageCircle, Users, MessageSquare, Settings, Plug, UserCog } from 'lucide-react';
import './Sidebar.css';

export function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <h2>JULES</h2>
      </div>

      <div className="sidebar-menu">
        <p className="menu-label">🏢 OPERACIONAL</p>
        <NavLink to="/atendimentos" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          <MessageCircle size={20} />
          <span>Atendimentos</span>
        </NavLink>
        <NavLink to="/contatos" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span>Contatos</span>
        </NavLink>
        <NavLink to="/chat-interno" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          <MessageSquare size={20} />
          <span>Chat Interno</span>
        </NavLink>
      </div>

      <div className="sidebar-menu">
        <p className="menu-label">⚙️ ADMINISTRAÇÃO</p>
        <NavLink to="/conexoes" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          <Plug size={20} />
          <span>Conexões</span>
        </NavLink>
        <NavLink to="/usuarios" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          <UserCog size={20} />
          <span>Usuários</span>
        </NavLink>
        <NavLink to="/configuracoes" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          <span>Configurações</span>
        </NavLink>
      </div>
    </div>
  );
}
