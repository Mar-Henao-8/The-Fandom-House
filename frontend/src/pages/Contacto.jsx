import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { ErrorCaja, ExitoCaja } from '../components/Estado.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const CANALES = [
  {
    etiqueta: 'Correo',
    valor: 'contacto@thefandomhouse.com',
    href: 'mailto:contacto@thefandomhouse.com',
    icono: 'M3 5h18v14H3zM4 7l8 6 8-6',
  },
  {
    etiqueta: 'Instagram',
    valor: '@thefandomhouse',
    href: 'https://instagram.com/thefandomhouse',
    icono: 'M3 3h18v18H3zM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8ZM17.2 6.8h.01',
  },
  {
    etiqueta: 'WhatsApp',
    valor: '+57 312 345 6789',
    href: 'https://wa.me/573123456789',
    icono: 'M4 20l1.3-3.6A8 8 0 1 1 8 19.2L4 20Z',
  },
];

const VACIO = { nombre: '', correo: '', mensaje: '' };

export function Contacto() {
  const { esAdmin } = useAuth();
  const [form, setForm] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState('');
  const [error, setError] = useState('');
  const [abierto, setAbierto] = useState(false);

  if (esAdmin) {
    return (
      <section className="seccion">
        <div className="seccion__intro">
          <h1>Mensajes de contacto</h1>
          <p>La administración solo revisa los mensajes enviados por clientes y los marca como leídos desde el panel.</p>
        </div>
        <Link className="btn btn--primario" to="/admin">Ir al panel administrativo</Link>
      </section>
    );
  }

  function cambiar(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function validar() {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'Escribe tu nombre.';
    if (!form.correo.trim()) e.correo = 'Escribe tu correo.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) e.correo = 'El correo no es válido.';
    if (!form.mensaje.trim()) e.mensaje = 'Cuéntanos en qué te ayudamos.';
    else if (form.mensaje.trim().length < 10) e.mensaje = 'El mensaje debe tener al menos 10 caracteres.';
    return e;
  }

  async function enviar(evento) {
    evento.preventDefault();
    const e = validar();
    setErrores(e);
    setError('');
    setExito('');
    if (Object.keys(e).length) return;
    setEnviando(true);
    try {
      const datos = await api.contacto(form);
      setExito(datos.mensaje);
      setForm(VACIO);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="seccion">
      <div className="seccion__intro">
        <h2>Contacto</h2>
        <p>Escríbenos por el formulario o por el canal que prefieras: resolvemos dudas sobre pedidos, envíos y colaboraciones.</p>
      </div>

      <div className="contactos" style={{ marginBottom: '2rem' }}>
        {CANALES.map((c) => (
          <a className="contacto" key={c.etiqueta} href={c.href} target="_blank" rel="noopener noreferrer">
            <svg className="contacto__icono" viewBox="0 0 24 24" aria-hidden="true">
              <path d={c.icono} />
            </svg>
            <span>
              <span className="contacto__etiqueta">{c.etiqueta}</span><br />
              <span className="contacto__valor">{c.valor}</span>
            </span>
          </a>
        ))}
      </div>

      {error && <ErrorCaja mensaje={error} />}
      {exito && <ExitoCaja mensaje={exito} />}

      <div className="perfil-contacto">
        <button type="button" className="perfil-contacto__toggle" onClick={() => setAbierto((v) => !v)}>
          {abierto ? 'Ocultar formulario' : 'Enviar mensaje'}
        </button>

        {abierto && (
          <form className="formulario perfil-contacto__form" onSubmit={enviar} noValidate>
            <label>
              Nombre
              <input name="nombre" value={form.nombre} onChange={cambiar} autoComplete="name" />
              {errores.nombre && <span className="campo-error">{errores.nombre}</span>}
            </label>
            <label>
              Correo
              <input name="correo" type="email" value={form.correo} onChange={cambiar} autoComplete="email" />
              {errores.correo && <span className="campo-error">{errores.correo}</span>}
            </label>
            <label>
              Mensaje
              <textarea name="mensaje" rows="5" value={form.mensaje} onChange={cambiar} />
              {errores.mensaje && <span className="campo-error">{errores.mensaje}</span>}
            </label>
            <button className="btn btn--primario" type="submit" disabled={enviando}>
              {enviando ? 'Enviando…' : 'Enviar mensaje'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
