/* Catálogo de productos y renderizado de tarjetas. */

const CATEGORIAS = {
  pines: { nombre: 'Pines', archivo: 'pines.html', descripcion: 'Pines esmaltados de colección para tu chaqueta, mochila o tablero.' },
  fundas: { nombre: 'Fundas para celular', archivo: 'fundas.html', descripcion: 'Fundas resistentes con arte original inspirado en tus fandoms.' },
  stickers: { nombre: 'Stickers', archivo: 'stickers.html', descripcion: 'Stickers vinílicos resistentes al agua, en packs temáticos.' },
  llaveros: { nombre: 'Llaveros', archivo: 'productos.html', descripcion: 'Llaveros acrílicos con doble cara y acabado brillante.' },
  posters: { nombre: 'Posters', archivo: 'productos.html', descripcion: 'Impresiones mate en formato A3 listas para enmarcar.' },
};

const PRODUCTOS = [
  { id: 'pin-01', nombre: 'Pin Rayo Dorado', categoria: 'pines', precio: 18000, color: '#E09F3E' },
  { id: 'pin-02', nombre: 'Pin Nave Estelar', categoria: 'pines', precio: 20000, color: '#335C67' },
  { id: 'pin-03', nombre: 'Pin Katana Neón', categoria: 'pines', precio: 22000, color: '#9E2A2B' },
  { id: 'pin-04', nombre: 'Pin Control Retro', categoria: 'pines', precio: 19000, color: '#6C6A9E' },
  { id: 'pin-05', nombre: 'Pin Casita Bolt', categoria: 'pines', precio: 24000, color: '#E09F3E' },
  { id: 'pin-06', nombre: 'Pin Vinilo Indie', categoria: 'pines', precio: 17000, color: '#2F6F5E' },

  { id: 'fun-01', nombre: 'Funda Galaxia Lejana', categoria: 'fundas', precio: 62000, color: '#335C67' },
  { id: 'fun-02', nombre: 'Funda Ciudad Neón', categoria: 'fundas', precio: 65000, color: '#9E2A2B' },
  { id: 'fun-03', nombre: 'Funda Kawaii Bolt', categoria: 'fundas', precio: 59000, color: '#E09F3E' },
  { id: 'fun-04', nombre: 'Funda Pixel Quest', categoria: 'fundas', precio: 61000, color: '#2F6F5E' },
  { id: 'fun-05', nombre: 'Funda Tour Mundial', categoria: 'fundas', precio: 67000, color: '#6C6A9E' },
  { id: 'fun-06', nombre: 'Funda Manga Clásico', categoria: 'fundas', precio: 58000, color: '#B4553C' },

  { id: 'stk-01', nombre: 'Pack Stickers Anime', categoria: 'stickers', precio: 15000, color: '#9E2A2B' },
  { id: 'stk-02', nombre: 'Pack Stickers Gamer', categoria: 'stickers', precio: 15000, color: '#335C67' },
  { id: 'stk-03', nombre: 'Pack Stickers Series', categoria: 'stickers', precio: 16000, color: '#E09F3E' },
  { id: 'stk-04', nombre: 'Pack Stickers Música', categoria: 'stickers', precio: 14000, color: '#6C6A9E' },
  { id: 'stk-05', nombre: 'Sticker Holográfico Bolt', categoria: 'stickers', precio: 9000, color: '#2F6F5E' },
  { id: 'stk-06', nombre: 'Pack Stickers Terror', categoria: 'stickers', precio: 16000, color: '#B4553C' },

  { id: 'lla-01', nombre: 'Llavero Bolt Acrílico', categoria: 'llaveros', precio: 21000, color: '#E09F3E' },
  { id: 'lla-02', nombre: 'Llavero Espada Legendaria', categoria: 'llaveros', precio: 23000, color: '#335C67' },
  { id: 'pos-01', nombre: 'Poster Fandom Map A3', categoria: 'posters', precio: 38000, color: '#9E2A2B' },
  { id: 'pos-02', nombre: 'Poster Minimal Anime A3', categoria: 'posters', precio: 36000, color: '#2F6F5E' },
];

const precioCOP = (v) => v.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

function imagenProducto(p) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.color}" stop-opacity="0.95"/>
      <stop offset="1" stop-color="${p.color}" stop-opacity="0.45"/>
    </linearGradient></defs>
    <rect width="240" height="240" rx="26" fill="url(#g)"/>
    <g fill="#ffffff" fill-opacity="0.92" transform="translate(70 62) scale(3.2)">
      <path d="M16 2 30 13v15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V13L16 2Z" fill-opacity="0.18"/>
      <path d="M18.4 8.5 10 20.5h4.6L13.4 28 22 16.5h-4.7l1.1-8Z"/>
    </g>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function tarjetaProducto(p) {
  return `<article class="producto">
    <img class="producto__img" src="${imagenProducto(p)}" alt="${p.nombre}" loading="lazy">
    <div class="producto__info">
      <span class="producto__cat">${CATEGORIAS[p.categoria].nombre}</span>
      <h3 class="producto__nombre">${p.nombre}</h3>
      <p class="producto__precio">${precioCOP(p.precio)}</p>
    </div>
    <button class="btn btn--primario" data-agregar="${p.id}">Agregar al carrito</button>
  </article>`;
}

function pintarCatalogo(selector, categoria) {
  const cont = document.querySelector(selector);
  if (!cont) return;
  const lista = categoria ? PRODUCTOS.filter((p) => p.categoria === categoria) : PRODUCTOS;
  cont.innerHTML = lista.map(tarjetaProducto).join('');
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-agregar]');
  if (!btn) return;
  const producto = PRODUCTOS.find((p) => p.id === btn.dataset.agregar);
  if (producto) window.Carrito.agregar(producto, btn);
});
