import { createFileRoute } from "@tanstack/react-router";
import { fotoPrincipal, textoAlternativo, urlProducto } from "../components/dp/catalogo";
import { FichaProducto } from "../components/dp/ficha-producto";
import { Encabezado, Pie } from "../components/dp/secciones";
import { obtenerProducto } from "../lib/catalogo.functions";
import { absoluta, descripcionProducto, ldMigas, ldProducto } from "../lib/seo";
import { SITE_URL } from "../lib/sitio";

export const Route = createFileRoute("/producto/$slug")({
  loader: ({ params }) => obtenerProducto({ data: params.slug }),
  // Igual que la portada: la CDN la guarda 1 minuto.
  headers: () => ({ "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" }),
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const p = loaderData.producto;
    const url = `${SITE_URL}${urlProducto(p)}`;
    const titulo = `${textoAlternativo(p)} | Willy Pesca y Camping`;
    const descripcion = descripcionProducto(p);
    const foto = fotoPrincipal(p);
    return {
      meta: [
        { title: titulo },
        { name: "description", content: descripcion },
        { property: "og:title", content: titulo },
        { property: "og:description", content: descripcion },
        { property: "og:type", content: "product" },
        { property: "og:url", content: url },
        { name: "twitter:title", content: titulo },
        { name: "twitter:description", content: descripcion },
        ...(foto
          ? [
              { property: "og:image", content: absoluta(foto) },
              { name: "twitter:image", content: absoluta(foto) },
            ]
          : []),
        { "script:ld+json": ldProducto(p) },
        { "script:ld+json": ldMigas(p) },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: PaginaProducto,
});

function PaginaProducto() {
  const { producto, relacionados } = Route.useLoaderData();
  return (
    <>
      <Encabezado />
      <main>
        <FichaProducto producto={producto} relacionados={relacionados} />
      </main>
      <Pie />
    </>
  );
}
