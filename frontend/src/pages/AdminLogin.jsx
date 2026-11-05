import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ErrorCaja } from '../components/Estado.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function AdminLogin() {
  const { autenticada, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (autenticada) return <Navigate to="/admin" replace />;

  async function enviar(evento) {
    evento.preventDefault();
    setError('');
    if (!form.email.trim() || !form.password) {
      setError('Completa correo y contraseña.');
      return;
    }
    setEnviando(true);
    try {
      await login(form);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="seccion">
      <div className="seccion__intro">
        <h1>Acceso de administradora</h1>
        <p>Este panel es privado. Solo el equipo de The Fandom House puede gestionar el catálogo y los mensajes.</p>
      </div>
      {error && <ErrorCaja mensaje={error} />}
      <form className="formulario" onSubmit={enviar}>
        <label>
          Correo
          <input name="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="username" />
        </label>
        <label>
          Contraseña
          <input name="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" />
        </label>
        <button className="btn btn--primario" type="submit" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Iniciar sesión'}
        </button>
      </form>
    </section>
  );
}
