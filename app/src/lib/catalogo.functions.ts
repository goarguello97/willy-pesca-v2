import { notFound, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
  CATALOGO_ESTATICO,
  CATEGORIAS_ESTATICAS,
  SELECT_CATEGORIA,
  SELECT_PRODUCTO,
  armarArbol,
  coincideHuella,
  desdeFilaCategoria,
  desdeFilas,
  ordenarCatalogo,
  slugProducto,
  type Categoria,
  type FilaCategoria,
  type FilaProducto,
  type Producto,
  type Rama,
} from "../components/dp/catalogo";
import { supabaseServidor } from "./supabase";

export type Catalogo = {
  productos: Producto[];
  // Solo las categorías visibles, en orden; las vacías también (el sitio decide si mostrarlas).
  arbol: Rama[];
  origen: "supabase" | "estatico" | "error";
};

// Madres con al menos un producto: las secciones de la portada y el menú.
export type Menu = Array<{ slug: string; nombre: string }>;

export const menuDe = ({ arbol, productos }: Pick<Catalogo, "arbol" | "productos">): Menu =>
  arbol
    .filter((m) => productos.some((p) => p.madre.id === m.id))
    .map((m) => ({ slug: m.slug, nombre: m.nombre }));

const soloVisibles = (categorias: Categoria[]) => categorias.filter((c) => c.visible);

// Catálogo publicado. Sin Supabase configurado usa los 10 equipos de siempre;
// si la base falla, devuelve vacío (y la portada lo avisa) en vez de mostrar
// productos que quizás ya no existen.
export async function leerCatalogoPublicado(): Promise<Catalogo> {
  const sb = supabaseServidor();
  if (!sb) {
    return { productos: CATALOGO_ESTATICO, arbol: armarArbol(CATEGORIAS_ESTATICAS), origen: "estatico" };
  }

  const [cats, prods] = await Promise.all([
    sb.from("categorias").select(SELECT_CATEGORIA).returns<FilaCategoria[]>(),
    sb.from("productos").select(SELECT_PRODUCTO).eq("publicado", true).returns<FilaProducto[]>(),
  ]);

  const error = cats.error ?? prods.error;
  if (error || !cats.data || !prods.data) {
    console.error("No se pudo leer el catálogo:", error?.message);
    return { productos: [], arbol: [], origen: "error" };
  }
  const categorias = soloVisibles(cats.data.map(desdeFilaCategoria));
  return {
    productos: ordenarCatalogo(desdeFilas(prods.data, categorias)),
    arbol: armarArbol(categorias),
    origen: "supabase",
  };
}

export const obtenerCatalogo = createServerFn({ method: "GET" }).handler(async () => {
  const catalogo = await leerCatalogoPublicado();
  return { ...catalogo, menu: menuDe(catalogo) };
});

export type FichaProducto = { producto: Producto; relacionados: Producto[]; menu: Menu };

// Un producto por su URL. Si el nombre cambió desde que se compartió el enlace,
// redirige (301) a la URL actual; si no existe o no está publicado, 404.
export const obtenerProducto = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }): Promise<FichaProducto> => {
    const catalogo = await leerCatalogoPublicado();
    const { productos } = catalogo;
    const producto = productos.find((p) => coincideHuella(p, slug));
    if (!producto) throw notFound();
    const actual = slugProducto(producto);
    if (actual !== slug) {
      throw redirect({ to: "/producto/$slug", params: { slug: actual }, statusCode: 301 });
    }
    const relacionados = productos
      .filter((p) => p.id !== producto.id && p.categoria.id === producto.categoria.id)
      .slice(0, 4);
    return { producto, relacionados, menu: menuDe(catalogo) };
  });

export type PaginaCategoria = {
  madre: Rama;
  // null en la página de la madre (/pesca).
  sub: Categoria | null;
  productos: Producto[];
  // Subcategorías de la madre con productos, para saltar entre ellas.
  hermanas: Array<{ slug: string; nombre: string; cantidad: number }>;
  menu: Menu;
};

// /pesca o /pesca/canas. 404 si la categoría no existe o está oculta.
export const obtenerCategoria = createServerFn({ method: "GET" })
  .inputValidator((d: { madre: string; sub?: string }) => d)
  .handler(async ({ data }): Promise<PaginaCategoria> => {
    const catalogo = await leerCatalogoPublicado();
    const madre = catalogo.arbol.find((m) => m.slug === data.madre);
    if (!madre) throw notFound();
    const sub = data.sub ? madre.hijas.find((h) => h.slug === data.sub) : null;
    if (sub === undefined) throw notFound();
    const productos = catalogo.productos.filter((p) =>
      sub ? p.categoria.id === sub.id : p.madre.id === madre.id,
    );
    const hermanas = madre.hijas
      .map((h) => ({
        slug: h.slug,
        nombre: h.nombre,
        cantidad: catalogo.productos.filter((p) => p.categoria.id === h.id).length,
      }))
      .filter((h) => h.cantidad > 0);
    return { madre, sub, productos, hermanas, menu: menuDe(catalogo) };
  });
