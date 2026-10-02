import { createServerFn } from "@tanstack/react-start";
import {
  CATALOGO_ESTATICO,
  SELECT_PRODUCTO,
  desdeFila,
  ordenarCatalogo,
  type FilaProducto,
  type Producto,
} from "../components/dp/catalogo";
import { supabaseServidor } from "./supabase";

export type Catalogo = { productos: Producto[]; origen: "supabase" | "estatico" | "error" };

// Catálogo publicado para la portada. Sin Supabase configurado usa los 10
// equipos de siempre; si la base falla, devuelve vacío (y la portada lo avisa)
// en vez de mostrar productos que quizás ya no existen.
export const obtenerCatalogo = createServerFn({ method: "GET" }).handler(async (): Promise<Catalogo> => {
  const sb = supabaseServidor();
  if (!sb) return { productos: CATALOGO_ESTATICO, origen: "estatico" };

  const { data, error } = await sb
    .from("productos")
    .select(SELECT_PRODUCTO)
    .eq("publicado", true)
    .returns<FilaProducto[]>();

  if (error) {
    console.error("No se pudo leer el catálogo:", error.message);
    return { productos: [], origen: "error" };
  }
  return { productos: ordenarCatalogo(data.map(desdeFila)), origen: "supabase" };
});
