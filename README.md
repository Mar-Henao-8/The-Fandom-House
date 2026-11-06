# The Fandom House

Tienda online de accesorios inspirados en películas, series, anime, videojuegos y música.

Aplicación full stack con frontend en React + Vite y backend en Express. La base de datos principal está conectada a Turso/LibSQL, con una capa de persistencia compatible con el esquema previo que usaba MySQL.

## Estructura

```text
backend/              API Express + Turso/LibSQL + autenticación JWT
frontend/             Interfaz React + rutas públicas y privadas
the-fandom-house/     Versión estática previa (solo referencia)
```

## Requisitos

- Node.js 18 o superior
- Una base de datos Turso activa
- Un token de autenticación válido para la base

## Configuración del backend

El archivo `backend/.env` ya incluye la conexión a Turso:

```env
PORT=4000
ADMIN_EMAIL=admin@thefandomhouse.com
ADMIN_PASSWORD=fandom2026
JWT_SECRET=cambia-este-secreto

TURSO_DATABASE_URL=libsql://thefandomhouse-devmanl.aws-us-east-2.turso.io
TURSO_AUTH_TOKEN=tu_token_de_turso
DB_URL=libsql://thefandomhouse-devmanl.aws-us-east-2.turso.io
DB_AUTH_TOKEN=tu_token_de_turso
```

> El backend acepta estas variables y las usa para conectarse a la base remota. El token real debe mantenerse seguro y no publicarse en repositorios públicos.

## Ejecución local

### 1) Instalar dependencias

```bash
cd backend
npm install
```

### 2) Arrancar el backend

```bash
npm run dev
```

### 3) Arrancar el frontend

```bash
cd ../frontend
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## Base de datos en Turso

La persistencia se ha migrado desde MySQL a LibSQL/Turso manteniendo la misma lógica de negocio del proyecto. El backend crea automáticamente las tablas si no existen y inicializa los datos base del sistema.

Tablas principales:

- `categories`
- `products`
- `users`
- `messages`
- `orders`
- `order_items`
- `admin`

Esto permite que la app siga funcionando igual que antes, pero con una base remota gestionada por Turso.

## Credenciales de acceso

### Administrador

- Email: `admin@thefandomhouse.com`
- Contraseña: `fandom2026`

### Usuario de prueba

- Email: `test@gmail.com`
- Contraseña: `password1234`

## Funcionalidades implementadas

### 1. Marca e identidad visual
- Inicio con branding y estilo visual propio de The Fandom House.
- Tema visual consistente con la marca y la mascota Bolt.
- Navegación principal con accesos a la tienda, usuario y carrito.

### 2. Catálogo de productos
- Listado de productos por categorías.
- Filtro por categoría desde la ruta y desde la home.
- Tarjetas con nombre, precio, imagen, stock y categoría.
- Productos destacados en la landing page.

### 3. Carrito de compras
- Añadir productos desde el catálogo.
- Modificar cantidades y eliminar artículos.
- Cálculo automático del total y número de unidades.
- Persistencia del carrito en el navegador.

### 4. Pedido real al backend
- Envío del pedido desde la interfaz.
- Validación de productos y cantidades.
- Registro de pedidos y líneas de compra en la base remota.
- Estado del pedido y total calculado.

### 5. Formulario de contacto
- Validación de nombre, correo y mensaje.
- Envío a la API del backend.
- Mensajes guardados en la base de datos.
- Visualización desde el panel de administración.

### 6. Autenticación y roles
- Login unificado para usuarios y administradores.
- Generación de JWT con rol `usuario` o `admin`.
- Protección de rutas y endpoints según el rol.
- Inicio de sesión de usuario normal que lleva al perfil/tienda.
- Inicio de sesión de administrador que lleva al panel administrativo.

### 7. Registro de usuarios
- Formulario de registro con nombre, correo y contraseña.
- Creación real de usuarios en la base de datos.
- Acceso al perfil del usuario autenticado.
- Opción de cerrar sesión.

### 8. Perfil del usuario
- Vista del perfil con usuario autenticado.
- Cambio de tema visual desde la propia sección del perfil.
- Acceso directo a productos o panel administrativo según el rol.

### 9. Panel de administración
- Resumen con estadísticas del negocio.
- Gestión de productos: crear, editar y eliminar.
- Subida de imagen por URL o archivo local.
- Validación de datos del producto.
- Visualización de mensajes y pedidos.
- Marcado de mensajes como leídos.

### 10. Gestión del catálogo con imágenes
- Soporte para imágenes de producto en base de datos.
- Edición desde ventana emergente.
- Eliminar color manual cuando la imagen es la fuente principal del producto.

## Estado respecto a los requisitos del proyecto

Cumple con la mayoría de requisitos funcionales de una entrega full stack de e-commerce, sin incluir IA:

- App web full stack: sí
- Página de inicio con marca propia: sí
- Catálogo de productos: sí
- Carrito de compra: sí
- Formulario de contacto: sí
- Registro y perfil de usuario: sí
- Panel de administración: sí
- Persistencia real en base de datos: sí
- Separación por roles: sí
- Imagen de producto: sí
- Responsive y UX funcional: sí

### Lo que queda pendiente para una entrega final adicional
- Publicación real del frontend y backend en un entorno online con URL pública.
- Configuración de despliegue final en hosting.
- Funcionalidad de IA, que se dejó fuera por requerimiento.

## Publicación

1. Sube el repositorio a GitHub.
2. Publica el frontend en GitHub Pages o Vercel.
3. Publica el backend en Render, Railway, Fly.io o un servicio similar.
4. Configura la variable `VITE_API_URL` con la URL del backend desplegado.
5. Mantén las variables de entorno del backend protegidas en el servicio de despliegue.

## Autora

**María Henao**
