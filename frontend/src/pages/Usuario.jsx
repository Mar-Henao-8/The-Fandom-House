import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTema } from '../context/ThemeContext.jsx';
import { ErrorCaja } from '../components/Estado.jsx';
import { Contacto } from './Contacto.jsx';

export function Usuario() {
  const navigate = useNavigate();
  const location = useLocation();
  const { autenticada, email, esAdmin, login, registro, salir } = useAuth();
  const { tema, setTema, temas } = useTema();
  const [modo, setModo] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: 'test@gmail.com', password: 'password1234' });
  const [registroForm, setRegistroForm] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const modoSolicitado = location.state?.abrirModo;
    if (modoSolicitado === 'registro') {
      setModo('registro');
      return;
    }
    if (modoSolicitado === 'login') {
      setModo('login');
    }
  }, [location.state]);

  async function enviarLogin(evento) {
    evento.preventDefault();
    setError('');
    setEnviando(true);
    try {
      const resultado = await login(loginForm);
      if (resultado?.rol === 'admin') {
        navigate('/admin', { replace: true });
        return;
      }
      navigate('/usuario', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  async function enviarRegistro(evento) {
    evento.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await registro(registroForm);
      navigate('/usuario', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (!autenticada) {
    return (
      <section className="seccion">
        <div className="seccion__intro">
          <h1>Inicia sesión o regístrate</h1>
          <p>Accede con tu cuenta para seguir comprando o entrar al panel administrativo.</p>
        </div>

        <div className="acciones-inline" style={{ marginBottom: '1rem' }}>
          <button className="btn btn--fantasma" type="button" onClick={() => setModo('login')}>
            Iniciar sesión
          </button>
          <button className="btn btn--fantasma" type="button" onClick={() => setModo('registro')}>
            Registrarse
          </button>
        </div>

        {error && <ErrorCaja mensaje={error} />}

        {modo === 'login' ? (
          <form className="formulario" onSubmit={enviarLogin}>
            <label>
              Correo
              <input name="email" type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} autoComplete="username" />
            </label>
            <label>
              Contraseña
              <input name="password" type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} autoComplete="current-password" />
            </label>
            <button className="btn btn--primario" type="submit" disabled={enviando}>
              {enviando ? 'Entrando…' : 'Ingresar'}
            </button>
          </form>
        ) : (
          <form className="formulario" onSubmit={enviarRegistro}>
            <label>
              Nombre completo
              <input value={registroForm.nombre} onChange={(e) => setRegistroForm({ ...registroForm, nombre: e.target.value })} required />
            </label>
            <label>
              Correo
              <input type="email" value={registroForm.email} onChange={(e) => setRegistroForm({ ...registroForm, email: e.target.value })} required />
            </label>
            <label>
              Contraseña
              <input type="password" value={registroForm.password} onChange={(e) => setRegistroForm({ ...registroForm, password: e.target.value })} required />
            </label>
            <button className="btn btn--primario" type="submit" disabled={enviando}>
              {enviando ? 'Creando…' : 'Crear cuenta'}
            </button>
          </form>
        )}
      </section>
    );
  }

  return (
    <section className="seccion">
      <div className="perfil">
        <div className="perfil__avatar">
          <Logo />
        </div>
        <div>
          <h1 className="perfil__nombre">{email}</h1>
          <p className="perfil__usuario">{esAdmin ? 'Administrador' : 'Cliente'} · Miembro desde 2026</p>
        </div>
      </div>

      {esAdmin && (
        <div className="acciones-inline" style={{ marginBottom: '1.5rem' }}>
          <button className="btn btn--primario" type="button" onClick={() => navigate('/admin')}>Ir al panel</button>
          <button className="btn btn--fantasma" type="button" onClick={salir}>Cerrar sesión</button>
        </div>
      )}

      {!esAdmin && (
        <div className="acciones-inline" style={{ marginBottom: '1.5rem' }}>
          <button className="btn btn--primario" type="button" onClick={() => navigate('/productos')}>Ver productos</button>
          <button className="btn btn--fantasma" type="button" onClick={salir}>Cerrar sesión</button>
        </div>
      )}

      <div className="seccion__intro">
        <h2>Configuración del tema</h2>
        <p>Elige la identidad visual con la que quieres recorrer la tienda. Tu elección se guarda y se mantiene en todas las páginas.</p>
      </div>
      <div className="temas">
        {Object.entries(temas).map(([clave, t]) => (
          <button
            className="tema"
            type="button"
            key={clave}
            aria-pressed={clave === tema}
            onClick={() => setTema(clave)}
          >
            <span className="tema__muestra" style={{ background: t.muestra }} />
            <span>
              <span className="tema__nombre">{t.nombre}</span><br />
              <span className="tema__estado">{clave === tema ? 'Tema activo' : 'Aplicar tema'}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
