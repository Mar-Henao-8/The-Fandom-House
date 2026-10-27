"""Genera las páginas HTML de The Fandom House a partir de plantillas comunes."""
from pathlib import Path

RAIZ = Path(__file__).parent

BASE = """<!DOCTYPE html>
<html lang="es" data-tema="hunyadi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{titulo}</title>
  <meta name="description" content="{descripcion}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="icon" href="assets/logo-hunyadi.png" type="image/png">
  <link rel="stylesheet" href="css/estilos.css">
  <script src="js/theme.js"></script>
</head>
<body>
  <header class="encabezado">
    <nav class="nav contenedor" aria-label="Navegación principal">
      <a class="nav__enlace" href="usuario.html"{a_usuario}>Usuario</a>
      <a class="nav__enlace" href="contacto.html"{a_contacto}>Contacto</a>
      <a class="nav__logo" href="index.html" aria-label="Inicio - The Fandom House" data-logo></a>
      <a class="nav__enlace nav__carrito" href="carrito.html"{a_carrito}>Tu carrito <span class="contador" data-contador-carrito hidden>0</span></a>
      <a class="nav__enlace" href="productos.html"{a_productos}>Productos</a>
    </nav>
  </header>

  <main>
    <div class="contenedor">
{contenido}
    </div>
  </main>

  <footer class="pie">&copy; 2026 The Fandom House</footer>

  <script src="js/brand.js"></script>
  <script src="js/carrito.js"></script>
  <script src="js/catalogo.js"></script>
{scripts}
</body>
</html>
"""

ICONOS = {
    "pines": '<path d="M12 21s-1-4-1-6H8l3-4-1-1a4 4 0 0 1 6-5l1 1a4 4 0 0 1-5 6l-1 1 3 4h-3c0 2-1 6-1 6Z"/>',
    "fundas": '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10.5 5.5h3"/><path d="M9 18h6"/>',
    "stickers": '<path d="M14.5 3H7a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h5l8-8V6a3 3 0 0 0-3-3Z"/><path d="M12 21v-5a3 3 0 0 1 3-3h5"/>',
    "mas": '<circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/>',
}

ACCESOS = [
    ("Pines", "pines.html", "pines", "Coleccionables esmaltados"),
    ("Fundas para celular", "fundas.html", "fundas", "Arte original protegido"),
    ("Stickers", "stickers.html", "stickers", "Packs temáticos resistentes"),
    ("Muchas más...", "productos.html", "mas", "Todo el catálogo"),
]


def acceso(nombre, href, icono, detalle):
    return f"""        <a class="acceso" href="{href}">
          <svg class="acceso__icono" viewBox="0 0 24 24" aria-hidden="true">{ICONOS[icono]}</svg>
          <span>
            <span class="acceso__nombre">{nombre}</span><br>
            <span class="tenue">{detalle}</span>
          </span>
          <span class="acceso__flecha" aria-hidden="true">&rarr;</span>
        </a>"""


INDEX = """      <section class="seccion portada">
        <div class="portada__presentacion">
          <div data-mascota></div>
          <div>
            <h1 class="lema">Tu fandom <em>vive aquí.</em></h1>
            <p class="portada__texto">Descubre accesorios inspirados en tus historias favoritas y expresa quién eres con cada detalle.</p>
            <div class="portada__acciones">
              <a class="btn btn--primario" href="productos.html">Ver catálogo</a>
              <a class="btn btn--fantasma" href="usuario.html">Personalizar tema</a>
            </div>
          </div>
        </div>
        <div class="accesos">
%s
        </div>
      </section>

      <section class="seccion">
        <div class="seccion__intro">
          <h2>Destacados de la semana</h2>
          <p>Una selección rotativa de piezas favoritas de la comunidad.</p>
        </div>
        <div class="rejilla" data-destacados></div>
      </section>
""" % "\n".join(acceso(*a) for a in ACCESOS)

INDEX_SCRIPTS = """  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const destacados = ['pin-05', 'fun-03', 'stk-01', 'lla-01'];
      document.querySelector('[data-destacados]').innerHTML =
        PRODUCTOS.filter((p) => destacados.includes(p.id)).map(tarjetaProducto).join('');
    });
  </script>"""

USUARIO = """      <section class="seccion">
        <div class="perfil">
          <div class="perfil__avatar" data-logo></div>
          <div>
            <h1 class="perfil__nombre">María Henao</h1>
            <p class="perfil__usuario">@mariafandom &middot; Miembro desde 2026</p>
          </div>
        </div>

        <div class="seccion__intro">
          <h2>Configuración del tema</h2>
          <p>Elige la identidad visual con la que quieres recorrer la tienda. Tu elección se guarda y se mantiene en todas las páginas.</p>
        </div>
        <div class="temas" data-temas></div>
      </section>
"""

