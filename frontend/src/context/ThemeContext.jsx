import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { TEMAS } from '../utils.js';

const CLAVE = 'tfh:tema';
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() => {
    const guardado = localStorage.getItem(CLAVE);
    return TEMAS[guardado] ? guardado : 'hunyadi';
  });

  useEffect(() => {
    document.documentElement.dataset.tema = tema;
    localStorage.setItem(CLAVE, tema);
  }, [tema]);

  const valor = useMemo(() => ({ tema, setTema, temas: TEMAS }), [tema]);
  return <ThemeContext.Provider value={valor}>{children}</ThemeContext.Provider>;
}

export function useTema() {
  return useContext(ThemeContext);
}
