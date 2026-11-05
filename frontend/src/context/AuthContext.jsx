import { createContext, useContext, useMemo, useState } from 'react';
import { api } from '../api.js';

const AuthContext = createContext(null);

function limpiarSesion() {
  localStorage.removeItem('tfh:token');
  localStorage.removeItem('tfh:admin-email');
  localStorage.removeItem('tfh:usuario-email');
  localStorage.removeItem('tfh:rol');
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('tfh:token'));
  const [email, setEmail] = useState(() => localStorage.getItem('tfh:usuario-email') || localStorage.getItem('tfh:admin-email'));
  const [rol, setRol] = useState(() => localStorage.getItem('tfh:rol') || 'usuario');

  const valor = useMemo(() => ({
    token,
    email,
    rol,
    autenticada: Boolean(token),
    esAdmin: rol === 'admin',
    async login(credenciales) {
      const correo = String(credenciales?.email || '').trim();
      const password = String(credenciales?.password || '');

      if (!correo || !password) {
        throw new Error('Correo y contraseña son obligatorios.');
      }

      const datos = await api.login({ email: correo, password });

      localStorage.setItem('tfh:token', datos.token);
      localStorage.setItem('tfh:usuario-email', datos.email);
      localStorage.setItem('tfh:rol', datos.rol);
      if (datos.rol === 'admin') {
        localStorage.setItem('tfh:admin-email', datos.email);
      } else {
        localStorage.removeItem('tfh:admin-email');
      }

      setToken(datos.token);
      setEmail(datos.email);
      setRol(datos.rol);

      return {
        rol: datos.rol,
        redirectTo: datos.rol === 'admin' ? '/admin' : '/usuario',
      };
    },
    async registro(credenciales) {
      const nombre = String(credenciales?.nombre || '').trim();
      const correo = String(credenciales?.email || '').trim();
      const password = String(credenciales?.password || '');

      if (!nombre || !correo || !password) {
        throw new Error('Nombre, correo y contraseña son obligatorios.');
      }

      const datos = await api.registro({ nombre, email: correo, password });

      localStorage.setItem('tfh:token', datos.token);
      localStorage.setItem('tfh:usuario-email', datos.usuario.email);
      localStorage.setItem('tfh:rol', 'usuario');
      localStorage.removeItem('tfh:admin-email');
      setToken(datos.token);
      setEmail(datos.usuario.email);
      setRol('usuario');

      return {
        rol: 'usuario',
        redirectTo: '/usuario',
      };
    },
    salir() {
      limpiarSesion();
      setToken(null);
      setEmail(null);
      setRol('usuario');
    },
  }), [token, email, rol]);

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