USUARIO_SCRIPTS = """  <script>
    const cont = document.querySelector('[data-temas]');
    function pintarTemas() {
      const actual = document.documentElement.dataset.tema;
      cont.innerHTML = Object.entries(TEMAS).map(([clave, t]) => `
        <button class="tema" type="button" data-tema-opcion="${clave}" aria-pressed="${clave === actual}">
          <span class="tema__muestra" style="background:${t.muestra}"></span>
          <span>
            <span class="tema__nombre">${t.nombre}</span><br>
            <span class="tema__estado">${clave === actual ? 'Tema activo' : 'Aplicar tema'}</span>
          </span>
        </button>`).join('');
    }
    cont.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-tema-opcion]');
      if (btn) aplicarTema(btn.dataset.temaOpcion);
    });
    document.addEventListener('tema:cambio', pintarTemas);
    document.addEventListener('DOMContentLoaded', pintarTemas);
  </script>"""

CONTACTOS = [
    ("Correo", "contacto@thefandomhouse.com", "mailto:contacto@thefandomhouse.com",
     '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>'),
    ("Instagram", "@thefandomhouse", "https://instagram.com/thefandomhouse",
     '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/>'),
    ("Facebook", "The Fandom House", "https://facebook.com/thefandomhouse",
     '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V9a1 1 0 0 1 1-1Z"/>'),
    ("TikTok", "@thefandomhouse", "https://tiktok.com/@thefandomhouse",
     '<path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 4c.6 2.6 2.3 4 5 4.2"/>'),
    ("WhatsApp", "+57 312 345 6789", "https://wa.me/573123456789",
     '<path d="M4 20l1.3-3.6A8 8 0 1 1 8 19.2L4 20Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5"/>'),
]

CONTACTO = """      <section class="seccion">
        <div class="seccion__intro">
          <h1>Hablemos</h1>
          <p>Escríbenos por el canal que prefieras: resolvemos dudas sobre pedidos, envíos y colaboraciones con creadores.</p>
        </div>
        <div class="contactos">
%s
        </div>
      </section>
""" % "\n".join(
    f"""          <a class="contacto" href="{href}" target="_blank" rel="noopener">
            <svg class="contacto__icono" viewBox="0 0 24 24" aria-hidden="true">{icono}</svg>
            <span>
              <span class="contacto__etiqueta">{etiqueta}</span><br>
              <span class="contacto__valor">{valor}</span>
            </span>
          </a>"""
    for etiqueta, valor, href, icono in CONTACTOS
)

CARRITO = """      <section class="seccion">
        <div class="seccion__intro">
          <h1>Tu carrito</h1>
          <p>Los productos se guardan en tu navegador, así que siguen aquí cuando vuelvas.</p>
        </div>
        <div class="carrito">
          <div data-lineas></div>
          <aside class="resumen" data-resumen hidden>
            <div class="resumen__fila"><span class="tenue">Productos</span><span data-unidades>0</span></div>
            <div class="resumen__fila"><span class="tenue">Total</span><span class="resumen__total" data-total>$0</span></div>
            <button class="btn btn--primario" type="button" data-pagar>Finalizar compra</button>
            <button class="btn btn--fantasma" type="button" data-vaciar>Vaciar carrito</button>
          </aside>
        </div>
      </section>
"""

CARRITO_SCRIPTS = """  <script>
    const lineas = document.querySelector('[data-lineas]');
    const resumen = document.querySelector('[data-resumen]');

    function pintarCarrito() {
      const items = Carrito.items();
      resumen.hidden = items.length === 0;
      if (!items.length) {
        lineas.innerHTML = `<div class="vacio">
            <div data-logo></div>
            <h2>Tu carrito está vacío</h2>
            <p>Explora el catálogo y suma tus primeros accesorios.</p>
            <a class="btn btn--primario" href="productos.html">Ver productos</a>
          </div>`;
        pintarMarca();
        return;
      }
      lineas.innerHTML = items.map((i) => `
        <article class="linea">
          <img class="linea__img" src="${i.imagen}" alt="${i.nombre}">
          <div>
            <h3 class="linea__nombre">${i.nombre}</h3>
            <p class="linea__precio">${precioCOP(i.precio)}</p>
          </div>
          <div class="cantidad">
            <button class="cantidad__btn" type="button" data-menos="${i.id}" aria-label="Quitar una unidad">-</button>
            <span>${i.cantidad}</span>
            <button class="cantidad__btn" type="button" data-mas="${i.id}" aria-label="Agregar una unidad">+</button>
          </div>
          <button class="linea__eliminar" type="button" data-eliminar="${i.id}" aria-label="Eliminar ${i.nombre}">&times;</button>
        </article>`).join('');
      document.querySelector('[data-unidades]').textContent = Carrito.unidades();
      document.querySelector('[data-total]').textContent = precioCOP(Carrito.total());
    }

    lineas.addEventListener('click', (e) => {
      const mas = e.target.closest('[data-mas]');
      const menos = e.target.closest('[data-menos]');
      const eliminar = e.target.closest('[data-eliminar]');
      if (mas) Carrito.cambiarCantidad(mas.dataset.mas, 1);
      if (menos) Carrito.cambiarCantidad(menos.dataset.menos, -1);
      if (eliminar) Carrito.eliminar(eliminar.dataset.eliminar);
    });
    document.querySelector('[data-vaciar]').addEventListener('click', () => Carrito.vaciar());
    document.querySelector('[data-pagar]').addEventListener('click', (e) => {
      e.target.textContent = 'Gracias por tu compra';
      setTimeout(() => { Carrito.vaciar(); e.target.textContent = 'Finalizar compra'; }, 1400);
    });
    document.addEventListener('carrito:cambio', pintarCarrito);
    document.addEventListener('DOMContentLoaded', pintarCarrito);
  </script>"""


