// Datos estructurados (JSON-LD) y descripciones para buscadores. TanStack los
// inserta con meta { "script:ld+json": ... } y se encarga de escaparlos.
import {
  NOMBRE_CATEGORIA,
  filasFicha,
  formatearPrecio,
  fotoPrincipal,
  textoAlternativo,
  urlProducto,
  type Producto,
} from "../components/dp/catalogo";
import { ENLACE_INSTAGRAM, NEGOCIO } from "../components/dp/datos";
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
      "Casa de pesca y camping en Los Cóndores, Calamuchita: reels, cañas y accesorios, taller de reparación de cañas y parrillas a pedido.",
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
    makesOffer: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Reparación de cañas de pescar" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Parrillas a pedido" } },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Equipos de pesca",
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
    category: NOMBRE_CATEGORIA[p.categoria],
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

export function ldMigas(p: Producto) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Equipos", item: `${SITE_URL}/#comparador` },
      { "@type": "ListItem", position: 3, name: textoAlternativo(p), item: absoluta(urlProducto(p)) },
    ],
  };
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
