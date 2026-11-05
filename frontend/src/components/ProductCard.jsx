import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../context/CartContext.jsx';
import { imagenProducto, precioCOP } from '../utils.js';

export function ProductCard({ producto, categorias }) {
  const navigate = useNavigate();
  const carrito = useCarrito();
  const [ok, setOk] = useState(false);
  const nombreCat = categorias?.[producto.categoria]?.nombre || producto.categoria;

  function irAAcceso() {
    navigate('/usuario', { state: { abrirModo: 'login' } });
  }

  function agregar(evento) {
    if (evento) evento.stopPropagation();

    if (!carrito?.puedeComprar) {
      irAAcceso();
      return;
    }

    carrito.agregar(producto);
    setOk(true);
    setTimeout(() => setOk(false), 1200);
  }

  function abrirProducto() {
    if (!carrito?.puedeComprar) {
      irAAcceso();
      return;
    }
  }

  return (
    <article className="producto" onClick={abrirProducto} role="button" tabIndex={0} onKeyDown={(evento) => {
      if (evento.key === 'Enter' || evento.key === ' ') {
        evento.preventDefault();
        abrirProducto();
      }
    }}>
      <img className="producto__img" src={producto.imagen || imagenProducto(producto)} alt={producto.nombre} loading="lazy" />
      <div className="producto__info">
        <span className="producto__cat">{nombreCat}</span>
        <h3 className="producto__nombre">{producto.nombre}</h3>
        <p className="producto__precio">{precioCOP(producto.precio)}</p>
      </div>
      <button
        className={`btn btn--primario${ok ? ' btn--ok' : ''}`}
        type="button"
        onClick={agregar}
        disabled={!carrito?.puedeComprar}
        title={!carrito?.puedeComprar ? 'Necesitas estar registrado para comprar' : 'Agregar al carrito'}
      >
        {!carrito?.puedeComprar ? 'Inicia sesión' : ok ? 'Agregado' : 'Agregar al carrito'}
      </button>
    </article>
  );
}
