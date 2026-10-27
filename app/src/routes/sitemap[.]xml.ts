import { createFileRoute } from "@tanstack/react-router";
import { urlCategoria, urlProducto, type Producto } from "../components/dp/catalogo";
import { leerCatalogoPublicado } from "../lib/catalogo.functions";

const dia = (iso: string) => iso.slice(0, 10);

const ultimaEdicion = (productos: Producto[]) =>
  productos.reduce((max, p) => (p.actualizadoEn > max ? p.actualizadoEn : max), new Date(0).toISOString());

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const { productos, arbol } = await leerCatalogoPublicado();
        // Solo las categorías con productos (las vacías no se indexan).
        const categorias = arbol.flatMap((m) => {
          const deMadre = productos.filter((p) => p.madre.id === m.id);
          if (!deMadre.length) return [];
          return [
            { loc: `${origin}${urlCategoria(m)}`, lastmod: dia(ultimaEdicion(deMadre)), prioridad: "0.9" },
            ...m.hijas.flatMap((h) => {
              const deSub = deMadre.filter((p) => p.categoria.id === h.id);
              return deSub.length
                ? [{ loc: `${origin}${urlCategoria(m, h)}`, lastmod: dia(ultimaEdicion(deSub)), prioridad: "0.9" }]
                : [];
            }),
          ];
        });
        const entradas = [
          { loc: `${origin}/`, lastmod: dia(productos.length ? ultimaEdicion(productos) : new Date().toISOString()), prioridad: "1.0" },
          ...categorias,
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