def pagina_categoria(titulo, descripcion, categoria):
    contenido = f"""      <section class="seccion">
        <div class="seccion__intro">
          <h1>{titulo}</h1>
          <p>{descripcion}</p>
        </div>
        <div class="rejilla" data-catalogo></div>
      </section>
"""
    scripts = f"""  <script>
    document.addEventListener('DOMContentLoaded', () => pintarCatalogo('[data-catalogo]', {categoria!r}));
  </script>"""
    return contenido, scripts


PRODUCTOS_CONT = """      <section class="seccion">
        <div class="seccion__intro">
          <h1>Catálogo completo</h1>
          <p>Explora todas las categorías de The Fandom House y filtra por lo que más te gusta.</p>
        </div>
        <div class="rejilla" data-categorias></div>
      </section>

      <section class="seccion">
        <h2>Todos los productos</h2>
        <div class="rejilla" data-catalogo></div>
      </section>
"""

PRODUCTOS_SCRIPTS = """  <script>
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelector('[data-categorias]').innerHTML = Object.entries(CATEGORIAS)
        .map(([clave, c]) => `<article class="tarjeta">
            <h3>${c.nombre}</h3>
            <p>${c.descripcion}</p>
            <a class="tarjeta__enlace" href="${c.archivo}">Ver ${c.nombre.toLowerCase()} &rarr;</a>
          </article>`).join('');
      pintarCatalogo('[data-catalogo]');
    });
  </script>"""

PAGINAS = {
    "index.html": ("The Fandom House | Tu fandom vive aquí", "Tienda online de accesorios inspirados en películas, series, anime, videojuegos y música.", INDEX, INDEX_SCRIPTS, None),
    "usuario.html": ("Usuario | The Fandom House", "Perfil de usuario y configuracion de tema de The Fandom House.", USUARIO, USUARIO_SCRIPTS, "usuario.html"),
    "contacto.html": ("Contacto | The Fandom House", "Canales de contacto de The Fandom House.", CONTACTO, "", "contacto.html"),
    "carrito.html": ("Tu carrito | The Fandom House", "Revisa y gestiona los productos de tu carrito.", CARRITO, CARRITO_SCRIPTS, "carrito.html"),
    "productos.html": ("Productos | The Fandom House", "Catálogo completo de accesorios de The Fandom House.", PRODUCTOS_CONT, PRODUCTOS_SCRIPTS, "productos.html"),
}

for archivo, (titulo, descripcion, categoria) in {
    "pines.html": ("Pines", "Pines esmaltados de colección para tu chaqueta, mochila o tablero.", "pines"),
    "fundas.html": ("Fundas para celular", "Fundas resistentes con arte original inspirado en tus fandoms.", "fundas"),
    "stickers.html": ("Stickers", "Stickers vinílicos resistentes al agua, en packs temáticos.", "stickers"),
}.items():
    contenido, scripts = pagina_categoria(titulo, descripcion, categoria)
    PAGINAS[archivo] = (f"{titulo} | The Fandom House", descripcion, contenido, scripts, "productos.html")


def marcar(destino, actual):
    return ' aria-current="page"' if destino == actual else ""


for archivo, (titulo, descripcion, contenido, scripts, actual) in PAGINAS.items():
    html = BASE.format(
        titulo=titulo,
        descripcion=descripcion,
        contenido=contenido,
        scripts=scripts,
        a_usuario=marcar("usuario.html", actual),
        a_contacto=marcar("contacto.html", actual),
        a_carrito=marcar("carrito.html", actual),
        a_productos=marcar("productos.html", actual),
    )
    (RAIZ / archivo).write_text(html, encoding="utf-8")
    print("generado", archivo)
