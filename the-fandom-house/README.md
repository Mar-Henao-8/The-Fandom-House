# The Fandom House

Tienda online (sitio estático) de accesorios inspirados en películas, series, anime, videojuegos y música.

## Cómo verlo

```bash
python3 -m http.server 8080
# abrir http://localhost:8080/index.html
```

## Estructura

| Archivo | Contenido |
| --- | --- |
| `index.html` | Portada: mascota Bolt, lema y accesos rápidos |
| `usuario.html` | Perfil y selector de temas |
| `contacto.html` | Canales de contacto |
| `carrito.html` | Carrito con cantidades, eliminar, vaciar y total |
| `productos.html` | Catálogo completo por categorías |
| `pines.html`, `fundas.html`, `stickers.html` | Catálogos por categoría |
| `css/estilos.css` | Estilos y los cuatro temas |
| `js/theme.js` | Temas + patrón de fondo + LocalStorage |
| `js/brand.js` | Isotipo (una imagen por tema) y mascota Bolt |
| `assets/` | Logos, fondos por tema y mascota (PNG de la marca) |
| `js/catalogo.js` | Productos y tarjetas |
| `js/carrito.js` | Carrito persistido en LocalStorage |
| `build_pages.py` | Genera los HTML a partir de una plantilla común |

## Temas

`Hunyadi Yellow`, `Auburn`, `Dark Slate Gray` y `Vanilla`. El tema se guarda en
LocalStorage (`tfh:tema`) y afecta el fondo (`assets/fondo-*.png`), títulos,
botones e isotipo (`assets/logo-*.png`) en todas las páginas.

## Editar el contenido

Los HTML se generan con `python3 build_pages.py`; edita `build_pages.py` (o los
archivos JS) y vuelve a ejecutarlo para no duplicar encabezado y pie.
