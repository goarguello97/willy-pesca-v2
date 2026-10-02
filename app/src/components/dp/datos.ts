// Datos reales del negocio, tomados de su Instagram (@willypesca_camping).
// Los precios no se publican: cambian seguido y se consultan por WhatsApp.

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

export type Categoria = "reel" | "cana";

export type Producto = {
  id: string;
  categoria: Categoria;
  marca: string;
  modelo: string;
  ficha: string[];
  foto: string;
  alt: string;
};

export const PRODUCTOS: Producto[] = [
  {
    id: "spinit-sb-301",
    categoria: "reel",
    marca: "Spinit",
    modelo: "SB 301",
    ficha: ["1 rulemán", "frontal"],
    foto: "/assets/fotos/reel-spinit-sb301.jpg",
    alt: "Reel Spinit SB 301 plateado sobre su caja",
  },
  {
    id: "mystix-lake-4003",
    categoria: "reel",
    marca: "Mystix",
    modelo: "Lake 4003",
    ficha: ["3 rulemanes", "frontal"],
    foto: "/assets/fotos/reel-mystix-lake.jpg",
    alt: "Reel Mystix Lake 4003 azul y negro sobre su caja",
  },
  {
    id: "albatros-siberiano-500",
    categoria: "reel",
    marca: "Albatros",
    modelo: "Siberiano 500",
    ficha: ["2 rulemanes", "frontal"],
    foto: "/assets/fotos/reel-albatros-seriano.jpg",
    alt: "Reel Albatros Siberiano 500 plateado y azul sobre su caja",
  },
  {
    id: "spinit-lbr-402",
    categoria: "reel",
    marca: "Spinit",
    modelo: "LBR 402",
    ficha: ["2 rulemanes", "frontal"],
    foto: "/assets/fotos/reel-spinit-rul2.jpg",
    alt: "Reel Spinit LBR 402 negro y rojo sobre su caja",
  },
  {
    id: "albatros-ares-5000",
    categoria: "reel",
    marca: "Albatros",
    modelo: "Ares 5000",
    ficha: ["2 rulemanes", "frontal"],
    foto: "/assets/fotos/reel-albatros-rul2.jpg",
    alt: "Reel Albatros Ares 5000 blanco con manija roja sobre su caja",
  },
  {
    id: "okuma-telescopica-180",
    categoria: "cana",
    marca: "Okuma",
    modelo: "Telescópica",
    ficha: ["1,80 m", "telescópica"],
    foto: "/assets/fotos/cana-okuma-telescopica.jpg",
    alt: "Caña telescópica Okuma de 1,80 m con puntera fluo sobre fieltro azul",
  },
  {
    id: "spinit-telescopica-240",
    categoria: "cana",
    marca: "Spinit",
    modelo: "Telescópica",
    ficha: ["2,40 m", "telescópica"],
    foto: "/assets/fotos/cana-spinit-telescopica.jpg",
    alt: "Caña telescópica Spinit de 2,40 m sobre fieltro azul",
  },
  {
    id: "xfish-270",
    categoria: "cana",
    marca: "Xfish",
    modelo: "Dos tramos",
    ficha: ["2,70 m", "2 tramos"],
    foto: "/assets/fotos/cana-xfish.jpg",
    alt: "Caña Xfish de dos tramos de 2,70 m sobre fieltro azul",
  },
  {
    id: "spinit-240",
    categoria: "cana",
    marca: "Spinit",
    modelo: "Dos tramos",
    ficha: ["2,40 m", "2 tramos"],
    foto: "/assets/fotos/cana-spinit-2tramos.jpg",
    alt: "Caña Spinit de dos tramos de 2,40 m sobre fieltro azul",
  },
  {
    id: "waterdog-240",
    categoria: "cana",
    marca: "Waterdog",
    modelo: "Dos tramos",
    ficha: ["2,40 m", "2 tramos"],
    foto: "/assets/fotos/cana-waterdog.jpg",
    alt: "Caña Waterdog de dos tramos de 2,40 m sobre fieltro azul",
  },
];

export const NOMBRE_CATEGORIA: Record<Categoria, string> = {
  reel: "Reel",
  cana: "Caña",
};

export function mensajeConsulta(p: Producto): string {
  return `Hola Willy, quiero consultar precio y stock: ${NOMBRE_CATEGORIA[p.categoria]} ${p.marca} ${p.modelo} (${p.ficha[0]}).`;
}
