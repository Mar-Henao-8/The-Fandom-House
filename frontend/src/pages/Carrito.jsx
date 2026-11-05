import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { Logo } from '../components/Logo.jsx';
import { ErrorCaja, ExitoCaja } from '../components/Estado.jsx';
import { useCarrito } from '../context/CartContext.jsx';
import { precioCOP } from '../utils.js';

export function Carrito() {
  const carrito = useCarrito();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  async function pagar() {
    setError('');
    setExito('');
    setEnviando(true);
    try {
      const { pedido } = await api.pedido({
        items: carrito.items.map(({ id, cantidad }) => ({ id, cantidad })),
        cliente: { nombre: 'Cliente web' },
      });
      carrito.vaciar();
      setExito(`Pedido ${pedido.id} recibido. Total ${precioCOP(pedido.total)}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (!carrito.items.length) {
    return (
      <section className="seccion">
        <div className="seccion__intro">
          <h1>Tu carrito</h1>
          <p>Los productos se guardan en tu navegador, así que siguen aquí cuando vuelvas.</p>
        </div>
        {exito && <ExitoCaja mensaje={exito} />}
        <div className="vacio">
          <Logo />
          <h2>Tu carrito está vacío</h2>
          <p>Explora el catálogo y suma tus primeros accesorios.</p>
          <Link className="btn btn--primario" to="/productos">Ver productos</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="seccion">
      <div className="seccion__intro">
        <h1>Tu carrito</h1>
        <p>Los productos se guardan en tu navegador, así que siguen aquí cuando vuelvas.</p>
      </div>
      {error && <ErrorCaja mensaje={error} />}
      {exito && <ExitoCaja mensaje={exito} />}
      <div className="carrito">
        <div>
          {carrito.items.map((item) => (
            <article className="linea" key={item.id}>
              <img className="linea__img" src={item.imagen} alt={item.nombre} />
              <div>
                <h3 className="linea__nombre">{item.nombre}</h3>
                <p className="linea__precio">{precioCOP(item.precio)}</p>
              </div>
              <div className="cantidad">
                <button className="cantidad__btn" type="button" aria-label="Quitar una unidad" onClick={() => carrito.cambiarCantidad(item.id, -1)}>-</button>
                <span>{item.cantidad}</span>
                <button className="cantidad__btn" type="button" aria-label="Agregar una unidad" onClick={() => carrito.cambiarCantidad(item.id, 1)}>+</button>
              </div>
              <button className="linea__eliminar" type="button" aria-label={`Eliminar ${item.nombre}`} onClick={() => carrito.eliminar(item.id)}>&times;</button>
            </article>
          ))}
        </div>
        <aside className="resumen">
          <div className="resumen__fila"><span className="tenue">Productos</span><span>{carrito.unidades}</span></div>
          <div className="resumen__fila"><span className="tenue">Total</span><span className="resumen__total">{precioCOP(carrito.total)}</span></div>
          <button className="btn btn--primario" type="button" onClick={pagar} disabled={enviando}>
            {enviando ? 'Enviando pedido…' : 'Finalizar compra'}
          </button>
          <button className="btn btn--fantasma" type="button" onClick={carrito.vaciar}>Vaciar carrito</button>
        </aside>
      </div>
    </section>
  );
}
