// Modelo del catálogo: lo que guarda Supabase (tabla productos + producto_imagenes)
// y cómo se muestra en la vitrina, el comparador y el panel.

export type Categoria = "reel" | "cana" | "accesorio" | "camping" | "otro";

export const CATEGORIAS: Array<{ valor: Categoria; singular: string; plural: string }> = [
  { valor: "reel", singular: "Reel", plural: "Reels" },
  { valor: "cana", singular: "Caña", plural: "Cañas" },
  { valor: "accesorio", singular: "Accesorio", plural: "Accesorios" },
  { valor: "camping", singular: "Camping", plural: "Camping" },
  { valor: "otro", singular: "Otro", plural: "Otros" },
];

export const NOMBRE_CATEGORIA = Object.fromEntries(
  CATEGORIAS.map((c) => [c.valor, c.singular]),
) as Record<Categoria, string>;

export type Imagen = { id: string; url: string; ruta: string | null; orden: number };

export type Producto = {
  id: string;
  categoria: Categoria;
  marca: string | null;
  nombre: string;
  precio: number | null;
  descripcion: string | null;
  reelTipo: string | null;
  rulemanes: number | null;
  largoM: number | null;
  canaArmado: string | null;
  destacado: boolean;
  publicado: boolean;
  creadoEn: string;
  imagenes: Imagen[];
};

// Columnas que se piden a Supabase, con las fotos ordenadas.
export const SELECT_PRODUCTO =
  "id, categoria, marca, nombre, precio, descripcion, reel_tipo, rulemanes, largo_m, cana_armado, destacado, publicado, creado_en, producto_imagenes(id, url, ruta, orden)";

export type FilaProducto = {
  id: string;
  categoria: Categoria;
  marca: string | null;
  nombre: string;
  precio: number | string | null;
  descripcion: string | null;
  reel_tipo: string | null;
  rulemanes: number | null;
  largo_m: number | string | null;
  cana_armado: string | null;
  destacado: boolean;
  publicado: boolean;
  creado_en: string;
  producto_imagenes: Imagen[] | null;
};

const aNumero = (v: number | string | null): number | null =>
  v === null || v === "" ? null : Number(v);

export function desdeFila(f: FilaProducto): Producto {
  return {
    id: f.id,
    categoria: f.categoria,
    marca: f.marca,
    nombre: f.nombre,
    precio: aNumero(f.precio),
    descripcion: f.descripcion,
    reelTipo: f.reel_tipo,
    rulemanes: f.rulemanes,
    largoM: aNumero(f.largo_m),
    canaArmado: f.cana_armado,
    destacado: f.destacado,
    publicado: f.publicado,
    creadoEn: f.creado_en,
    imagenes: [...(f.producto_imagenes ?? [])].sort((a, b) => a.orden - b.orden),
  };
}

// Reels primero, después cañas y el resto; dentro de cada categoría, lo más nuevo.
export function ordenarCatalogo(productos: Producto[]): Producto[] {
  const pos = (c: Categoria) => CATEGORIAS.findIndex((x) => x.valor === c);
  return [...productos].sort(
    (a, b) => pos(a.categoria) - pos(b.categoria) || b.creadoEn.localeCompare(a.creadoEn),
  );
}

export const tituloProducto = (p: Producto) => [p.marca, p.nombre].filter(Boolean).join(" ");

export const fotoPrincipal = (p: Producto): string | null => p.imagenes[0]?.url ?? null;

export const textoAlternativo = (p: Producto) =>
  `${NOMBRE_CATEGORIA[p.categoria]} ${tituloProducto(p)}`;

const PESOS = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export const formatearPrecio = (precio: number | null): string | null =>
  precio === null ? null : PESOS.format(precio);

export const formatearLargo = (m: number) =>
  `${m.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m`;

