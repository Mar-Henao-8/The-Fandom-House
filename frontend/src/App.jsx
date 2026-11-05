import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { Home } from './pages/Home.jsx';
import { Productos } from './pages/Productos.jsx';
import { Carrito } from './pages/Carrito.jsx';
import { Contacto } from './pages/Contacto.jsx';
import { Usuario } from './pages/Usuario.jsx';
import { Admin } from './pages/Admin.jsx';

function RutaAdminPrivada({ children }) {
  const { autenticada, esAdmin } = useAuth();
  if (!autenticada) return <Navigate to="/usuario" replace />;
  if (!esAdmin) return <Navigate to="/productos" replace />;
  return children;
}

function RutaClientePrivada({ children }) {
  const { autenticada, esAdmin } = useAuth();
  if (!autenticada) return <Navigate to="/usuario" replace />;
  if (esAdmin) return <Navigate to="/admin" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/productos/:categoria" element={<Productos />} />
        <Route path="/carrito" element={<RutaClientePrivada><Carrito /></RutaClientePrivada>} />
        <Route path="/contacto" element={<RutaClientePrivada><Contacto /></RutaClientePrivada>} />
        <Route path="/usuario" element={<Usuario />} />
        <Route path="/admin/login" element={<Navigate to="/usuario" replace />} />
        <Route
          path="/admin"
          element={(
            <RutaAdminPrivada>
              <Admin />
            </RutaAdminPrivada>
          )}
        />
      </Route>
    </Routes>
  );
}
