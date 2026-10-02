import { createFileRoute } from "@tanstack/react-router";
import { EditorProducto } from "../../components/admin/editor";

// /admin/producto/nuevo crea uno; /admin/producto/<id> edita ese.
export const Route = createFileRoute("/admin/producto/$id")({
  component: Editar,
});

function Editar() {
  const { id } = Route.useParams();
  return <EditorProducto id={id} />;
}
