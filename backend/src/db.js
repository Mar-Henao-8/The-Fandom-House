/**
 * Persistencia de la app con Turso / LibSQL.
 * Mantiene la misma API de acceso que usaba el backend MySQL para no tocar la lógica de negocio.
 */
import bcrypt from 'bcryptjs';
import { createClient } from '@libsql/client';
import { CATEGORIAS, PRODUCTOS_INICIALES } from './seed.js';

function fechaMysql(date = new Date()) {
  const fecha = new Date(date);
  if (Number.isNaN(fecha.getTime())) return new Date().toISOString().slice(0, 19).replace('T', ' ');
  return fecha.toISOString().slice(0, 19).replace('T', ' ');
}

let cache = null;
let db = null;

function fechaSegura(valor, fallback = new Date()) {
  if (!valor) return new Date(fallback).toISOString();
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return new Date(fallback).toISOString();
  return fecha.toISOString();
}

function obtenerConfigDb() {
  const url = process.env.TURSO_DATABASE_URL || process.env.DB_URL || 'file:./data/the-fandom-house.db';
  const authToken = process.env.TURSO_AUTH_TOKEN || process.env.DB_AUTH_TOKEN || process.env.DB_TOKEN || undefined;
  return { url, authToken };
}

function obtenerDb() {
  if (db) return db;

  const { url, authToken } = obtenerConfigDb();
  db = createClient({ url, authToken });
  return db;
}

async function estadoInicial() {
  const password = process.env.ADMIN_PASSWORD || 'fandom2026';
  const passwordHash = await bcrypt.hash(password, 10);
  return {
    categorias: CATEGORIAS,
    productos: PRODUCTOS_INICIALES,
    mensajes: [],
    pedidos: [],
    admin: {
      email: process.env.ADMIN_EMAIL || 'admin@thefandomhouse.com',
      passwordHash,
    },
  };
}

async function ejecutarQuery(sql, params = []) {
  const conexion = obtenerDb();
  return conexion.execute({ sql, args: params });
}

async function columnaExiste(nombreTabla, nombreColumna) {
  const conexion = obtenerDb();
  const resultado = await conexion.execute({ sql: `PRAGMA table_info(${JSON.stringify(nombreTabla)})`, args: [] });
  const columnas = resultado.rows || [];
  return columnas.some((columna) => String(columna.name || columna[1]).toLowerCase() === nombreColumna.toLowerCase());
}

