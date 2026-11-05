/**
 * Autenticación del panel de administrador con JWT.
 * El token viaja en Authorization: Bearer y caduca en 30 minutos.
 */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { leer, sesionValida } from './db.js';

const SECRETO = process.env.JWT_SECRET || 'tfh-secreto-local-cambiar-en-produccion';

export function firmarToken(payload, expiresIn = '30m') {
  return jwt.sign(payload, SECRETO, { expiresIn });
}

async function validarSesionActual(payload) {
  if (!payload?.email || !payload?.jti || !payload?.rol) return false;
  return sesionValida({ rol: payload.rol, email: payload.email, jti: payload.jti });
}

export async function validarCredenciales(email, password) {
  const store = await leer();
  if (email.trim().toLowerCase() !== store.admin.email.toLowerCase()) {
    return false;
  }
  return bcrypt.compare(password, store.admin.passwordHash);
}

export async function exigirAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Necesitas iniciar sesión como administradora.' });
  }
  try {
    const payload = jwt.verify(token, SECRETO);
    if (payload.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos de administrador.' });
    }

    const valido = await validarSesionActual(payload);
    if (!valido) {
      return res.status(401).json({ error: 'La sesión expiró o fue invalidada en otro dispositivo.' });
    }

    req.admin = payload;
    return next();
  } catch {
    return res.status(401).json({ error: 'La sesión expiró. Vuelve a iniciar sesión.' });
  }
}

export async function exigirUsuario(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Necesitas iniciar sesión para acceder a tu perfil.' });
  }
  try {
    const payload = jwt.verify(token, SECRETO);
    const valido = await validarSesionActual(payload);
    if (!valido) {
      return res.status(401).json({ error: 'La sesión expiró o fue invalidada en otro dispositivo.' });
    }
    req.usuario = payload;
    return next();
  } catch {
    return res.status(401).json({ error: 'La sesión expiró. Vuelve a iniciar sesión.' });
  }
}
