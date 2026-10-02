import { createFileRoute } from "@tanstack/react-router";
import { urlProducto } from "../components/dp/catalogo";
import { leerCatalogoPublicado } from "../lib/catalogo.functions";

const dia = (iso: string) => iso.slice(0, 10);

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const { productos } = await leerCatalogoPublicado();
        const ultimaEdicion = productos.reduce(
          (max, p) => (p.actualizadoEn > max ? p.actualizadoEn : max),
          new Date(0).toISOString(),
        );
        const entradas = [
          { loc: `${origin}/`, lastmod: dia(productos.length ? ultimaEdicion : new Date().toISOString()), prioridad: "1.0" },
          ...productos.map((p) => ({ loc: `${origin}${urlProducto(p)}`, lastmod: dia(p.actualizadoEn), prioridad: "0.8" })),
        ];
        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...entradas.map(
            (e) =>
              `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <priority>${e.prioridad}</priority>\n  </url>`,
          ),
          '</urlset>',
        ].join('\n')
        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=0, s-maxage=3600',
          },
        })
      },
    },
  },
})
