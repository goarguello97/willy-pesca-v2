import type { AnchoImagen } from "../../lib/anchos-imagen";

// Modelo del catálogo: lo que guarda Supabase (tablas categorias, productos y
// producto_imagenes) y cómo se muestra en la portada, las páginas y el panel.

// ── Categorías: madre (Pesca) → subcategoría (Cañas) ──────────────────────
export type Ficha = "reel" | "cana";

export type Categoria = {
  id: string;
  padreId: string | null;
  nombre: string;
  singular: string | null;
  slug: string;
  descripcion: string | null;
  ficha: Ficha | null;
  orden: number;
  visible: boolean;
};

export const SELECT_CATEGORIA = "id, padre_id, nombre, singular, slug, descripcion, ficha, orden, visible";

export type FilaCategoria = {
  id: string;
  padre_id: string | null;
  nombre: string;
  singular: string | null;
  slug: string;
  descripcion: string | null;
  ficha: Ficha | null;
  orden: number;
  visible: boolean;
};

export const desdeFilaCategoria = (f: FilaCategoria): Categoria => ({
  id: f.id,
  padreId: f.padre_id,
  nombre: f.nombre,
  singular: f.singular,
  slug: f.slug,
  descripcion: f.descripcion,
  ficha: f.ficha,
  orden: f.orden,
  visible: f.visible,
});

// Una madre con sus subcategorías, cada nivel en el orden que eligió Willy.
export type Rama = Categoria & { hijas: Categoria[] };

const porOrden = (a: Categoria, b: Categoria) =>
  a.orden - b.orden || a.nombre.localeCompare(b.nombre, "es");

export function armarArbol(categorias: Categoria[]): Rama[] {
  return categorias
    .filter((c) => c.padreId === null)
    .sort(porOrden)
    .map((m) => ({ ...m, hijas: categorias.filter((c) => c.padreId === m.id).sort(porOrden) }));
}

// Direcciones del sitio que una categoría madre no puede tomar (la base
// también las rechaza).
export const SLUGS_RESERVADOS = [
  "admin",
  "producto",
  "assets",
  "api",
  "inicio",
  "catalogo",
  "buscar",
  "como-comprar",
  "ubicacion",
];

// Lo que cada producto lleva de su subcategoría y de la madre.
export type RefCategoria = Pick<Categoria, "id" | "nombre" | "singular" | "slug" | "ficha" | "orden">;

const aRef = (c: Categoria): RefCategoria => ({
  id: c.id,
  nombre: c.nombre,
  singular: c.singular,
  slug: c.slug,
  ficha: c.ficha,
  orden: c.orden,
});

export const urlCategoria = (madre: Pick<Categoria, "slug">, sub?: Pick<Categoria, "slug"> | null) =>
  sub ? `/${madre.slug}/${sub.slug}` : `/${madre.slug}`;

// ── Productos ─────────────────────────────────────────────────────────────
export type Imagen = { id: string; url: string; ruta: string | null; orden: number };

export type Producto = {
  id: string;
  categoria: RefCategoria;
  madre: RefCategoria;
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
  actualizadoEn: string;
  imagenes: Imagen[];
};

// Columnas que se piden a Supabase, con las fotos ordenadas.
export const SELECT_PRODUCTO =
  "id, categoria_id, marca, nombre, precio, descripcion, reel_tipo, rulemanes, largo_m, cana_armado, destacado, publicado, creado_en, actualizado_en, producto_imagenes(id, url, ruta, orden)";

export type FilaProducto = {
  id: string;
  categoria_id: string;
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
  actualizado_en: string;
  producto_imagenes: Imagen[] | null;
};

const aNumero = (v: number | string | null): number | null =>
  v === null || v === "" ? null : Number(v);

// Null si la subcategoría o su madre no están entre las categorías dadas: así
// los productos de una categoría oculta no salen en el sitio.
export function desdeFila(f: FilaProducto, categorias: Categoria[]): Producto | null {
  const sub = categorias.find((c) => c.id === f.categoria_id);
  const madre = sub && categorias.find((c) => c.id === sub.padreId);
  if (!sub || !madre) return null;
  return {
    id: f.id,
    categoria: aRef(sub),
    madre: aRef(madre),
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
    actualizadoEn: f.actualizado_en,
    imagenes: [...(f.producto_imagenes ?? [])].sort((a, b) => a.orden - b.orden),
  };
}

export const desdeFilas = (filas: FilaProducto[], categorias: Categoria[]): Producto[] =>
  filas.flatMap((f) => desdeFila(f, categorias) ?? []);

// URL de cada producto: texto legible + una huella corta del id. La huella hace
// la URL única y permite encontrar el producto aunque después cambie el nombre
// (la página redirige a la URL nueva).
export const aSlug = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function huella(id: string): string {
  let h = 5381;
  for (const c of id) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0;
  return h.toString(36).padStart(6, "0").slice(-6);
}

