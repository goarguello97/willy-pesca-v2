// URL pública del sitio, para las direcciones absolutas (og:image, canonical,
// JSON-LD). En Vercel la inyecta vite.vercel.config.ts al compilar; en
// cualquier otro entorno usa la dirección de producción.
export const SITE_URL: string =
  import.meta.env.VITE_SITE_URL || "https://willypesca.vercel.app";
