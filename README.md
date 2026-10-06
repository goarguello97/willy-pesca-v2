# Willy Pesca y Camping

Sitio web de **Willy Pesca y Camping**, casa de pesca de Los Cóndores (Calamuchita, Córdoba). Muestra el catálogo de reels y cañas con su ficha técnica, canaliza las consultas por WhatsApp y tiene un panel para que el negocio cargue y actualice sus productos.

**Producción:** https://willypesca.vercel.app

## Funcionalidades

### Sitio público

- **Vitrina:** el equipo elegido en grande, con etiquetas de su ficha técnica y una tira para cambiar de equipo. El botón "Consultá stock" abre WhatsApp con el equipo ya nombrado.
- **Comparador:** pestañas por categoría con ficha técnica y precio de cada producto, y consulta por WhatsApp desde cada fila.
- **Página por producto** (`/producto/<nombre>-<código>`): galería, ficha técnica, precio, consulta por WhatsApp y productos relacionados. Si el nombre cambia, la dirección vieja redirige (301) a la nueva.
- **Cómo comprar:** los tres pasos (elegir, consultar por WhatsApp y retirar en Los Cóndores).
- **Ubicación y contacto:** mapa de OpenStreetMap (se carga al tocarlo), WhatsApp e Instagram.

### Posicionamiento en buscadores (SEO)

- Título y descripción con rubro y ubicación; cada producto tiene los suyos.
- Datos estructurados (JSON-LD): el negocio (`SportingGoodsStore`, con su catálogo y servicios), cada producto (`Product`) y la ruta de navegación (`BreadcrumbList`).
- `sitemap.xml` con la portada y todas las páginas de producto; `robots.txt` deja afuera `/admin`.
- URL canónica por página y Open Graph para compartir en redes.
- Rendimiento: fuentes servidas desde el sitio y precargadas, CSS sin estilos de la plantilla y fotos optimizadas por Vercel (tamaño justo y AVIF/WebP).
- Verificación de Google Search Console con la variable `VITE_GOOGLE_SITE_VERIFICATION`.

### Panel de administración

- Está en `/admin`. Se llega desde el enlace "Ingresar", discreto, en el pie del sitio.
- Ingreso con Google. Solo pueden entrar las cuentas cargadas en la tabla `admins`.
- **Lista de productos:** búsqueda, filtro de publicados y borradores, y cambio rápido de "Publicado" y "En vitrina". Desde ahí se edita o se borra cada producto.
- **Editor:** categoría (reel, caña, accesorio, camping u otro), marca, nombre, precio opcional y descripción. La ficha técnica cambia según la categoría: tipo y rulemanes en reels, largo y armado en cañas.
- **Fotos:** hasta 8 por producto; la primera es la principal y se pueden reordenar. El navegador las achica a 1600 px y las recomprime (WebP o JPEG) antes de subirlas, así que una foto de celular de varios MB queda en unos 200 KB.
- Los cambios se ven en el sitio en hasta un minuto, por la caché de la CDN.

## Tecnologías

