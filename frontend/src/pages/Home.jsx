import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { Cargando, ErrorCaja } from '../components/Estado.jsx';
import { Mascota } from '../components/Logo.jsx';
import { ProductCard } from '../components/ProductCard.jsx';

const ICONOS = {
  pines: 'M12 21s-1-4-1-6H8l3-4-1-1a4 4 0 0 1 6-5l1 1a4 4 0 0 1-5 6l-1 1 3 4h-3c0 2-1 6-1 6Z',
  fundas: 'M6 2h12a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3Zm4.5 3.5h3M9 18h6',
  stickers: 'M14.5 3H7a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h5l8-8V6a3 3 0 0 0-3-3ZM12 21v-5a3 3 0 0 1 3-3h5',
  mas: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18ZM8 12h8M12 8v8',
};

const ACCESOS = [
  { clave: 'pines', nombre: 'Pines', detalle: 'Coleccionables esmaltados' },
  { clave: 'fundas', nombre: 'Fundas para celular', detalle: 'Arte original protegido' },
  { clave: 'stickers', nombre: 'Stickers', detalle: 'Packs temáticos resistentes' },
];

export function Home() {
  const [estado, setEstado] = useState({ carga: true, error: '', catalogo: null });

  function cargar() {
    setEstado({ carga: true, error: '', catalogo: null });
    api.catalogo()
      .then((catalogo) => setEstado({ carga: false, error: '', catalogo }))
      .catch((err) => setEstado({ carga: false, error: err.message, catalogo: null }));
  }

  useEffect(cargar, []);

  const destacados = estado.catalogo
    ? estado.catalogo.productos.filter((p) => estado.catalogo.destacados.includes(p.id))
    : [];

  return (
    <>
      <section className="seccion portada">
        <div className="portada__presentacion">
          <Mascota />
          <div>
            <h1 className="lema">Tu fandom <em>vive aquí.</em></h1>
            <p className="portada__texto">
              Descubre accesorios inspirados en tus historias favoritas y expresa quién eres con cada detalle.
            </p>
            <div className="portada__acciones">
              <Link className="btn btn--primario" to="/productos">Ver catálogo</Link>
              <Link className="btn btn--fantasma" to="/usuario">Personalizar tema</Link>
            </div>
          </div>
        </div>
        <div className="accesos">
          {ACCESOS.map((acceso) => (
            <Link className="acceso" key={acceso.clave} to={`/productos/${acceso.clave}`}>
              <svg className="acceso__icono" viewBox="0 0 24 24" aria-hidden="true">
                <path d={ICONOS[acceso.clave]} />
              </svg>
              <span>
                <span className="acceso__nombre">{acceso.nombre}</span><br />
                <span className="tenue">{acceso.detalle}</span>
              </span>
              <span className="acceso__flecha" aria-hidden="true">→</span>
            </Link>
          ))}
          <Link className="acceso" to="/productos">
            <svg className="acceso__icono" viewBox="0 0 24 24" aria-hidden="true">
              <path d={ICONOS.mas} />
            </svg>
            <span>
              <span className="acceso__nombre">Muchas más...</span><br />
              <span className="tenue">Todo el catálogo</span>
            </span>
            <span className="acceso__flecha" aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="seccion">
        <div className="seccion__intro">
          <h2>Destacados de la semana</h2>
          <p>Una selección rotativa de piezas favoritas de la comunidad.</p>
        </div>
        {estado.carga && <Cargando texto="Cargando destacados…" />}
        {estado.error && <ErrorCaja mensaje={estado.error} reintentar={cargar} />}
        {estado.catalogo && (
          <div className="rejilla">
            {destacados.map((p) => (
              <ProductCard key={p.id} producto={p} categorias={estado.catalogo.categorias} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
