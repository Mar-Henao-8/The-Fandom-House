export const precioCOP = (valor) =>
  Number(valor).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

/** Imagen placeholder generada en SVG para no depender de fotos de stock. */
export function imagenProducto(producto) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${producto.color || '#E09F3E'}" stop-opacity="0.95"/>
      <stop offset="1" stop-color="${producto.color || '#E09F3E'}" stop-opacity="0.45"/>
    </linearGradient></defs>
    <rect width="240" height="240" rx="26" fill="url(#g)"/>
    <g fill="#ffffff" fill-opacity="0.92" transform="translate(70 62) scale(3.2)">
      <path d="M16 2 30 13v15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V13L16 2Z" fill-opacity="0.18"/>
      <path d="M18.4 8.5 10 20.5h4.6L13.4 28 22 16.5h-4.7l1.1-8Z"/>
    </g>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const LOGOS = {
  hunyadi: './assets/logo-hunyadi.png',
  auburn: './assets/logo-auburn.png',
  slate: './assets/logo-slate.png',
  vanilla: './assets/logo-hunyadi.png',
};

export const TEMAS = {
  hunyadi: { nombre: 'Hunyadi Yellow', muestra: '#E09F3E' },
  auburn: { nombre: 'Auburn', muestra: '#9E2A2B' },
  slate: { nombre: 'Dark Slate Gray', muestra: '#335C67' },
  vanilla: { nombre: 'Vanilla', muestra: '#FFF3D1' },
};
