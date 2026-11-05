import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Logo } from './Logo.jsx';
import { useCarrito } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const enlaces = [
  { to: '/contacto', label: 'Contacto' },
];

export function Layout() {
  const location = useLocation();
  const { unidades } = useCarrito();
  const { autenticada, esAdmin } = useAuth();
  const mostrarBotonFlotante = !esAdmin && !autenticada && location.pathname !== '/usuario';
  const mostrarNavegacionCompleta = !esAdmin && autenticada;

  if (esAdmin) {
    return (
      <main>
        <div className="contenedor contenedor--admin">
          <Outlet />
        </div>
      </main>
    );
  }

  return (
    <>
      <header className="encabezado">
        <nav className="nav contenedor" aria-label="Navegación principal">
          {mostrarNavegacionCompleta && (
            <>
              {enlaces.map((e) => (
                <NavLink key={e.to} className="nav__enlace" to={e.to}>
                  {e.label}
                </NavLink>
              ))}
              <NavLink className="nav__enlace nav__carrito" to="/carrito">
                Tu carrito
                <span className="contador" hidden={unidades === 0}>{unidades}</span>
              </NavLink>
              <NavLink className="nav__enlace" to="/productos">Productos</NavLink>
              <NavLink className="nav__enlace" to="/usuario">Perfil</NavLink>
            </>
          )}

          {!autenticada && (
            <>
              <NavLink className="nav__logo" to="/" aria-label="Inicio - The Fandom House">
                <Logo />
              </NavLink>
              <NavLink className="nav__enlace" to="/productos">Productos</NavLink>
              <NavLink className="nav__enlace" to="/contacto">Contacto</NavLink>
            </>
          )}
        </nav>
      </header>
      <main>
        <div className="contenedor">
          <Outlet />
        </div>
      </main>
      {mostrarBotonFlotante && (
        <Link className="floating-cta" to="/usuario">
          Inicia sesión para comprar
        </Link>
      )}
      <footer className="pie">
        <p>© 2026 The Fandom House · Accesorios para cada fandom</p>
        {esAdmin && <NavLink className="pie__admin" to="/admin">Panel de administración</NavLink>}
      </footer>
    </>
  );
}
