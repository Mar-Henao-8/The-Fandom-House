import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { Cargando, ErrorCaja } from '../components/Estado.jsx';
import { ProductCard } from '../components/ProductCard.jsx';

export function Productos() {
  const { categoria } = useParams();
  const [estado, setEstado] = useState({ carga: true, error: '', catalogo: null });

  function cargar() {
    setEstado({ carga: true, error: '', catalogo: null });
    api.catalogo()
      .then((catalogo) => setEstado({ carga: false, error: '', catalogo }))
      .catch((err) => setEstado({ carga: false, error: err.message, catalogo: null }));
  }

  useEffect(cargar, []);

  const catInfo = categoria && estado.catalogo?.categorias?.[categoria];
  const lista = estado.catalogo
    ? estado.catalogo.productos.filter((p) => !categoria || p.categoria === categoria)
    : [];

  return (
    <>
      <section className="seccion">
        <div className="seccion__intro">
          <h1>{catInfo ? catInfo.nombre : 'Catálogo completo'}</h1>
          <p>
            {catInfo
              ? catInfo.descripcion
              : 'Explora todas las categorías de The Fandom House y filtra por lo que más te gusta.'}
          </p>
        </div>

        {!categoria && estado.catalogo && (
          <div className="rejilla" style={{ marginBottom: '2.5rem' }}>
            {Object.entries(estado.catalogo.categorias).map(([clave, c]) => (
              <article className="tarjeta" key={clave}>
                <h3>{c.nombre}</h3>
                <p>{c.descripcion}</p>
                <Link className="tarjeta__enlace" to={`/productos/${clave}`}>
                  Ver {c.nombre.toLowerCase()} →
                </Link>
              </article>
            ))}
          </div>
        )}

        {estado.carga && <Cargando texto="Cargando productos…" />}
        {estado.error && <ErrorCaja mensaje={estado.error} reintentar={cargar} />}
        {estado.catalogo && lista.length === 0 && (
          <p className="tenue">No hay productos en esta categoría todavía.</p>
        )}
        {estado.catalogo && (
          <div className="rejilla">
            {lista.map((p) => (
              <ProductCard key={p.id} producto={p} categorias={estado.catalogo.categorias} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
