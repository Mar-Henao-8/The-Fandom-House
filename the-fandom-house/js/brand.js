/* Isotipo y mascota de The Fandom House.
   El isotipo cambia de version segun el tema activo. */

const LOGOS = {
  hunyadi: 'assets/logo-hunyadi.png',
  auburn: 'assets/logo-auburn.png',
  slate: 'assets/logo-slate.png',
  vanilla: 'assets/logo-hunyadi.png',
};

const LOGO_HTML = '<img class="isotipo" src="assets/logo-hunyadi.png" alt="The Fandom House">';
const MASCOTA_HTML = '<img class="mascota" src="assets/bolt.png" alt="Bolt, la mascota de The Fandom House">';

function actualizarLogos() {
  const src = LOGOS[document.documentElement.dataset.tema] || LOGOS.hunyadi;
  document.querySelectorAll('img.isotipo').forEach((img) => { img.src = src; });
}

function pintarMarca() {
  document.querySelectorAll('[data-logo]').forEach((n) => { n.innerHTML = LOGO_HTML; });
  document.querySelectorAll('[data-mascota]').forEach((n) => { n.innerHTML = MASCOTA_HTML; });
  actualizarLogos();
}

document.addEventListener('DOMContentLoaded', pintarMarca);
document.addEventListener('tema:cambio', actualizarLogos);
