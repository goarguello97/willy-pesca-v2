// Datos reales del negocio, tomados de su Instagram (@willypesca_camping).
// El catálogo de productos vive en Supabase (ver catalogo.ts).

export const NEGOCIO = {
  nombre: "Willy Pesca y Camping",
  nombreCorto: "Willy Pesca",
  // Mismo número que el enlace de la bio de Instagram (wa.me/+543571609758).
  whatsapp: "543571609758",
  whatsappVisible: "+54 3571 60-9758",
  instagram: "willypesca_camping",
  localidad: "Los Cóndores",
  zona: "Calamuchita",
  provincia: "Córdoba",
  codigoPostal: "X5191",
  lat: -32.321167,
  lon: -64.280667,
} as const;

export function enlaceWhatsapp(mensaje?: string): string {
  const base = `https://wa.me/${NEGOCIO.whatsapp}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}

export const ENLACE_INSTAGRAM = `https://www.instagram.com/${NEGOCIO.instagram}/`;

export const ENLACE_COMO_LLEGAR = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${NEGOCIO.localidad}, ${NEGOCIO.provincia}, Argentina`,
)}`;

export const MAPA_EMBED =
  "https://www.openstreetmap.org/export/embed.html?bbox=-64.335%2C-32.352%2C-64.226%2C-32.29&layer=mapnik&marker=-32.321167%2C-64.280667";

