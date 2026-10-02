import { createFileRoute } from "@tanstack/react-router";
import { Comparador } from "../components/dp/comparador";
import { Encabezado, Parrillas, Pie, Ubicacion } from "../components/dp/secciones";
import { Taller } from "../components/dp/taller";
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
  const { productos } = Route.useLoaderData();
  return (
    <>
      <a
        href="#comparador"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-cobalto focus:px-4 focus:py-2 focus:text-white"
      >
        Saltar al comparador
      </a>
      <Encabezado />
      <main>
        <Vitrina productos={productos} />
        <Comparador productos={productos} />
        <Taller />
        <Parrillas />
        <Ubicacion />
      </main>
      <Pie />
    </>
  );
}