// Dos datos técnicos por producto, para las etiquetas de la vitrina.
export function lecturas(p: Producto): [{ dato: string; valor: string }, { dato: string; valor: string }] {
  if (p.categoria === "reel") {
    return [
      { dato: "Tipo", valor: p.reelTipo ?? "Sin dato" },
      { dato: "Rulemanes", valor: p.rulemanes === null ? "Sin dato" : String(p.rulemanes) },
    ];
  }
  if (p.categoria === "cana") {
    return [
      { dato: "Armado", valor: p.canaArmado ?? "Sin dato" },
      { dato: "Largo", valor: p.largoM === null ? "Sin dato" : formatearLargo(p.largoM) },
    ];
  }
  return [
    { dato: "Categoría", valor: NOMBRE_CATEGORIA[p.categoria] },
    { dato: "Precio", valor: formatearPrecio(p.precio) ?? "Consultar" },
  ];
}

export function mensajeConsulta(p: Producto): string {
  const nombre = `${NOMBRE_CATEGORIA[p.categoria]} ${tituloProducto(p)}`;
  const precio = formatearPrecio(p.precio);
  return precio
    ? `Hola Willy, quiero consultar stock: ${nombre} (${precio}).`
    : `Hola Willy, quiero consultar precio y stock: ${nombre}.`;
}

// Respaldo mientras Supabase no esté configurado: los 10 equipos de siempre,
// iguales a los que carga supabase/02_datos_iniciales.sql.
type Semilla = Pick<Producto, "categoria" | "marca" | "nombre"> &
  Partial<Pick<Producto, "reelTipo" | "rulemanes" | "largoM" | "canaArmado">> & { foto: string };

const SEMILLAS: Semilla[] = [
  { categoria: "reel", marca: "Spinit", nombre: "SB 301", reelTipo: "frontal", rulemanes: 1, foto: "reel-spinit-sb301" },
  { categoria: "reel", marca: "Mystix", nombre: "Lake 4003", reelTipo: "frontal", rulemanes: 3, foto: "reel-mystix-lake" },
  { categoria: "reel", marca: "Albatros", nombre: "Siberiano 500", reelTipo: "frontal", rulemanes: 2, foto: "reel-albatros-seriano" },
  { categoria: "reel", marca: "Spinit", nombre: "LBR 402", reelTipo: "frontal", rulemanes: 2, foto: "reel-spinit-rul2" },
  { categoria: "reel", marca: "Albatros", nombre: "Ares 5000", reelTipo: "frontal", rulemanes: 2, foto: "reel-albatros-rul2" },
  { categoria: "cana", marca: "Okuma", nombre: "Telescópica", largoM: 1.8, canaArmado: "telescópica", foto: "cana-okuma-telescopica" },
  { categoria: "cana", marca: "Spinit", nombre: "Telescópica", largoM: 2.4, canaArmado: "telescópica", foto: "cana-spinit-telescopica" },
  { categoria: "cana", marca: "Xfish", nombre: "Dos tramos", largoM: 2.7, canaArmado: "2 tramos", foto: "cana-xfish" },
  { categoria: "cana", marca: "Spinit", nombre: "Dos tramos", largoM: 2.4, canaArmado: "2 tramos", foto: "cana-spinit-2tramos" },
  { categoria: "cana", marca: "Waterdog", nombre: "Dos tramos", largoM: 2.4, canaArmado: "2 tramos", foto: "cana-waterdog" },
];

export const CATALOGO_ESTATICO: Producto[] = SEMILLAS.map((s, i) => ({
  id: `estatico-${s.foto}`,
  categoria: s.categoria,
  marca: s.marca,
  nombre: s.nombre,
  precio: null,
  descripcion: null,
  reelTipo: s.reelTipo ?? null,
  rulemanes: s.rulemanes ?? null,
  largoM: s.largoM ?? null,
  canaArmado: s.canaArmado ?? null,
  destacado: true,
  publicado: true,
  creadoEn: new Date(Date.UTC(2026, 0, 1, 0, 0, SEMILLAS.length - i)).toISOString(),
  imagenes: [{ id: `foto-${s.foto}`, url: `/assets/fotos/${s.foto}.jpg`, ruta: null, orden: 0 }],
}));
