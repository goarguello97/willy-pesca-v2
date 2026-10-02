// Build para Vercel (Higgsfield sigue usando vite.config.ts): la misma config
// más Nitro, que en Vercel detecta el entorno y genera .vercel/output.
import { nitro } from "nitro/vite";
import type { ConfigEnv, UserConfig } from "vite";
import base from "./vite.config";

// Dominio de producción que Vercel expone al compilar, para las URL absolutas.
const dominio = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const SITE_URL = dominio ? `https://${dominio}` : "https://willypesca.vercel.app";

export default (env: ConfigEnv): UserConfig => {
  const cfg = (typeof base === "function" ? base(env) : base) as UserConfig;
  return {
    ...cfg,
    plugins: [
      ...(cfg.plugins ?? []),
      // Node en vez del runtime Bun (beta) que Nitro elige si compila con bun.
      nitro({ vercel: { functions: { runtime: "nodejs22.x" } } }),
    ],
    define: { ...cfg.define, "import.meta.env.VITE_SITE_URL": JSON.stringify(SITE_URL) },
  };
};
