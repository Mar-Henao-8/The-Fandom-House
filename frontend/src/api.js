/**
 * Cliente HTTP hacia el backend.
 * La URL se configura con VITE_API_URL para que el mismo frontend
 * funcione en local y, al publicarse en GitHub Pages, apunte a la API desplegada.
 */
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function pedir(ruta, opciones = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opciones.headers || {}) };
  const token = localStorage.getItem('tfh:token');
  if (token) headers.Authorization = `Bearer ${token}`;

  let respuesta;
  try {
    respuesta = await fetch(`${BASE}${ruta}`, { ...opciones, headers });
  } catch {
    throw new Error('No pudimos conectar con el servidor. Revisa que la API esté encendida.');
  }

  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    throw new Error(datos.error || 'La petición no se pudo completar.');
  }
  return datos;
}

export const api = {
  catalogo: () => pedir('/api/catalogo'),
  contacto: (cuerpo) => pedir('/api/contacto', { method: 'POST', body: JSON.stringify(cuerpo) }),
  pedido: (cuerpo) => pedir('/api/pedidos', { method: 'POST', body: JSON.stringify(cuerpo) }),
  login: (cuerpo) => pedir('/api/login', { method: 'POST', body: JSON.stringify(cuerpo) }),
  registro: (cuerpo) => pedir('/api/usuario/registro', { method: 'POST', body: JSON.stringify(cuerpo) }),
  perfil: () => pedir('/api/usuario/perfil'),
  resumen: () => pedir('/api/admin/resumen'),
  mensajes: () => pedir('/api/admin/mensajes'),
  usuarios: () => pedir('/api/admin/usuarios'),
  marcarLeido: (id) => pedir(`/api/admin/mensajes/${id}`, { method: 'PATCH' }),
  pedidos: () => pedir('/api/admin/pedidos'),
  crearProducto: (cuerpo) => pedir('/api/admin/productos', { method: 'POST', body: JSON.stringify(cuerpo) }),
  editarProducto: (id, cuerpo) => pedir(`/api/admin/productos/${id}`, { method: 'PUT', body: JSON.stringify(cuerpo) }),
  borrarProducto: (id) => pedir(`/api/admin/productos/${id}`, { method: 'DELETE' }),
};
