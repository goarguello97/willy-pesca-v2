// Build para Vercel: la misma config base más Nitro, que en Vercel detecta el
// entorno y genera .vercel/output.
import { nitro } from "nitro/vite";
import type { ConfigEnv, UserConfig } from "vite";
import { ANCHOS_IMAGEN } from "./src/lib/anchos-imagen";
import base from "./vite.config";

// Dominio de producción que Vercel expone al compilar, para las URL absolutas.
const dominio = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const SITE_URL = dominio ? `https://${dominio}` : "https://willypesca.vercel.app";

// Fotos del bucket público de Supabase que puede procesar el optimizador.
const supabase = process.env.VITE_SUPABASE_URL ? new URL(process.env.VITE_SUPABASE_URL).hostname : null;

export default (env: ConfigEnv): UserConfig => {
  const cfg = (typeof base === "function" ? base(env) : base) as UserConfig;
  return {
    ...cfg,
    plugins: [
      ...(cfg.plugins ?? []),
      nitro({
        vercel: {
          // Node en vez del runtime Bun (beta) que Nitro elige si compila con bun.
          functions: { runtime: "nodejs22.x" },
          // Optimizador de imágenes de Vercel (/_vercel/image): tamaño justo y AVIF/WebP.
          config: {
            version: 3,
            images: {
              sizes: [...ANCHOS_IMAGEN],
              domains: [],
              remotePatterns: supabase
                ? [{ protocol: "https", hostname: supabase, pathname: "/storage/v1/object/public/productos/**" }]
                : [],
              formats: ["image/avif", "image/webp"],
              minimumCacheTTL: 2678400,
            },
          },
        },
      }),
    ],
    define: {
      ...cfg.define,
      "import.meta.env.VITE_SITE_URL": JSON.stringify(SITE_URL),
      "import.meta.env.VITE_IMAGENES_VERCEL": JSON.stringify("1"),
    },
  };
};
