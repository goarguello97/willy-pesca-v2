import { notFound, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
  CATALOGO_ESTATICO,
  SELECT_PRODUCTO,
  coincideHuella,
  desdeFila,
  ordenarCatalogo,
  slugProducto,
  type FilaProducto,
  type Producto,
} from "../components/dp/catalogo";
import { supabaseServidor } from "./supabase";

export type Catalogo = { productos: Producto[]; origen: "supabase" | "estatico" | "error" };

// Catálogo publicado. Sin Supabase configurado usa los 10 equipos de siempre;
// si la base falla, devuelve vacío (y la portada lo avisa) en vez de mostrar
// productos que quizás ya no existen.
export async function leerCatalogoPublicado(): Promise<Catalogo> {
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
}

export const obtenerCatalogo = createServerFn({ method: "GET" }).handler(() => leerCatalogoPublicado());

export type FichaProducto = { producto: Producto; relacionados: Producto[] };

// Un producto por su URL. Si el nombre cambió desde que se compartió el enlace,
// redirige (301) a la URL actual; si no existe o no está publicado, 404.
export const obtenerProducto = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }): Promise<FichaProducto> => {
    const { productos } = await leerCatalogoPublicado();
    const producto = productos.find((p) => coincideHuella(p, slug));
    if (!producto) throw notFound();
    const actual = slugProducto(producto);
    if (actual !== slug) {
      throw redirect({ to: "/producto/$slug", params: { slug: actual }, statusCode: 301 });
    }
    const relacionados = productos
      .filter((p) => p.id !== producto.id && p.categoria === producto.categoria)
      .slice(0, 4);
    return { producto, relacionados };
  });