| Parte | Herramienta |
| --- | --- |
| Framework | React 19 + [TanStack Start](https://tanstack.com/start) (SSR, rutas por archivos, server functions) |
| Build | Vite 7, con [Nitro](https://nitro.build) para la salida de Vercel |
| Estilos | Tailwind CSS 4 + CSS propio (`app/src/components/dp/dp.css`) |
| Datos | [Supabase](https://supabase.com): Postgres con RLS, Auth con Google y Storage para las fotos |
| Paquetes | Bun |
| Hosting | Vercel (función en Node 22 y CDN) |

## Estructura

```
.
├── .github/workflows/ci.yml    CI heredado de la plantilla (no corre en este repo)
├── README.md
└── app/                        el proyecto
    ├── public/                 fotos, favicon, íconos e imagen para redes
    ├── src/
    │   ├── components/dp/      secciones del sitio, estilos y modelo del catálogo
    │   ├── components/admin/   panel: sesión, lista, editor y subida de fotos
    │   ├── lib/                Supabase, server functions del catálogo, SEO (JSON-LD) y URL del sitio
    │   └── routes/             páginas (/, /producto/$slug, /admin, /admin/producto/$id, robots, sitemap)
    ├── supabase/               SQL de la base y guía de configuración (LEEME.md)
    ├── packages/               paquetes de la plantilla original (quanta aporta estilos base)
    ├── vite.config.ts          config base
    ├── vite.dev.config.ts      desarrollo local
    ├── vite.vercel.config.ts   build de producción para Vercel
    └── vercel.json             comandos de instalación y build en Vercel
```

## Requisitos

- [Bun](https://bun.sh) 1.3 o superior.
- Node.js 22 o superior.
- Para el catálogo y el panel: un proyecto en Supabase y una credencial OAuth de Google. El paso a paso está en [app/supabase/LEEME.md](app/supabase/LEEME.md).

## Puesta en marcha local

```bash
git clone https://github.com/goarguello97/willy-pesca-v2.git
cd willy-pesca-v2/app
bun install
cp .env.example .env.local
bun run dev
```

El sitio queda en http://localhost:5174. Completá `.env.local` con los datos de Supabase (ver [Variables de entorno](#variables-de-entorno)).

Sin esas variables el sitio igual funciona: muestra los 10 equipos de base y el panel avisa que falta la conexión. Para probar el ingreso con Google en local, `http://localhost:5174/admin` tiene que estar entre las Redirect URLs de Supabase.

## Variables de entorno

| Variable | Dónde | Para qué |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | `.env.local` y Vercel | URL del proyecto (`https://<id>.supabase.co`) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `.env.local` y Vercel | Clave publishable (`sb_publishable_…`) |
| `VITE_GOOGLE_SITE_VERIFICATION` | Vercel, opcional | Código de verificación de Google Search Console (método "Etiqueta HTML") |
| `DEV_ALLOWED_HOSTS` | `.env.local`, opcional | Hosts extra para el servidor de desarrollo, separados por coma (por ejemplo, un túnel de ngrok) |
| `VERCEL_PROJECT_PRODUCTION_URL` | La pone Vercel | Dominio para las URL absolutas (imagen para redes, canonical, JSON-LD) |

Las variables `VITE_…` terminan dentro del código que descarga el navegador. Por eso:

- En Vercel se cargan como **Config**, no como Secret.
- Se usa la clave **publishable** y nunca la secreta (`sb_secret_…`) ni la `service_role`.
- Lo que protege los datos son las políticas RLS de la base.

## Base de datos

El SQL está en [app/supabase](app/supabase) y se corre una vez en el SQL Editor de Supabase:

1. `01_esquema.sql`: tablas, permisos y el bucket de fotos.
2. `02_datos_iniciales.sql`: administradores y los 10 equipos iniciales.

| Elemento | Contenido |
| --- | --- |
| `productos` | Categoría, marca, nombre, precio, descripción, ficha técnica, "destacado" (vitrina) y "publicado" |
| `producto_imagenes` | Fotos de cada producto, con su orden y su ruta en Storage |
| `admins` | Mails de las cuentas de Google que pueden administrar |
| `es_admin()` | Indica si quien hace la consulta es administrador |
| Bucket `productos` | Fotos públicas por URL; solo los administradores suben o borran |

Las políticas RLS dejan leer a cualquiera solo lo publicado, y solo los administradores pueden crear, editar o borrar productos y fotos.

Para sumar un administrador:

```sql
insert into public.admins (email) values ('cuenta@gmail.com');
```

## Despliegue

Vercel está conectado a este repositorio: cada push a `main` publica una versión nueva.

- **Root Directory:** `app`.
- **Instalación y build:** `bun install` y `bun run build:vercel`, definidos en `vercel.json`. Nitro genera `.vercel/output`, con la función en Node 22.
- **Caché:** la portada y las páginas de producto se guardan 60 segundos en la CDN (`s-maxage=60, stale-while-revalidate=300`).
- **Imágenes:** pasan por el optimizador de Vercel (`/_vercel/image`), configurado en `vite.vercel.config.ts` para las fotos del sitio y del bucket de Supabase.
- **Versión mínima:** Vercel bloquea los despliegues con TanStack Start anterior a 1.168.60 por la vulnerabilidad CVE-2026-102989. El proyecto ya usa una versión corregida.
- **Importación:** si Vercel detecta "varias aplicaciones" por la carpeta `app/packages`, el proyecto se importa como una sola app TanStack Start. `vercel.json` ya fija el framework.

## Scripts

Se corren dentro de `app/`.

| Comando | Qué hace |
| --- | --- |
| `bun run dev` | Servidor de desarrollo en http://localhost:5174 |
| `bun run typecheck` | Chequeo de tipos con TypeScript |
| `bun run build:vercel` | Build de producción para Vercel |

## Notas

- **Origen del proyecto:** nació de una plantilla de Higgsfield pensada para Cloudflare Workers. De ahí vienen `vite.config.ts`, `wrangler.jsonc`, `app.manifest.json` y `app/packages`. Ya no se publica ahí; se conservan porque las configs de desarrollo y de Vercel parten de `vite.config.ts` y el paquete `quanta` aporta estilos base.
- **Fotos y logo:** las fotos iniciales de los productos vienen del Instagram del negocio ([@willypesca_camping](https://www.instagram.com/willypesca_camping/)) y el logo es el del negocio.
- **Estilo de los textos:** el nombre se escribe siempre completo, "Willy Pesca y Camping", y los títulos van sin punto final.

## Créditos

Diseño y desarrollo web: [Gonzalo Argüello](https://www.linkedin.com/in/gonzalo-arg%C3%BCello/).
