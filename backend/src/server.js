/**
 * Servidor HTTP de The Fandom House.
 * Expone la API REST que consume el frontend (catálogo, contacto, pedidos y admin).
 */
import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { leer, actualizar, buscarUsuarioPorEmail, crearUsuario, guardarSesionAdmin, guardarSesionUsuario, inicializarMysql, listarUsuarios } from './db.js';
import { exigirAdmin, exigirUsuario, firmarToken, validarCredenciales } from './auth.js';
import { DESTACADOS } from './seed.js';

const app = express();
const PUERTO = Number(process.env.PORT) || 4000;
const DURACION_SESION_MS = 30 * 60 * 1000;

app.use(cors());
app.use(express.json());

function nuevoId(prefijo) {
  return `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

app.get('/api/salud', (_req, res) => {
  res.json({ ok: true, marca: 'The Fandom House' });
});

app.get('/api/catalogo', async (_req, res) => {
  const store = await leer();
  res.json({
    categorias: store.categorias,
    productos: store.productos,
    destacados: DESTACADOS,
  });
});

app.post('/api/contacto', async (req, res) => {
  const { nombre, correo, mensaje } = req.body || {};
  if (!nombre?.trim() || !correo?.trim() || !mensaje?.trim()) {
    return res.status(400).json({ error: 'Nombre, correo y mensaje son obligatorios.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return res.status(400).json({ error: 'El correo no tiene un formato válido.' });
  }
  const registro = {
    id: nuevoId('msg'),
    nombre: nombre.trim(),
    correo: correo.trim(),
    mensaje: mensaje.trim(),
    leido: false,
    creadoEn: new Date().toISOString(),
  };
  await actualizar((store) => {
    store.mensajes.unshift(registro);
  });
  res.status(201).json({ ok: true, mensaje: 'Recibimos tu mensaje. Te responderemos pronto.' });
});

app.post('/api/pedidos', async (req, res) => {
  const { items, cliente } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'El pedido no tiene productos.' });
  }
  const store = await leer();
  const lineas = [];
  for (const item of items) {
    const producto = store.productos.find((p) => p.id === item.id);
    if (!producto) {
      return res.status(400).json({ error: `El producto ${item.id} ya no está disponible.` });
    }
    const cantidad = Number(item.cantidad) || 0;
    if (cantidad < 1) {
      return res.status(400).json({ error: 'Hay una cantidad inválida en el carrito.' });
    }
    lineas.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad,
    });
  }
  const pedido = {
    id: nuevoId('ord'),
    cliente: {
      nombre: cliente?.nombre?.trim() || 'Cliente web',
      correo: cliente?.correo?.trim() || '',
    },
    items: lineas,
    total: lineas.reduce((t, i) => t + i.precio * i.cantidad, 0),
    estado: 'recibido',
    creadoEn: new Date().toISOString(),
  };
  await actualizar((s) => {
    s.pedidos.unshift(pedido);
  });
  res.status(201).json({ ok: true, pedido });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
  }

  const correo = String(email).trim().toLowerCase();
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@thefandomhouse.com').trim().toLowerCase();

  if (correo === adminEmail) {
    const valido = await validarCredenciales(correo, password);
    if (!valido) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }
    const jti = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + DURACION_SESION_MS);
    await guardarSesionAdmin({ email: correo, jti, expiresAt });
    const token = firmarToken({ email: correo, rol: 'admin', jti }, '30m');
    return res.json({ token, email: correo, rol: 'admin', expiresIn: '30m' });
  }

  const usuario = await buscarUsuarioPorEmail(correo);
  if (!usuario) {
    return res.status(401).json({ error: 'Credenciales incorrectas.' });
  }

  const passwordValida = await bcrypt.compare(String(password), usuario.passwordHash);
  if (!passwordValida) {
    return res.status(401).json({ error: 'Credenciales incorrectas.' });
  }

  const jti = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + DURACION_SESION_MS);
  await guardarSesionUsuario({ email: usuario.email, jti, expiresAt });
  const token = firmarToken({ email: usuario.email, rol: 'usuario', nombre: usuario.nombre, jti }, '30m');
  return res.json({ token, email: usuario.email, rol: 'usuario', nombre: usuario.nombre, expiresIn: '30m' });
});

app.post('/api/usuario/registro', async (req, res) => {
  const { nombre, email, password } = req.body || {};
  const nombreLimpio = String(nombre || '').trim();
  const correo = String(email || '').trim().toLowerCase();
  const passwordLimpia = String(password || '');

  if (!nombreLimpio || !correo || !passwordLimpia) {
    return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios.' });
  }

  if (passwordLimpia.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    const usuario = await crearUsuario({ nombre: nombreLimpio, email: correo, password: passwordLimpia });
    const jti = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + DURACION_SESION_MS);
    await guardarSesionUsuario({ email: usuario.email, jti, expiresAt });
    const token = firmarToken({ email: usuario.email, rol: 'usuario', nombre: usuario.nombre, jti }, '30m');
    return res.status(201).json({
      ok: true,
      token,
      rol: 'usuario',
      expiresIn: '30m',
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
    });
  } catch (error) {
    return res.status(409).json({ error: error.message || 'No se pudo registrar el usuario.' });
  }
});

app.get('/api/usuario/perfil', exigirUsuario, async (req, res) => {
  if (req.usuario.rol !== 'usuario') {
    return res.status(403).json({ error: 'Este endpoint es solo para usuarios.' });
  }

  const usuario = await buscarUsuarioPorEmail(req.usuario.email);
  if (!usuario) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }

  res.json({
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: 'usuario',
  });
});

app.get('/api/admin/resumen', exigirAdmin, async (_req, res) => {
  const store = await leer();
  res.json({
    productos: store.productos.length,
    mensajes: store.mensajes.length,
    mensajesNuevos: store.mensajes.filter((m) => !m.leido).length,
    pedidos: store.pedidos.length,
  });
});

app.get('/api/admin/mensajes', exigirAdmin, async (_req, res) => {
  const store = await leer();
  res.json(store.mensajes);
});

app.get('/api/admin/usuarios', exigirAdmin, async (_req, res) => {
  const usuarios = await listarUsuarios();
  res.json(usuarios);
});

app.patch('/api/admin/mensajes/:id', exigirAdmin, async (req, res) => {
  const actualizado = await actualizar((store) => {
    const mensaje = store.mensajes.find((m) => m.id === req.params.id);
    if (!mensaje) return null;
    mensaje.leido = true;
    return mensaje;
  });
  if (!actualizado) return res.status(404).json({ error: 'Mensaje no encontrado.' });
  res.json(actualizado);
});

app.get('/api/admin/pedidos', exigirAdmin, async (_req, res) => {
  const store = await leer();
  res.json(store.pedidos);
});

app.post('/api/admin/productos', exigirAdmin, async (req, res) => {
  const { nombre, categoria, precio, color, stock, imagen } = req.body || {};
  if (!nombre?.trim() || !categoria || precio === undefined || precio === '') {
    return res.status(400).json({ error: 'Nombre, categoría y precio son obligatorios.' });
  }
  const store = await leer();
  if (!store.categorias[categoria]) {
    return res.status(400).json({ error: 'La categoría no existe.' });
  }
  const producto = {
    id: nuevoId('prd'),
    nombre: nombre.trim(),
    categoria,
    precio: Number(precio),
    color: color || '#E09F3E',
    stock: Number(stock) || 0,
    imagen: imagen?.trim() || null,
  };
  await actualizar((s) => {
    s.productos.push(producto);
  });
  res.status(201).json(producto);
});

app.put('/api/admin/productos/:id', exigirAdmin, async (req, res) => {
  const producto = await actualizar((store) => {
    const actual = store.productos.find((p) => p.id === req.params.id);
    if (!actual) return null;
    const { nombre, categoria, precio, color, stock, imagen } = req.body || {};
    if (nombre) actual.nombre = nombre.trim();
    if (categoria && store.categorias[categoria]) actual.categoria = categoria;
    if (precio !== undefined) actual.precio = Number(precio);
    if (color) actual.color = color;
    if (stock !== undefined) actual.stock = Number(stock);
    if (imagen !== undefined) actual.imagen = imagen?.trim() || null;
    return actual;
  });
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado.' });
  res.json(producto);
});

app.delete('/api/admin/productos/:id', exigirAdmin, async (req, res) => {
  const eliminado = await actualizar((store) => {
    const indice = store.productos.findIndex((p) => p.id === req.params.id);
    if (indice === -1) return false;
    store.productos.splice(indice, 1);
    return true;
  });
  if (!eliminado) return res.status(404).json({ error: 'Producto no encontrado.' });
  res.json({ ok: true });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Ocurrió un error inesperado en el servidor.' });
});

async function iniciarServidor() {
  await inicializarMysql();
  app.listen(PUERTO, () => {
    console.log(`API The Fandom House en http://localhost:${PUERTO}`);
  });
}

iniciarServidor();
