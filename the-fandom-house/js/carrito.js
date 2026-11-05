/* Carrito de compras persistido en LocalStorage. */

const CLAVE_CARRITO = 'tfh:carrito';

function leer() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE_CARRITO));
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

function guardar(items) {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(items));
  document.dispatchEvent(new CustomEvent('carrito:cambio', { detail: { items } }));
}

const Carrito = {
  items: leer,
  unidades: () => leer().reduce((t, i) => t + i.cantidad, 0),
  total: () => leer().reduce((t, i) => t + i.precio * i.cantidad, 0),

  agregar(producto, boton) {
    const items = leer();
    const existente = items.find((i) => i.id === producto.id);
    if (existente) existente.cantidad += 1;
    else items.push({ id: producto.id, nombre: producto.nombre, precio: producto.precio, imagen: imagenProducto(producto), cantidad: 1 });
    guardar(items);
    if (boton) {
      boton.classList.add('btn--ok');
      const texto = boton.textContent;
      boton.textContent = 'Agregado';
      setTimeout(() => { boton.classList.remove('btn--ok'); boton.textContent = texto; }, 1200);
    }
  },

  cambiarCantidad(id, delta) {
    const items = leer();
    const item = items.find((i) => i.id === id);
    if (!item) return;
    item.cantidad += delta;
    guardar(items.filter((i) => i.cantidad > 0));
  },

  eliminar(id) { guardar(leer().filter((i) => i.id !== id)); },
  vaciar() { guardar([]); },
};

window.Carrito = Carrito;

function pintarContador() {
  const unidades = Carrito.unidades();
  document.querySelectorAll('[data-contador-carrito]').forEach((n) => {
    n.textContent = unidades;
    n.hidden = unidades === 0;
  });
}

document.addEventListener('DOMContentLoaded', pintarContador);
document.addEventListener('carrito:cambio', pintarContador);
window.addEventListener('storage', (e) => { if (e.key === CLAVE_CARRITO) pintarContador(); });
