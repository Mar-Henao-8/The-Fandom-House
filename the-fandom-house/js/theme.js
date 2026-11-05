/* Sistema de temas de The Fandom House.
   El tema elegido se guarda en LocalStorage y se aplica en todas las paginas. */

const TEMAS = {
  hunyadi: { nombre: 'Hunyadi Yellow', muestra: '#E09F3E' },
  auburn: { nombre: 'Auburn', muestra: '#9E2A2B' },
  slate: { nombre: 'Dark Slate Gray', muestra: '#335C67' },
  vanilla: { nombre: 'Vanilla', muestra: '#FFF3D1' },
};

const TEMA_POR_DEFECTO = 'hunyadi';
const CLAVE_TEMA = 'tfh:tema';

function temaGuardado() {
  const t = localStorage.getItem(CLAVE_TEMA);
  return TEMAS[t] ? t : TEMA_POR_DEFECTO;
}

function aplicarTema(clave) {
  const tema = TEMAS[clave] ? clave : TEMA_POR_DEFECTO;
  document.documentElement.dataset.tema = tema;
  localStorage.setItem(CLAVE_TEMA, tema);
  document.dispatchEvent(new CustomEvent('tema:cambio', { detail: { tema } }));
}

aplicarTema(temaGuardado());

window.addEventListener('storage', (e) => {
  if (e.key === CLAVE_TEMA) aplicarTema(temaGuardado());
});