export function slugProducto(p: Producto): string {
  const largo = p.categoria.ficha === "cana" && p.largoM !== null ? formatearLargo(p.largoM) : null;
  const texto = aSlug([p.categoria.singular, p.marca, p.nombre, largo].filter(Boolean).join(" "));
  return `${texto}-${huella(p.id)}`;
}

export const huellaDeSlug = (slug: string) => slug.slice(slug.lastIndexOf("-") + 1);

export const coincideHuella = (p: Producto, slug: string) => huella(p.id) === huellaDeSlug(slug);

export const urlProducto = (p: Producto) => `/producto/${slugProducto(p)}`;

// Página de la subcategoría de un producto.
export const seccionDeProducto = (p: Producto) => urlCategoria(p.madre, p.categoria);

// En Vercel las fotos pasan por su optimizador: tamaño justo y AVIF/WebP.
type Ancho = AnchoImagen;
const OPTIMIZAR = import.meta.env.VITE_IMAGENES_VERCEL === "1";

export const imagen = (url: string, ancho: Ancho, calidad = 75): string =>
  OPTIMIZAR ? `/_vercel/image?url=${encodeURIComponent(url)}&w=${ancho}&q=${calidad}` : url;

export const srcsetImagen = (url: string, anchos: Ancho[]): string | undefined =>
  OPTIMIZAR ? anchos.map((w) => `${imagen(url, w)} ${w}w`).join(", ") : undefined;

// En el orden de las categorías (madre y después subcategoría); dentro de cada
// una, lo más nuevo primero.
export function ordenarCatalogo(productos: Producto[]): Producto[] {
  return [...productos].sort(
    (a, b) =>
      a.madre.orden - b.madre.orden ||
      a.madre.nombre.localeCompare(b.madre.nombre, "es") ||
      a.categoria.orden - b.categoria.orden ||
      a.categoria.nombre.localeCompare(b.categoria.nombre, "es") ||
      b.creadoEn.localeCompare(a.creadoEn),
  );
}

export const tituloProducto = (p: Producto) => [p.marca, p.nombre].filter(Boolean).join(" ");

export const fotoPrincipal = (p: Producto): string | null => p.imagenes[0]?.url ?? null;

// "Caña Okuma Telescópica"; sin singular, solo marca y modelo.
export const textoAlternativo = (p: Producto) =>
  [p.categoria.singular, tituloProducto(p)].filter(Boolean).join(" ");

// "Pesca › Cañas"
export const rutaCategoria = (p: Producto) => `${p.madre.nombre} › ${p.categoria.nombre}`;

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
  if (p.categoria.ficha === "reel") {
    return [
      { dato: "Tipo", valor: p.reelTipo ?? "Sin dato" },
      { dato: "Rulemanes", valor: p.rulemanes === null ? "Sin dato" : String(p.rulemanes) },
    ];
  }
  if (p.categoria.ficha === "cana") {
    return [
      { dato: "Armado", valor: p.canaArmado ?? "Sin dato" },
      { dato: "Largo", valor: p.largoM === null ? "Sin dato" : formatearLargo(p.largoM) },
    ];
  }
  return [
    { dato: "Categoría", valor: p.categoria.nombre },
    { dato: "Precio", valor: formatearPrecio(p.precio) ?? "Consultar" },
  ];
}

// Datos técnicos que se listan en la página del producto (y en su JSON-LD).
export function filasFicha(p: Producto): Array<{ dato: string; valor: string }> {
  const filas = [{ dato: "Categoría", valor: rutaCategoria(p) }];
  if (p.marca) filas.push({ dato: "Marca", valor: p.marca });
  if (p.categoria.ficha === "reel") {
    if (p.reelTipo) filas.push({ dato: "Tipo", valor: p.reelTipo });
    if (p.rulemanes !== null) filas.push({ dato: "Rulemanes", valor: String(p.rulemanes) });
  }
  if (p.categoria.ficha === "cana") {
    if (p.largoM !== null) filas.push({ dato: "Largo", valor: formatearLargo(p.largoM) });
    if (p.canaArmado) filas.push({ dato: "Armado", valor: p.canaArmado });
  }
  return filas;
}

export function mensajeConsulta(p: Producto): string {
  const nombre = textoAlternativo(p);
  const precio = formatearPrecio(p.precio);
  return precio
    ? `Hola Willy, quiero consultar stock: ${nombre} (${precio}).`
    : `Hola Willy, quiero consultar precio y stock: ${nombre}.`;
}

// ── Respaldo sin Supabase ─────────────────────────────────────────────────
// Las mismas categorías que carga supabase/03_categorias.sql y los 10 equipos
// de supabase/02_datos_iniciales.sql.
type SemillaCategoria = { slug: string; nombre: string; singular?: string; ficha?: Ficha; descripcion?: string };

