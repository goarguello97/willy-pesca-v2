import { createFileRoute } from "@tanstack/react-router";
import { ComoComprar } from "../components/dp/como-comprar";
import { Buscador, SeccionMadre, SinProductos } from "../components/dp/listados";
import { Encabezado, Pie, Ubicacion } from "../components/dp/secciones";
import { Vitrina } from "../components/dp/vitrina";
import { obtenerCatalogo } from "../lib/catalogo.functions";
import { ldNegocio } from "../lib/seo";
import { SITE_URL } from "../lib/sitio";

export const Route = createFileRoute("/")({
  // El título y la descripción salen de app-meta.json (ruta raíz).
  loader: () => obtenerCatalogo(),
  // La CDN guarda la portada 1 minuto: los cambios del panel tardan eso en verse.
  headers: () => ({ "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" }),
  head: ({ loaderData }) => ({
    meta: [
      { property: "og:url", content: `${SITE_URL}/` },
      ...(loaderData ? [{ "script:ld+json": ldNegocio(loaderData.productos) }] : []),
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
  }),
  component: Index,
});

function Index() {
  const { productos, arbol, menu } = Route.useLoaderData();
  return (
    <>
      <a
        href="#catalogo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-cobalto focus:px-4 focus:py-2 focus:text-white"
      >
        Saltar al catálogo
      </a>
      <Encabezado menu={menu} />
      <main>
        <Vitrina productos={productos} />
        <div id="catalogo" className="scroll-mt-16">
          <Buscador productos={productos} />
          {arbol.map((m) => (
            <SeccionMadre key={m.id} madre={m} productos={productos} />
          ))}
          {productos.length ? null : (
            <div className="mx-auto max-w-[1280px] px-4 pb-20 md:px-8">
              <SinProductos nombre="el catálogo" />
            </div>
          )}
        </div>
        <ComoComprar />
        <Ubicacion />
      </main>
      <Pie menu={menu} />
    </>
  );
}
