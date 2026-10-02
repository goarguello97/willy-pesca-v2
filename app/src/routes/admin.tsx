import { Outlet, createFileRoute } from "@tanstack/react-router";
import { MarcoPanel } from "../components/admin/marco";
import { PuertaAdmin } from "../components/admin/sesion";

export const Route = createFileRoute("/admin")({
  // Solo en el navegador: la sesión de Supabase vive en el almacenamiento local.
  ssr: false,
  head: () => ({
    meta: [{ title: "Panel · Willy Pesca y Camping" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: Panel,
});

function Panel() {
  return (
    <PuertaAdmin>
      <MarcoPanel>
        <Outlet />
      </MarcoPanel>
    </PuertaAdmin>
  );
}
