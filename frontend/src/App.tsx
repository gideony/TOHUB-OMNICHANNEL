import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';

// Layout wrapper that includes the Sidebar
const Layout = () => {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--background)' }}>
        <Outlet />
      </main>
    </div>
  );
};

// Placeholders for other pages
import { Atendimentos } from './pages/Atendimentos/Atendimentos';
const Contatos = () => <div style={{ padding: 20 }}>Contatos Page</div>;
const ChatInterno = () => <div style={{ padding: 20 }}>Chat Interno Page</div>;
const Conexoes = () => <div style={{ padding: 20 }}>Conexões Page</div>;
const Usuarios = () => <div style={{ padding: 20 }}>Usuários Page</div>;
const Configuracoes = () => <div style={{ padding: 20 }}>Configurações Page</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/atendimentos" replace />} />

        {/* Authenticated Layout */}
        <Route element={<Layout />}>
          <Route path="atendimentos" element={<Atendimentos />} />
          <Route path="contatos" element={<Contatos />} />
          <Route path="chat-interno" element={<ChatInterno />} />
          <Route path="conexoes" element={<Conexoes />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="configuracoes" element={<Configuracoes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
