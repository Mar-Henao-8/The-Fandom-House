/**
 * Persistencia de la app en MySQL.
 * La capa local en JSON queda eliminada para evitar inconsistencias
 * entre dos fuentes de verdad.
 */
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import { CATEGORIAS, PRODUCTOS_INICIALES } from './seed.js';

function fechaMysql(date = new Date()) {
  return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
}

let cache = null;
let pool = null;

function fechaSegura(valor, fallback = new Date()) {
  if (!valor) return new Date(fallback).toISOString();
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return new Date(fallback).toISOString();
  return fecha.toISOString();
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

async function obtenerPool() {
  if (pool) return pool;

  const nombreBase = process.env.DB_NAME || 'the_fandom_house';
  const baseConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    timezone: 'Z',
  };

  const conexionRaiz = mysql.createPool(baseConfig);
  await conexionRaiz.query(`CREATE DATABASE IF NOT EXISTS \`${nombreBase}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conexionRaiz.end();

  pool = mysql.createPool({
    ...baseConfig,
    database: nombreBase,
  });

  return pool;
}

export async function inicializarMysql() {
  const conexion = await obtenerPool();
  await conexion.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS imagen TEXT NULL');
  await conexion.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(50) NOT NULL UNIQUE,
      nombre VARCHAR(120) NOT NULL,
      descripcion TEXT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(80) PRIMARY KEY,
      nombre VARCHAR(160) NOT NULL,
      categoria VARCHAR(50) NOT NULL,
      precio INT NOT NULL,
      color VARCHAR(20) DEFAULT '#E09F3E',
      stock INT NOT NULL DEFAULT 0,
      imagen TEXT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(120) NOT NULL,
      email VARCHAR(180) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      session_jti VARCHAR(255) NULL,
      session_expires_at DATETIME NULL,
      creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS messages (
      id VARCHAR(80) PRIMARY KEY,
      nombre VARCHAR(160) NOT NULL,
      correo VARCHAR(180) NOT NULL,
      mensaje TEXT NOT NULL,
      leido BOOLEAN NOT NULL DEFAULT false,
      creado_en DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(80) PRIMARY KEY,
      nombre_cliente VARCHAR(160) NOT NULL,
      correo_cliente VARCHAR(180) NOT NULL,
      total INT NOT NULL,
      estado VARCHAR(60) NOT NULL DEFAULT 'recibido',
      creado_en DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id VARCHAR(80) NOT NULL,
      producto_id VARCHAR(80) NOT NULL,
      nombre VARCHAR(160) NOT NULL,
      precio INT NOT NULL,
      cantidad INT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS admin (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(180) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      session_jti VARCHAR(255) NULL,
      session_expires_at DATETIME NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await conexion.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS session_jti VARCHAR(255) NULL');
  await conexion.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS session_expires_at DATETIME NULL');
  await conexion.query('ALTER TABLE admin ADD COLUMN IF NOT EXISTS session_jti VARCHAR(255) NULL');
  await conexion.query('ALTER TABLE admin ADD COLUMN IF NOT EXISTS session_expires_at DATETIME NULL');

  const [adminRows] = await conexion.query('SELECT COUNT(*) AS total FROM admin');
  if (Number(adminRows[0].total) === 0) {
    const admin = await estadoInicial();
    await conexion.query('INSERT INTO admin (email, password_hash) VALUES (?, ?)', [admin.admin.email, admin.admin.passwordHash]);
  }

  const [categoriasRows] = await conexion.query('SELECT COUNT(*) AS total FROM categories');
  if (Number(categoriasRows[0].total) === 0) {
    const admin = await estadoInicial();
    for (const [slug, info] of Object.entries(admin.categorias)) {
      await conexion.query('INSERT INTO categories (slug, nombre, descripcion) VALUES (?, ?, ?)', [slug, info.nombre, info.descripcion]);
    }
  }

  const [productosRows] = await conexion.query('SELECT COUNT(*) AS total FROM products');
  if (Number(productosRows[0].total) === 0) {
    const admin = await estadoInicial();
    for (const producto of admin.productos) {
      await conexion.query(
        'INSERT INTO products (id, nombre, categoria, precio, color, stock, imagen) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [producto.id, producto.nombre, producto.categoria, producto.precio, producto.color, producto.stock, producto.imagen || null],
      );
    }
  }

  const [usuarioTestRows] = await conexion.query('SELECT COUNT(*) AS total FROM users WHERE email = ?', ['test@gmail.com']);
  if (Number(usuarioTestRows[0].total) === 0) {
    const passwordHash = await bcrypt.hash('password1234', 10);
    await conexion.query('INSERT INTO users (nombre, email, password_hash) VALUES (?, ?, ?)', ['Usuario Test', 'test@gmail.com', passwordHash]);
  }
}

export async function listarUsuarios() {
  const conexion = await obtenerPool();
  const [rows] = await conexion.query('SELECT id, nombre, email, creado_en FROM users ORDER BY creado_en DESC');
  return rows.map((usuario) => ({
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    creadoEn: usuario.creado_en,
    rol: 'usuario',
  }));
}

export async function buscarUsuarioPorEmail(email) {
  const conexion = await obtenerPool();
  const correo = String(email || '').trim().toLowerCase();
  if (!correo) return null;
  const [rows] = await conexion.query('SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1', [correo]);
  if (!rows[0]) return null;
  return {
    id: rows[0].id,
    nombre: rows[0].nombre,
    email: rows[0].email,
    passwordHash: rows[0].password_hash,
  };
}

export async function crearUsuario({ nombre, email, password }) {
  const conexion = await obtenerPool();
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
  const [resultado] = await conexion.query('INSERT INTO users (nombre, email, password_hash) VALUES (?, ?, ?)', [nombreLimpio, correo, passwordHash]);
  return {
    id: resultado.insertId,
    nombre: nombreLimpio,
    email: correo,
  };
}

export async function guardarSesionUsuario({ email, jti, expiresAt }) {
  const conexion = await obtenerPool();
  await conexion.query(
    'UPDATE users SET session_jti = ?, session_expires_at = ? WHERE LOWER(email) = ?',
    [jti, fechaMysql(expiresAt), String(email || '').trim().toLowerCase()],
  );
}

export async function guardarSesionAdmin({ email, jti, expiresAt }) {
  const conexion = await obtenerPool();
  await conexion.query(
    'UPDATE admin SET session_jti = ?, session_expires_at = ? WHERE LOWER(email) = ?',
    [jti, fechaMysql(expiresAt), String(email || '').trim().toLowerCase()],
  );
}

export async function sesionValida({ rol, email, jti }) {
  const conexion = await obtenerPool();
  const tabla = rol === 'admin' ? 'admin' : 'users';
  const [rows] = await conexion.query(
    `SELECT session_jti, session_expires_at FROM ${tabla} WHERE LOWER(email) = ? LIMIT 1`,
    [String(email || '').trim().toLowerCase()],
  );

  if (!rows[0]) return false;
  if (!rows[0].session_jti || rows[0].session_jti !== jti) return false;
  if (!rows[0].session_expires_at) return false;

  return new Date(rows[0].session_expires_at).getTime() > Date.now();
}

export async function cargarStore() {
  if (cache) return cache;

  await inicializarMysql();
  const conexion = await obtenerPool();

  const [categoriasRows] = await conexion.query('SELECT * FROM categories ORDER BY id');
  const [productosRows] = await conexion.query('SELECT * FROM products ORDER BY nombre');
  const [mensajesRows] = await conexion.query('SELECT * FROM messages ORDER BY creado_en DESC');
  const [pedidosRows] = await conexion.query('SELECT * FROM orders ORDER BY creado_en DESC');
  const [itemsRows] = await conexion.query('SELECT * FROM order_items ORDER BY order_id, id');
  const [adminRows] = await conexion.query('SELECT email, password_hash FROM admin ORDER BY id DESC LIMIT 1');

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

  const conexion = await obtenerPool();
  await conexion.query('DELETE FROM order_items');
  await conexion.query('DELETE FROM orders');
  await conexion.query('DELETE FROM messages');
  await conexion.query('DELETE FROM products');
  await conexion.query('DELETE FROM categories');
  await conexion.query('DELETE FROM admin');

  for (const [slug, info] of Object.entries(store.categorias || {})) {
    await conexion.query('INSERT INTO categories (slug, nombre, descripcion) VALUES (?, ?, ?)', [slug, info.nombre, info.descripcion]);
  }

  for (const producto of store.productos || []) {
    await conexion.query(
      'INSERT INTO products (id, nombre, categoria, precio, color, stock, imagen) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [producto.id, producto.nombre, producto.categoria, Number(producto.precio), producto.color || '#E09F3E', Number(producto.stock || 0), producto.imagen || null],
    );
  }

  for (const mensaje of store.mensajes || []) {
    await conexion.query(
      'INSERT INTO messages (id, nombre, correo, mensaje, leido, creado_en) VALUES (?, ?, ?, ?, ?, ?)',
      [mensaje.id, mensaje.nombre, mensaje.correo, mensaje.mensaje, Boolean(mensaje.leido), new Date(mensaje.creadoEn || Date.now()).toISOString().slice(0, 19).replace('T', ' ')],
    );
  }

  for (const pedido of store.pedidos || []) {
    await conexion.query(
      'INSERT INTO orders (id, nombre_cliente, correo_cliente, total, estado, creado_en) VALUES (?, ?, ?, ?, ?, ?)',
      [pedido.id, pedido.cliente?.nombre || 'Cliente web', pedido.cliente?.correo || '', Number(pedido.total), pedido.estado || 'recibido', new Date(pedido.creadoEn || Date.now()).toISOString().slice(0, 19).replace('T', ' ')],
    );

    for (const item of pedido.items || []) {
      await conexion.query(
        'INSERT INTO order_items (order_id, producto_id, nombre, precio, cantidad) VALUES (?, ?, ?, ?, ?)',
        [pedido.id, item.id, item.nombre, Number(item.precio), Number(item.cantidad)],
      );
    }
  }

  await conexion.query('INSERT INTO admin (email, password_hash) VALUES (?, ?)', [store.admin.email, store.admin.passwordHash]);
  cache = store;
  return resultado;
}
