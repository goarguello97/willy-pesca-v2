import { createFileRoute } from "@tanstack/react-router";
import { PaginaCategoria } from "../../components/dp/pagina-categoria";
import { Encabezado, Pie } from "../../components/dp/secciones";
import { obtenerCategoria, type PaginaCategoria as Datos } from "../../lib/catalogo.functions";
import { headCategoria } from "../../lib/seo";

// /pesca, /camping: todas las subcategorías de la madre.
export const Route = createFileRoute("/$madre/")({
  loader: ({ params }) => obtenerCategoria({ data: { madre: params.madre } }),
  headers: () => ({ "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" }),
  head: ({ loaderData }) => (loaderData ? headCategoria(loaderData as Datos) : {}),
  component: Pagina,
});

function Pagina() {
  const datos = Route.useLoaderData();
  return (
    <>
      <Encabezado menu={datos.menu} />
      <main>
        <PaginaCategoria {...datos} />
      </main>
      <Pie menu={datos.menu} />
    </>
  );
}
