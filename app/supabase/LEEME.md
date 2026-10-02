# Supabase: catálogo y panel de administración

El sitio lee los productos publicados de Supabase. El panel (`/admin`, enlace
"Ingresar" en el pie) permite cargarlos con fotos. Solo pueden editar las
cuentas de Google listadas en la tabla `admins`.

## 1. Proyecto

1. En supabase.com, crear un proyecto (región South America, São Paulo).
2. En Project Settings → API Keys, copiar la **Project URL** y la
   **Publishable key**.

## 2. Tablas y datos

En SQL Editor:

1. Correr `01_esquema.sql` (tablas, permisos y el bucket de fotos `productos`).
2. Abrir `02_datos_iniciales.sql`, reemplazar los dos mails por las cuentas de
   Google de los administradores y correrlo. Carga también los 10 equipos que
   ya mostraba el sitio.

Para sumar otro administrador más adelante:

```sql
insert into public.admins (email) values ('nuevo-admin@gmail.com');
```

## 3. Ingreso con Google

1. Supabase → Authentication → Sign In / Providers → Google: copiar la
   **Callback URL** (`https://<proyecto>.supabase.co/auth/v1/callback`).
2. console.cloud.google.com → crear un proyecto nuevo.
3. Google Auth Platform (console.cloud.google.com/auth/overview) → Get started:
   nombre "Willy Pesca y Camping", mail de soporte, audiencia **External**.
4. Audience → **Publish app** (con email y perfil no pide verificación).
5. Data Access → Add scopes: `openid`, `.../auth/userinfo.email`,
   `.../auth/userinfo.profile`.
6. Clients → Create client → **Web application**:
   - Authorized JavaScript origins: la dirección de Vercel y `http://localhost:5174`.
   - Authorized redirect URIs: la Callback URL del paso 1.
   - Copiar el Client ID y el **Client secret en ese momento** (después Google
     no lo vuelve a mostrar; conviene descargar el JSON).
7. De vuelta en Supabase, en el proveedor Google: activarlo, pegar Client ID y
   Client secret, Save.
8. Authentication → URL Configuration:
   - Site URL: la dirección de producción en Vercel.
   - Redirect URLs: `<dirección de Vercel>/admin`, `http://localhost:5174/admin`
     y la dirección de ngrok seguida de `/admin` si se usa.
9. Cuando todos los administradores hayan entrado una vez, desactivar
   "Allow new users to sign up" para que no se creen cuentas sueltas.

## 4. Variables de entorno

- Vercel → Settings → Environment Variables (todos los entornos), y después
  Redeploy:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
- En local: copiar `.env.example` como `.env.local` y completarlo.

Sin estas variables el sitio sigue funcionando con los 10 equipos de siempre
y el panel avisa que falta la conexión.

## Notas

- Las fotos se achican a 1600 px y se recomprimen en el navegador antes de
  subirse (unos 150 a 300 KB cada una); el plan gratis trae 1 GB.
- La portada se guarda en la CDN de Vercel 1 minuto: los cambios del panel
  tardan hasta eso en verse.