const MADRES_ESTATICAS: Array<SemillaCategoria & { hijas: SemillaCategoria[] }> = [
  {
    slug: "pesca",
    nombre: "Pesca",
    descripcion: "Reels, cañas y accesorios de pesca para cualquier especie y cualquier salida.",
    hijas: [
      { slug: "reels", nombre: "Reels", singular: "Reel", ficha: "reel" },
      { slug: "canas", nombre: "Cañas", singular: "Caña", ficha: "cana" },
      { slug: "senuelos", nombre: "Señuelos", singular: "Señuelo" },
      { slug: "lineas-y-tanzas", nombre: "Líneas y tanzas" },
      { slug: "anzuelos-y-plomadas", nombre: "Anzuelos y plomadas" },
      { slug: "accesorios", nombre: "Accesorios", singular: "Accesorio" },
      { slug: "varios", nombre: "Varios" },
    ],
  },
  {
    slug: "camping",
    nombre: "Camping",
    descripcion: "Todo para acampar y completar la salida de pesca.",
    hijas: [
      { slug: "carpas", nombre: "Carpas", singular: "Carpa" },
      { slug: "reposeras", nombre: "Reposeras", singular: "Reposera" },
      { slug: "mesas", nombre: "Mesas", singular: "Mesa" },
      { slug: "gazebos", nombre: "Gazebos", singular: "Gazebo" },
      { slug: "bolsas-de-dormir", nombre: "Bolsas de dormir", singular: "Bolsa de dormir" },
      { slug: "conservadoras", nombre: "Conservadoras", singular: "Conservadora" },
      { slug: "iluminacion", nombre: "Iluminación" },
      { slug: "varios", nombre: "Varios" },
    ],
  },
];

const categoriaEstatica = (s: SemillaCategoria, orden: number, padreId: string | null): Categoria => ({
  id: padreId ? `${padreId}-${s.slug}` : `estatico-${s.slug}`,
  padreId,
  nombre: s.nombre,
  singular: s.singular ?? null,
  slug: s.slug,
  descripcion: s.descripcion ?? null,
  ficha: s.ficha ?? null,
  orden,
  visible: true,
});

export const CATEGORIAS_ESTATICAS: Categoria[] = MADRES_ESTATICAS.flatMap((m, i) => {
  const madre = categoriaEstatica(m, i + 1, null);
  return [madre, ...m.hijas.map((h, j) => categoriaEstatica(h, j + 1, madre.id))];
});

type Semilla = Pick<Producto, "marca" | "nombre"> &
  Partial<Pick<Producto, "reelTipo" | "rulemanes" | "largoM" | "canaArmado">> & { sub: string; foto: string };

const SEMILLAS: Semilla[] = [
  { sub: "reels", marca: "Spinit", nombre: "SB 301", reelTipo: "frontal", rulemanes: 1, foto: "reel-spinit-sb301" },
  { sub: "reels", marca: "Mystix", nombre: "Lake 4003", reelTipo: "frontal", rulemanes: 3, foto: "reel-mystix-lake" },
  { sub: "reels", marca: "Albatros", nombre: "Siberiano 500", reelTipo: "frontal", rulemanes: 2, foto: "reel-albatros-seriano" },
  { sub: "reels", marca: "Spinit", nombre: "LBR 402", reelTipo: "frontal", rulemanes: 2, foto: "reel-spinit-rul2" },
  { sub: "reels", marca: "Albatros", nombre: "Ares 5000", reelTipo: "frontal", rulemanes: 2, foto: "reel-albatros-rul2" },
  { sub: "canas", marca: "Okuma", nombre: "Telescópica", largoM: 1.8, canaArmado: "telescópica", foto: "cana-okuma-telescopica" },
  { sub: "canas", marca: "Spinit", nombre: "Telescópica", largoM: 2.4, canaArmado: "telescópica", foto: "cana-spinit-telescopica" },
  { sub: "canas", marca: "Xfish", nombre: "Dos tramos", largoM: 2.7, canaArmado: "2 tramos", foto: "cana-xfish" },
  { sub: "canas", marca: "Spinit", nombre: "Dos tramos", largoM: 2.4, canaArmado: "2 tramos", foto: "cana-spinit-2tramos" },
  { sub: "canas", marca: "Waterdog", nombre: "Dos tramos", largoM: 2.4, canaArmado: "2 tramos", foto: "cana-waterdog" },
];

export const CATALOGO_ESTATICO: Producto[] = desdeFilas(
  SEMILLAS.map((s, i) => ({
    id: `estatico-${s.foto}`,
    categoria_id: `estatico-pesca-${s.sub}`,
    marca: s.marca,
    nombre: s.nombre,
    precio: null,
    descripcion: null,
    reel_tipo: s.reelTipo ?? null,
    rulemanes: s.rulemanes ?? null,
    largo_m: s.largoM ?? null,
    cana_armado: s.canaArmado ?? null,
    destacado: true,
    publicado: true,
    creado_en: new Date(Date.UTC(2026, 0, 1, 0, 0, SEMILLAS.length - i)).toISOString(),
    actualizado_en: new Date(Date.UTC(2026, 0, 1)).toISOString(),
    producto_imagenes: [{ id: `foto-${s.foto}`, url: `/assets/fotos/${s.foto}.jpg`, ruta: null, orden: 0 }],
  })),
  CATEGORIAS_ESTATICAS,
);
