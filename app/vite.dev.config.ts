// Desarrollo local (`bun run dev`): la config base sin el ajuste para Workers
// que rompe el dev server (inlinear los CJS de React) y con Nitro, que desde
// TanStack Start 1.168.60 es el que sirve el SSR en desarrollo.
// DEV_ALLOWED_HOSTS en .env.local (separados por coma) habilita hosts extra,
// por ejemplo un túnel de ngrok.
import { fileURLToPath } from "node:url";
import { nitro } from "nitro/vite";
import { loadEnv, type ConfigEnv, type UserConfig } from "vite";
import base from "./vite.config";

const RAIZ = fileURLToPath(new URL(".", import.meta.url));

export default (env: ConfigEnv): UserConfig => {
  const cfg = (typeof base === "function" ? base(env) : base) as UserConfig;
  const hosts = (loadEnv(env.mode, RAIZ, "").DEV_ALLOWED_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  return {
    ...cfg,
    plugins: [...(cfg.plugins ?? []), nitro()],
    ssr: { ...cfg.ssr, noExternal: [] },
    // 5174: el puerto que figura en las Redirect URLs de Supabase.
    server: { ...cfg.server, port: 5174, ...(hosts.length ? { allowedHosts: hosts } : {}) },
  };
};
