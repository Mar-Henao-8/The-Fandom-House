import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { Cargando, ErrorCaja, ExitoCaja } from '../components/Estado.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { precioCOP } from '../utils.js';

const PRODUCTO_VACIO = { nombre: '', categoria: 'pines', precio: '', color: '#E09F3E', stock: 0, imagen: '' };

export function Admin() {
  const { email, salir } = useAuth();
  const [carga, setCarga] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [seccion, setSeccion] = useState('productos');
  const [vistaMensajes, setVistaMensajes] = useState('nuevos');
  const [resumen, setResumen] = useState(null);
  const [catalogo, setCatalogo] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [form, setForm] = useState(PRODUCTO_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalForm, setModalForm] = useState(PRODUCTO_VACIO);
  const [editandoId, setEditandoId] = useState(null);

  const mensajesNuevos = useMemo(() => mensajes.filter((m) => !m.leido), [mensajes]);
  const mensajesLeidos = useMemo(() => mensajes.filter((m) => m.leido), [mensajes]);
  const mensajesActuales = vistaMensajes === 'nuevos' ? mensajesNuevos : mensajesLeidos;

  async function cargar() {
    setCarga(true);
    setError('');
    try {
      const [r, c, m, p, u] = await Promise.all([
        api.resumen(),
        api.catalogo(),
        api.mensajes(),
        api.pedidos(),
        api.usuarios(),
      ]);
      setResumen(r);
      setCatalogo(c);
      setMensajes(m);
      setPedidos(p);
      setUsuarios(u);
    } catch (err) {
      setError(err.message);
    } finally {
      setCarga(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function convertirImagen(evento) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = () => {
      setForm((actual) => ({ ...actual, imagen: String(lector.result || '') }));
    };
    lector.readAsDataURL(archivo);
  }

  function resetearForm() {
    setForm(PRODUCTO_VACIO);
    setEditandoId(null);
    setAviso('');
  }

  function abrirModalEdicion(producto) {
    setEditandoId(producto.id);
    setModalForm({
      nombre: producto.nombre,
      categoria: producto.categoria,
      precio: producto.precio,
      color: producto.color || '#E09F3E',
      stock: producto.stock,
      imagen: producto.imagen || '',
    });
    setModalAbierto(true);
    setError('');
    setAviso('');
  }

  function convertirImagenModal(evento) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = () => {
      setModalForm((actual) => ({ ...actual, imagen: String(lector.result || '') }));
    };
    lector.readAsDataURL(archivo);
  }

  function cerrarModalEdicion() {
    setModalAbierto(false);
    setEditandoId(null);
    setModalForm(PRODUCTO_VACIO);
  }

  async function guardarProducto(evento) {
    evento.preventDefault();
    setAviso('');
    setGuardando(true);
    try {
      const cuerpo = { ...form, precio: Number(form.precio), stock: Number(form.stock || 0) };
      await api.crearProducto(cuerpo);
      setAviso('Producto agregado al catálogo.');
      resetearForm();
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function guardarEdicion(evento) {
    evento.preventDefault();
    setAviso('');
    setGuardando(true);
    try {
      const cuerpo = { ...modalForm, precio: Number(modalForm.precio), stock: Number(modalForm.stock || 0) };
      await api.editarProducto(editandoId, cuerpo);
      setAviso('Producto actualizado correctamente.');
      cerrarModalEdicion();
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function borrar(id) {
    if (!window.confirm('¿Eliminar este producto del catálogo?')) return;
    try {
      await api.borrarProducto(id);
      setAviso('Producto eliminado.');
      await cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function leido(id) {
    await api.marcarLeido(id);
    await cargar();
  }

  return (
    <section className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <strong>The Fandom House</strong>
          <span>Panel admin</span>
        </div>

        <nav className="admin-sidebar__nav" aria-label="Navegación del panel administrativo">
          <button type="button" className={`admin-sidebar__link ${seccion === 'productos' ? 'is-active' : ''}`} onClick={() => setSeccion('productos')}>Productos</button>
          <button type="button" className={`admin-sidebar__link ${seccion === 'categorias' ? 'is-active' : ''}`} onClick={() => setSeccion('categorias')}>Categorías</button>
          <button type="button" className={`admin-sidebar__link ${seccion === 'usuarios' ? 'is-active' : ''}`} onClick={() => setSeccion('usuarios')}>Usuarios</button>
          <button type="button" className={`admin-sidebar__link ${seccion === 'mensajes' ? 'is-active' : ''}`} onClick={() => setSeccion('mensajes')}>Mensajes</button>
        </nav>

        <button className="btn btn--fantasma admin-sidebar__logout" type="button" onClick={salir}>Cerrar sesión</button>
      </aside>

      <div className="admin-panel">
        <div className="admin__cabecera">
          <div>
            <h1>Panel de administración</h1>
            <p className="tenue">Sesión de {email}</p>
          </div>
        </div>

        {carga && <Cargando texto="Cargando panel…" />}
        {error && <ErrorCaja mensaje={error} reintentar={cargar} />}
        {aviso && <ExitoCaja mensaje={aviso} />}

        {resumen && (
          <div className="rejilla admin__resumen">
            <article className="tarjeta"><h3>{resumen.productos}</h3><p>Productos</p></article>
            <article className="tarjeta"><h3>{resumen.mensajesNuevos}</h3><p>Mensajes nuevos</p></article>
            <article className="tarjeta"><h3>{resumen.pedidos}</h3><p>Pedidos</p></article>
          </div>
        )}

        {catalogo && seccion === 'productos' && (
          <>
            <h2>Agregar producto</h2>
            <form className="formulario formulario--grid" onSubmit={guardarProducto}>
              <label>
                Nombre
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
              </label>
              <label>
                Categoría
                <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                  {Object.entries(catalogo.categorias).map(([clave, c]) => (
                    <option key={clave} value={clave}>{c.nombre}</option>
                  ))}
                </select>
              </label>
              <label>
                Precio (COP)
                <input type="number" min="0" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} required />
              </label>
              <label>
                Stock
                <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </label>
              <label className="campo-producto--imagen">
                Imagen del producto
                <input type="file" accept="image/*" onChange={convertirImagen} />
              </label>
              <label className="campo-producto--url">
                O pega una URL de imagen
                <input value={form.imagen} onChange={(e) => setForm({ ...form, imagen: e.target.value })} placeholder="https://..." />
              </label>
              <div className="acciones-inline">
                <button className="btn btn--primario" type="submit" disabled={guardando}>
                  {guardando ? 'Guardando…' : 'Publicar'}
                </button>
                {editandoId && (
                  <button className="btn btn--fantasma" type="button" onClick={resetearForm}>Cancelar</button>
                )}
              </div>
            </form>

            <h2>Catálogo</h2>
            <div className="tabla-wrap">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {catalogo.productos.map((p) => (
                    <tr key={p.id}>
                      <td>{p.nombre}</td>
                      <td>{catalogo.categorias[p.categoria]?.nombre}</td>
                      <td>{precioCOP(p.precio)}</td>
                      <td>{p.stock}</td>
                      <td>
                        <button className="btn btn--fantasma" type="button" onClick={() => abrirModalEdicion(p)}>Editar</button>
                        <button className="btn btn--fantasma" type="button" onClick={() => borrar(p.id)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {catalogo && seccion === 'categorias' && (
          <>
            <h2>Categorías</h2>
            <div className="lista-admin">
              {Object.entries(catalogo.categorias).map(([clave, categoria]) => (
                <article className="tarjeta" key={clave}>
                  <h3>{categoria.nombre}</h3>
                  <p>{categoria.descripcion}</p>
                  <small>{catalogo.productos.filter((p) => p.categoria === clave).length} productos</small>
                </article>
              ))}
            </div>
          </>
        )}

        {seccion === 'usuarios' && (
          <>
            <h2>Usuarios</h2>
            <div className="tabla-wrap">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>{usuario.nombre}</td>
                      <td>{usuario.email}</td>
                      <td>{usuario.rol}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {seccion === 'mensajes' && (
          <>
            <h2>Mensajes</h2>
            <div className="acciones-inline admin__filtros">
              <button type="button" className={`btn btn--fantasma ${vistaMensajes === 'nuevos' ? 'is-active' : ''}`} onClick={() => setVistaMensajes('nuevos')}>Sin leer ({mensajesNuevos.length})</button>
              <button type="button" className={`btn btn--fantasma ${vistaMensajes === 'leidos' ? 'is-active' : ''}`} onClick={() => setVistaMensajes('leidos')}>Leídos ({mensajesLeidos.length})</button>
            </div>

            {!mensajesActuales.length && <p className="tenue">No hay mensajes en esta vista.</p>}
            <div className="lista-admin">
              {mensajesActuales.map((m) => (
                <article className={`tarjeta ${m.leido ? '' : 'tarjeta--nueva'}`} key={m.id}>
                  <h3>{m.nombre}</h3>
                  <p className="tenue">{m.correo} · {new Date(m.creadoEn).toLocaleString('es-CO')}</p>
                  <p>{m.mensaje}</p>
                  {!m.leido && (
                    <button className="btn btn--fantasma" type="button" onClick={() => leido(m.id)}>Marcar como leído</button>
                  )}
                </article>
              ))}
            </div>
          </>
        )}

        {modalAbierto && (
          <div className="modal-backdrop" onClick={cerrarModalEdicion}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal__header">
                <h3>Editar producto</h3>
                <button className="btn btn--fantasma" type="button" onClick={cerrarModalEdicion}>Cerrar</button>
              </div>

              <form className="formulario formulario--modal" onSubmit={guardarEdicion}>
                <label>
                  Nombre
                  <input value={modalForm.nombre} onChange={(e) => setModalForm({ ...modalForm, nombre: e.target.value })} required />
                </label>
                <label>
                  Categoría
                  <select value={modalForm.categoria} onChange={(e) => setModalForm({ ...modalForm, categoria: e.target.value })}>
                    {Object.entries(catalogo.categorias).map(([clave, c]) => (
                      <option key={clave} value={clave}>{c.nombre}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Precio (COP)
                  <input type="number" min="0" value={modalForm.precio} onChange={(e) => setModalForm({ ...modalForm, precio: e.target.value })} required />
                </label>
                <label>
                  Stock
                  <input type="number" min="0" value={modalForm.stock} onChange={(e) => setModalForm({ ...modalForm, stock: e.target.value })} />
                </label>
                <label>
                  Imagen del producto
                  <input type="file" accept="image/*" onChange={convertirImagenModal} />
                </label>
                <label>
                  O pega una URL de imagen
                  <input value={modalForm.imagen} onChange={(e) => setModalForm({ ...modalForm, imagen: e.target.value })} placeholder="https://..." />
                </label>
                <div className="modal__actions">
                  <button className="btn btn--fantasma" type="button" onClick={cerrarModalEdicion}>Cancelar</button>
                  <button className="btn btn--primario" type="submit" disabled={guardando}>
                    {guardando ? 'Guardando…' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