export async function inicializarMysql() {
  const conexion = obtenerDb();

  await conexion.execute(`CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      nombre TEXT NOT NULL,
      descripcion TEXT NOT NULL
    );`);

  await conexion.execute(`CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      categoria TEXT NOT NULL,
      precio INTEGER NOT NULL,
      color TEXT DEFAULT '#E09F3E',
      stock INTEGER NOT NULL DEFAULT 0,
      imagen TEXT NULL
    );`);

  await conexion.execute(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      session_jti TEXT NULL,
      session_expires_at TEXT NULL,
      creado_en TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );`);

  await conexion.execute(`CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      correo TEXT NOT NULL,
      mensaje TEXT NOT NULL,
      leido INTEGER NOT NULL DEFAULT 0,
      creado_en TEXT NOT NULL
    );`);

  await conexion.execute(`CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      nombre_cliente TEXT NOT NULL,
      correo_cliente TEXT NOT NULL,
      total INTEGER NOT NULL,
      estado TEXT NOT NULL DEFAULT 'recibido',
      creado_en TEXT NOT NULL
    );`);

  await conexion.execute(`CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      producto_id TEXT NOT NULL,
      nombre TEXT NOT NULL,
      precio INTEGER NOT NULL,
      cantidad INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );`);

  await conexion.execute(`CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      session_jti TEXT NULL,
      session_expires_at TEXT NULL
    );`);

  if (!(await columnaExiste('users', 'session_jti'))) {
    await conexion.execute('ALTER TABLE users ADD COLUMN session_jti TEXT NULL');
  }
  if (!(await columnaExiste('users', 'session_expires_at'))) {
    await conexion.execute('ALTER TABLE users ADD COLUMN session_expires_at TEXT NULL');
  }
  if (!(await columnaExiste('admin', 'session_jti'))) {
    await conexion.execute('ALTER TABLE admin ADD COLUMN session_jti TEXT NULL');
  }
  if (!(await columnaExiste('admin', 'session_expires_at'))) {
    await conexion.execute('ALTER TABLE admin ADD COLUMN session_expires_at TEXT NULL');
  }
  if (!(await columnaExiste('products', 'imagen'))) {
    await conexion.execute('ALTER TABLE products ADD COLUMN imagen TEXT NULL');
  }

  const adminRows = await ejecutarQuery('SELECT COUNT(*) AS total FROM admin');
  const totalAdmin = Number((adminRows.rows?.[0]?.total ?? adminRows.rows?.[0]?.[0] ?? 0));
  if (totalAdmin === 0) {
    const admin = await estadoInicial();
    await ejecutarQuery('INSERT INTO admin (email, password_hash) VALUES (?, ?)', [admin.admin.email, admin.admin.passwordHash]);
  }

  const categoriasRows = await ejecutarQuery('SELECT COUNT(*) AS total FROM categories');
  const totalCategorias = Number((categoriasRows.rows?.[0]?.total ?? categoriasRows.rows?.[0]?.[0] ?? 0));
  if (totalCategorias === 0) {
    const admin = await estadoInicial();
    for (const [slug, info] of Object.entries(admin.categorias)) {
      await ejecutarQuery('INSERT INTO categories (slug, nombre, descripcion) VALUES (?, ?, ?)', [slug, info.nombre, info.descripcion]);
    }
  }

  const productosRows = await ejecutarQuery('SELECT COUNT(*) AS total FROM products');
  const totalProductos = Number((productosRows.rows?.[0]?.total ?? productosRows.rows?.[0]?.[0] ?? 0));
  if (totalProductos === 0) {
    const admin = await estadoInicial();
    for (const producto of admin.productos) {
      await ejecutarQuery(
        'INSERT INTO products (id, nombre, categoria, precio, color, stock, imagen) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [producto.id, producto.nombre, producto.categoria, producto.precio, producto.color, producto.stock, producto.imagen || null],
      );
    }
  }

  const usuarioTestRows = await ejecutarQuery('SELECT COUNT(*) AS total FROM users WHERE email = ?', ['test@gmail.com']);
  const totalUsuariosTest = Number((usuarioTestRows.rows?.[0]?.total ?? usuarioTestRows.rows?.[0]?.[0] ?? 0));
  if (totalUsuariosTest === 0) {
    const passwordHash = await bcrypt.hash('password1234', 10);
    await ejecutarQuery('INSERT INTO users (nombre, email, password_hash) VALUES (?, ?, ?)', ['Usuario Test', 'test@gmail.com', passwordHash]);
  }
}

export async function listarUsuarios() {
  const rows = (await ejecutarQuery('SELECT id, nombre, email, creado_en FROM users ORDER BY creado_en DESC')).rows || [];
  return rows.map((usuario) => ({
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    creadoEn: usuario.creado_en,
    rol: 'usuario',
  }));
}

export async function buscarUsuarioPorEmail(email) {
  const correo = String(email || '').trim().toLowerCase();
  if (!correo) return null;
  const rows = (await ejecutarQuery('SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1', [correo])).rows || [];
  if (!rows[0]) return null;
  return {
    id: rows[0].id,
    nombre: rows[0].nombre,
    email: rows[0].email,
    passwordHash: rows[0].password_hash,
  };
}

export async function crearUsuario({ nombre, email, password }) {
  const correo = String(email || '').trim().toLowerCase();
  const nombreLimpio = String(nombre || '').trim();
  if (!nombreLimpio || !correo || !password) {
    throw new Error('Nombre, correo y contraseña son obligatorios.');
  }
  const existente = await buscarUsuarioPorEmail(correo);
  if (existente) {
    throw new Error('Ya existe un usuario con ese correo.');
  }
  const passwordHash = await bcrypt.hash(String(password), 10);
  const resultado = await ejecutarQuery('INSERT INTO users (nombre, email, password_hash) VALUES (?, ?, ?)', [nombreLimpio, correo, passwordHash]);
  return {
    id: Number(resultado.lastInsertRowid ?? 0),
    nombre: nombreLimpio,
    email: correo,
  };
}

export async function guardarSesionUsuario({ email, jti, expiresAt }) {
  await ejecutarQuery(
    'UPDATE users SET session_jti = ?, session_expires_at = ? WHERE LOWER(email) = ?',
    [jti, fechaMysql(expiresAt), String(email || '').trim().toLowerCase()],
  );
}

export async function guardarSesionAdmin({ email, jti, expiresAt }) {
  await ejecutarQuery(
    'UPDATE admin SET session_jti = ?, session_expires_at = ? WHERE LOWER(email) = ?',
    [jti, fechaMysql(expiresAt), String(email || '').trim().toLowerCase()],
  );
}

export async function sesionValida({ rol, email, jti }) {
  const tabla = rol === 'admin' ? 'admin' : 'users';
  const rows = (await ejecutarQuery(
    `SELECT session_jti, session_expires_at FROM ${tabla} WHERE LOWER(email) = ? LIMIT 1`,
    [String(email || '').trim().toLowerCase()],
  )).rows || [];

  if (!rows[0]) return false;
  if (!rows[0].session_jti || rows[0].session_jti !== jti) return false;
  if (!rows[0].session_expires_at) return false;

  return new Date(rows[0].session_expires_at).getTime() > Date.now();
}

export async function cargarStore() {
  if (cache) return cache;

  await inicializarMysql();

  const categoriasRows = (await ejecutarQuery('SELECT * FROM categories ORDER BY id')).rows || [];
  const productosRows = (await ejecutarQuery('SELECT * FROM products ORDER BY nombre')).rows || [];
  const mensajesRows = (await ejecutarQuery('SELECT * FROM messages ORDER BY creado_en DESC')).rows || [];
  const pedidosRows = (await ejecutarQuery('SELECT * FROM orders ORDER BY creado_en DESC')).rows || [];
  const itemsRows = (await ejecutarQuery('SELECT * FROM order_items ORDER BY order_id, id')).rows || [];
  const adminRows = (await ejecutarQuery('SELECT email, password_hash FROM admin ORDER BY id DESC LIMIT 1')).rows || [];

  const categorias = Object.fromEntries(
    categoriasRows.map((r) => [r.slug, { nombre: r.nombre, descripcion: r.descripcion }]),
  );

  const productos = productosRows.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    categoria: r.categoria,
    precio: Number(r.precio),
    color: r.color || '#E09F3E',
    stock: Number(r.stock),
    imagen: r.imagen || null,
  }));

  const mensajes = mensajesRows.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    correo: r.correo,
    mensaje: r.mensaje,
    leido: Boolean(r.leido),
    creadoEn: fechaSegura(r.creado_en, Date.now()),
  }));

  const itemsPorPedido = {};
  for (const item of itemsRows) {
    if (!itemsPorPedido[item.order_id]) itemsPorPedido[item.order_id] = [];
    itemsPorPedido[item.order_id].push({
      id: item.producto_id,
      nombre: item.nombre,
      precio: Number(item.precio),
      cantidad: Number(item.cantidad),
    });
  }

  const pedidos = pedidosRows.map((p) => ({
    id: p.id,
    cliente: {
      nombre: p.nombre_cliente,
      correo: p.correo_cliente,
    },
    items: itemsPorPedido[p.id] || [],
    total: Number(p.total),
    estado: p.estado,
    creadoEn: fechaSegura(p.creado_en, Date.now()),
  }));

  const admin = adminRows[0] || {
    email: process.env.ADMIN_EMAIL || 'admin@thefandomhouse.com',
    password_hash: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'fandom2026', 10),
  };

  cache = {
    categorias,
    productos,
    mensajes,
    pedidos,
    admin: {
      email: admin.email,
      passwordHash: admin.password_hash,
    },
  };

  return cache;
}

export async function guardarStore() {
  return;
}

export async function leer() {
  return cargarStore();
}

export async function actualizar(mutador) {
  const store = await cargarStore();
  const resultado = await mutador(store);

  const conexion = obtenerDb();
  await conexion.execute('DELETE FROM order_items');
  await conexion.execute('DELETE FROM orders');
  await conexion.execute('DELETE FROM messages');
  await conexion.execute('DELETE FROM products');
  await conexion.execute('DELETE FROM categories');
  await conexion.execute('DELETE FROM admin');

  for (const [slug, info] of Object.entries(store.categorias || {})) {
    await ejecutarQuery('INSERT INTO categories (slug, nombre, descripcion) VALUES (?, ?, ?)', [slug, info.nombre, info.descripcion]);
  }

  for (const producto of store.productos || []) {
    await ejecutarQuery(
      'INSERT INTO products (id, nombre, categoria, precio, color, stock, imagen) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [producto.id, producto.nombre, producto.categoria, Number(producto.precio), producto.color || '#E09F3E', Number(producto.stock || 0), producto.imagen || null],
    );
  }

  for (const mensaje of store.mensajes || []) {
    await ejecutarQuery(
      'INSERT INTO messages (id, nombre, correo, mensaje, leido, creado_en) VALUES (?, ?, ?, ?, ?, ?)',
      [mensaje.id, mensaje.nombre, mensaje.correo, mensaje.mensaje, Boolean(mensaje.leido) ? 1 : 0, fechaMysql(mensaje.creadoEn || Date.now())],
    );
  }

  for (const pedido of store.pedidos || []) {
    await ejecutarQuery(
      'INSERT INTO orders (id, nombre_cliente, correo_cliente, total, estado, creado_en) VALUES (?, ?, ?, ?, ?, ?)',
      [pedido.id, pedido.cliente?.nombre || 'Cliente web', pedido.cliente?.correo || '', Number(pedido.total), pedido.estado || 'recibido', fechaMysql(pedido.creadoEn || Date.now())],
    );

    for (const item of pedido.items || []) {
      await ejecutarQuery(
        'INSERT INTO order_items (order_id, producto_id, nombre, precio, cantidad) VALUES (?, ?, ?, ?, ?)',
        [pedido.id, item.id, item.nombre, Number(item.precio), Number(item.cantidad)],
      );
    }
  }

  await ejecutarQuery('INSERT INTO admin (email, password_hash) VALUES (?, ?)', [store.admin.email, store.admin.passwordHash]);
  cache = store;
  return resultado;
}
