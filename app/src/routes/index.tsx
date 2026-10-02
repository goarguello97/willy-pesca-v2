import { createFileRoute } from "@tanstack/react-router";
import { StructuredData } from "../components/StructuredData";
import { Comparador } from "../components/dp/comparador";
import { ENLACE_INSTAGRAM, NEGOCIO } from "../components/dp/datos";
import { Encabezado, Parrillas, Pie, Ubicacion } from "../components/dp/secciones";
import { Taller } from "../components/dp/taller";
import { Vitrina } from "../components/dp/vitrina";

export const Route = createFileRoute("/")({
  // El título y la descripción salen de app-meta.json (ruta raíz).
  component: Index,
});

const NEGOCIO_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "SportingGoodsStore",
  name: NEGOCIO.nombre,
  url: "https://willy-pesca-deportivo.higgsfield.app/",
  image: "https://willy-pesca-deportivo.higgsfield.app/assets/fotos/reel-spinit-sb301.jpg",
  telephone: `+${NEGOCIO.whatsapp}`,
  description: "Venta de reels y cañas de pesca, taller de reparación de cañas y parrillas a pedido.",
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
});

function Index() {
  return (
    <>
      <StructuredData json={NEGOCIO_LD} />
      <a
        href="#comparador"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-cobalto focus:px-4 focus:py-2 focus:text-white"
      >
        Saltar al comparador
      </a>
      <Encabezado />
      <main>
        <Vitrina />
        <Comparador />
        <Taller />
        <Parrillas />
        <Ubicacion />
      </main>
      <Pie />
    </>
  );
}
