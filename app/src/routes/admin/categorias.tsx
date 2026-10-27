import { createFileRoute } from "@tanstack/react-router";
import { AdminCategorias } from "../../components/admin/categorias";

export const Route = createFileRoute("/admin/categorias")({
  component: AdminCategorias,
});
