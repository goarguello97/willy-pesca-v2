// Datos estructurados (JSON-LD) y descripciones para buscadores. TanStack los
// inserta con meta { "script:ld+json": ... } y se encarga de escaparlos.
import {
  filasFicha,
  formatearPrecio,
  fotoPrincipal,
  textoAlternativo,
  urlCategoria,
  urlProducto,
  type Categoria,
  type Producto,
} from "../components/dp/catalogo";
import { ENLACE_INSTAGRAM, NEGOCIO } from "../components/dp/datos";
import type { PaginaCategoria } from "./catalogo.functions";
import { SITE_URL } from "./sitio";

export const absoluta = (url: string) => (url.startsWith("/") ? `${SITE_URL}${url}` : url);

const ID_NEGOCIO = `${SITE_URL}/#negocio`;

export function ldNegocio(productos: Producto[]) {
  return {
    "@context": "https://schema.org",
    "@type": "SportingGoodsStore",
    "@id": ID_NEGOCIO,
    name: NEGOCIO.nombre,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/icon-512.png`,
    image: `${SITE_URL}/og.png`,
    telephone: `+${NEGOCIO.whatsapp}`,
    description:
      "Casa de pesca y camping en Los Cóndores, Calamuchita: reels, cañas y accesorios de pesca.",
    address: {
      "@type": "PostalAddress",
      addressLocality: NEGOCIO.localidad,
      addressRegion: NEGOCIO.provincia,
      postalCode: NEGOCIO.codigoPostal,
      addressCountry: "AR",
    },
    geo: { "@type": "GeoCoordinates", latitude: NEGOCIO.lat, longitude: NEGOCIO.lon },
    areaServed: "Calamuchita, Córdoba",
    sameAs: [ENLACE_INSTAGRAM],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Pesca y camping",
      itemListElement: productos.map((p) => {
        const foto = fotoPrincipal(p);
        return {
          "@type": "Offer",
          itemOffered: {
            "@type": "Product",
            name: textoAlternativo(p),
            url: absoluta(urlProducto(p)),
            ...(foto ? { image: absoluta(foto) } : {}),
          },
          ...(p.precio !== null ? { price: p.precio, priceCurrency: "ARS" } : {}),
        };
      }),
    },
  };
}

export function ldProducto(p: Producto) {
  const url = absoluta(urlProducto(p));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: textoAlternativo(p),
    description: descripcionProducto(p),
    url,
    category: `${p.madre.nombre} > ${p.categoria.nombre}`,
    image: p.imagenes.map((i) => absoluta(i.url)),
    ...(p.marca ? { brand: { "@type": "Brand", name: p.marca } } : {}),
    additionalProperty: filasFicha(p)
      .filter((f) => f.dato !== "Categoría" && f.dato !== "Marca")
      .map((f) => ({ "@type": "PropertyValue", name: f.dato, value: f.valor })),
    ...(p.precio !== null
      ? {
          offers: {
            "@type": "Offer",
            price: p.precio,
            priceCurrency: "ARS",
            url,
            seller: { "@id": ID_NEGOCIO },
          },
        }
      : {}),
  };
}

type Miga = { nombre: string; url: string };

// Migas de pan: Inicio › Pesca › Cañas › producto.
export function ldMigas(migas: Miga[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ nombre: "Inicio", url: "/" }, ...migas].map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: m.nombre,
      item: absoluta(m.url),
    })),
  };
}

export const migasProducto = (p: Producto): Miga[] => [
  { nombre: p.madre.nombre, url: urlCategoria(p.madre) },
  { nombre: p.categoria.nombre, url: urlCategoria(p.madre, p.categoria) },
  { nombre: textoAlternativo(p), url: urlProducto(p) },
];

export const migasCategoria = (madre: Categoria, sub: Categoria | null): Miga[] => [
  { nombre: madre.nombre, url: urlCategoria(madre) },
  ...(sub ? [{ nombre: sub.nombre, url: urlCategoria(madre, sub) }] : []),
];

// Listado de una página de categoría.
export function ldListado(nombre: string, url: string, productos: Producto[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: nombre,
    url: absoluta(url),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: productos.length,
      itemListElement: productos.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluta(urlProducto(p)),
        name: textoAlternativo(p),
      })),
    },
  };
}

// Título y descripción de /pesca y /pesca/canas.
export function textosCategoria(madre: Categoria, sub: Categoria | null, cantidad: number) {
  const zona = "en Los Cóndores, Córdoba";
  const cosa = sub ? `${sub.nombre} de ${madre.nombre.toLowerCase()}` : `Artículos de ${madre.nombre.toLowerCase()}`;
  const propia = (sub ?? madre).descripcion?.trim();
  const descripcion =
    propia ||
    `${cosa} ${zona}: ${cantidad === 1 ? "1 producto" : `${cantidad} productos`} con fotos y ficha. Consultá precio y stock por WhatsApp.`;
  return { titulo: `${cosa} ${zona} | Willy Pesca y Camping`, descripcion };
}

// Descripción para Google y redes: la del producto o una armada con su ficha.
export function descripcionProducto(p: Producto): string {
  if (p.descripcion?.trim()) {
    const d = p.descripcion.trim().replace(/\s+/g, " ");
    return d.length > 158 ? `${d.slice(0, 155).trimEnd()}…` : d;
  }
  const ficha = filasFicha(p)
    .filter((f) => f.dato !== "Categoría" && f.dato !== "Marca")
    .map((f) => `${f.dato.toLowerCase()}: ${f.valor}`)
    .join(", ");
  const precio = formatearPrecio(p.precio);
  return [
    `${textoAlternativo(p)}${ficha ? ` (${ficha})` : ""}.`,
    precio ? `Precio: ${precio}.` : "Consultá precio y stock por WhatsApp.",
    `Willy Pesca y Camping, ${NEGOCIO.localidad}, ${NEGOCIO.provincia}.`,
  ].join(" ");
}

// <head> de /pesca y /pesca/canas. Sin productos no se indexa.
export function headCategoria({ madre, sub, productos }: PaginaCategoria) {
  const url = absoluta(urlCategoria(madre, sub));
  const { titulo, descripcion } = textosCategoria(madre, sub, productos.length);
  return {
    meta: [
      { title: titulo },
      { name: "description", content: descripcion },
      ...(productos.length ? [] : [{ name: "robots", content: "noindex, follow" }]),
      { property: "og:title", content: titulo },
      { property: "og:description", content: descripcion },
      { property: "og:url", content: url },
      { name: "twitter:title", content: titulo },
      { name: "twitter:description", content: descripcion },
      { "script:ld+json": ldMigas(migasCategoria(madre, sub)) },
      { "script:ld+json": ldListado((sub ?? madre).nombre, url, productos) },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
