// Anchos que acepta el optimizador de imágenes de Vercel. Los comparten el
// sitio (catalogo.ts) y la config del build (vite.vercel.config.ts).
export const ANCHOS_IMAGEN = [64, 128, 256, 384, 640, 828, 1080] as const;
export type AnchoImagen = (typeof ANCHOS_IMAGEN)[number];
