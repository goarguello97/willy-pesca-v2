// URL pública del sitio, para las direcciones absolutas (og:image, canonical,
// JSON-LD). En Vercel la inyecta vite.vercel.config.ts al compilar; en
// Higgsfield queda su subdominio.
export const SITE_URL: string =
  import.meta.env.VITE_SITE_URL || "https://willy-pesca-deportivo.higgsfield.app";
