import { createFileRoute } from "@tanstack/react-router";
import { ListaProductos } from "../../components/admin/lista";

export const Route = createFileRoute("/admin/")({
  component: ListaProductos,
});
