import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { imagenProducto } from '../utils.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

function claveCarrito(email, esAdmin) {
  if (esAdmin) return 'tfh:carrito:admin';
  if (email) return `tfh:carrito:${String(email).trim().toLowerCase()}`;
  return 'tfh:carrito:anon';
}

function leer(clave) {
  try {
    const datos = JSON.parse(localStorage.getItem(clave));
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const { email, esAdmin, autenticada } = useAuth();
  const clave = useMemo(() => claveCarrito(email, esAdmin), [email, esAdmin]);
  const [items, setItems] = useState(() => leer(clave));

  useEffect(() => {
    if (esAdmin || !autenticada) {
      setItems([]);
      localStorage.removeItem(clave);
      return;
    }
    setItems(leer(clave));
  }, [clave, esAdmin, autenticada]);

  useEffect(() => {
    if (esAdmin || !autenticada) {
      localStorage.removeItem(clave);
      return;
    }
    localStorage.setItem(clave, JSON.stringify(items));
  }, [clave, esAdmin, autenticada, items]);

  const api = useMemo(() => {
    const guardar = (siguiente) => setItems(siguiente);
    return {
      items,
      unidades: items.reduce((t, i) => t + i.cantidad, 0),
      total: items.reduce((t, i) => t + i.precio * i.cantidad, 0),
      puedeComprar: autenticada && !esAdmin,
      agregar(producto) {
        if (!autenticada || esAdmin) return;
        guardar((actual) => {
          const existente = actual.find((i) => i.id === producto.id);
          if (existente) {
            return actual.map((i) => (i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i));
          }
          return [...actual, {
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: imagenProducto(producto),
            cantidad: 1,
          }];
        });
      },
      cambiarCantidad(id, delta) {
        if (!autenticada || esAdmin) return;
        guardar((actual) =>
          actual
            .map((i) => (i.id === id ? { ...i, cantidad: i.cantidad + delta } : i))
            .filter((i) => i.cantidad > 0),
        );
      },
      eliminar(id) {
        if (!autenticada || esAdmin) return;
        guardar((actual) => actual.filter((i) => i.id !== id));
      },
      vaciar() {
        if (!autenticada || esAdmin) return;
        guardar([]);
      },
    };
  }, [autenticada, esAdmin, items]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCarrito() {
  return useContext(CartContext);
}
