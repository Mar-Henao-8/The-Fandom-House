/**
 * Datos iniciales del emprendimiento.
 * Se cargan solo la primera vez que arranca el servidor (cuando aún no existe store.json).
 */
export const CATEGORIAS = {
  pines: {
    nombre: 'Pines',
    descripcion: 'Pines esmaltados de colección para tu chaqueta, mochila o tablero.',
  },
  fundas: {
    nombre: 'Fundas para celular',
    descripcion: 'Fundas resistentes con arte original inspirado en tus fandoms.',
  },
  stickers: {
    nombre: 'Stickers',
    descripcion: 'Stickers vinílicos resistentes al agua, en packs temáticos.',
  },
  llaveros: {
    nombre: 'Llaveros',
    descripcion: 'Llaveros acrílicos con doble cara y acabado brillante.',
  },
  posters: {
    nombre: 'Posters',
    descripcion: 'Impresiones mate en formato A3 listas para enmarcar.',
  },
};

export const PRODUCTOS_INICIALES = [
  { id: 'pin-01', nombre: 'Pin Rayo Dorado', categoria: 'pines', precio: 18000, color: '#E09F3E', stock: 24 },
  { id: 'pin-02', nombre: 'Pin Nave Estelar', categoria: 'pines', precio: 20000, color: '#335C67', stock: 18 },
  { id: 'pin-03', nombre: 'Pin Katana Neón', categoria: 'pines', precio: 22000, color: '#9E2A2B', stock: 12 },
  { id: 'pin-04', nombre: 'Pin Control Retro', categoria: 'pines', precio: 19000, color: '#6C6A9E', stock: 20 },
  { id: 'pin-05', nombre: 'Pin Casita Bolt', categoria: 'pines', precio: 24000, color: '#E09F3E', stock: 15 },
  { id: 'pin-06', nombre: 'Pin Vinilo Indie', categoria: 'pines', precio: 17000, color: '#2F6F5E', stock: 22 },
  { id: 'fun-01', nombre: 'Funda Galaxia Lejana', categoria: 'fundas', precio: 62000, color: '#335C67', stock: 8 },
  { id: 'fun-02', nombre: 'Funda Ciudad Neón', categoria: 'fundas', precio: 65000, color: '#9E2A2B', stock: 7 },
  { id: 'fun-03', nombre: 'Funda Kawaii Bolt', categoria: 'fundas', precio: 59000, color: '#E09F3E', stock: 10 },
  { id: 'fun-04', nombre: 'Funda Pixel Quest', categoria: 'fundas', precio: 61000, color: '#2F6F5E', stock: 9 },
  { id: 'fun-05', nombre: 'Funda Tour Mundial', categoria: 'fundas', precio: 67000, color: '#6C6A9E', stock: 6 },
  { id: 'fun-06', nombre: 'Funda Manga Clásico', categoria: 'fundas', precio: 58000, color: '#B4553C', stock: 11 },
  { id: 'stk-01', nombre: 'Pack Stickers Anime', categoria: 'stickers', precio: 15000, color: '#9E2A2B', stock: 30 },
  { id: 'stk-02', nombre: 'Pack Stickers Gamer', categoria: 'stickers', precio: 15000, color: '#335C67', stock: 28 },
  { id: 'stk-03', nombre: 'Pack Stickers Series', categoria: 'stickers', precio: 16000, color: '#E09F3E', stock: 26 },
  { id: 'stk-04', nombre: 'Pack Stickers Música', categoria: 'stickers', precio: 14000, color: '#6C6A9E', stock: 32 },
  { id: 'stk-05', nombre: 'Sticker Holográfico Bolt', categoria: 'stickers', precio: 9000, color: '#2F6F5E', stock: 40 },
  { id: 'stk-06', nombre: 'Pack Stickers Terror', categoria: 'stickers', precio: 16000, color: '#B4553C', stock: 16 },
  { id: 'lla-01', nombre: 'Llavero Bolt Acrílico', categoria: 'llaveros', precio: 21000, color: '#E09F3E', stock: 14 },
  { id: 'lla-02', nombre: 'Llavero Espada Legendaria', categoria: 'llaveros', precio: 23000, color: '#335C67', stock: 13 },
  { id: 'pos-01', nombre: 'Poster Fandom Map A3', categoria: 'posters', precio: 38000, color: '#9E2A2B', stock: 5 },
  { id: 'pos-02', nombre: 'Poster Minimal Anime A3', categoria: 'posters', precio: 36000, color: '#2F6F5E', stock: 5 },
];

export const DESTACADOS = ['pin-05', 'fun-03', 'stk-01', 'lla-01'];
