import {
  ENLACE_COMO_LLEGAR,
  ENLACE_INSTAGRAM,
  MAPA_EMBED,
  NEGOCIO,
  enlaceWhatsapp,
} from "./datos";
import { LogoWilly } from "./logo-willy";
import { Flecha, GlifoInstagram, GlifoWhatsapp } from "./marca";

const ANCLAS = [
  { href: "#comparador", texto: "Equipos" },
  { href: "#taller", texto: "Taller" },
  { href: "#parrillas", texto: "Parrillas" },
  { href: "#ubicacion", texto: "Ubicación" },
];

export function Encabezado() {
  return (
    <header className="sticky top-0 z-40 bg-tinta text-white">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-6 px-4 md:px-8">
        <a href="#inicio" className="flex items-center gap-2.5" aria-label="Willy Pesca y Camping, inicio">
          <LogoWilly variante="icono" figura="#ffffff" fondo="#0c1424" className="h-10 w-auto" />
          <span className="cond hidden text-2xl leading-none sm:inline">Willy Pesca</span>
        </a>
        <nav aria-label="Secciones" className="hidden lg:block">
          <ul className="flex gap-9 text-[15px] font-medium">
            {ANCLAS.map((a) => (
              <li key={a.href}>
                <a href={a.href} className="ancla-dp">
                  {a.texto}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a
          href={enlaceWhatsapp("Hola Willy, te escribo desde la web.")}
          target="_blank"
          rel="noopener noreferrer"
          className="cta-encabezado text-[15px]"
        >
          <GlifoWhatsapp className="h-4 w-4" />
          Escribinos
        </a>
      </div>
    </header>
  );
}

export function Parrillas() {
  return (
    <section id="parrillas" aria-labelledby="titulo-parrillas" className="banda-dp scroll-mt-16">
      <img
        src="/assets/fotos/parrilla-sierras.jpg"
        alt="Parrilla de hierro sobre piso de piedra frente a las sierras"
        width={640}
        height={492}
        loading="lazy"
        decoding="async"
        className="banda-dp__foto"
      />
      <div className="banda-dp__velo" aria-hidden="true" />
      <div className="relative mx-auto flex min-h-[460px] max-w-[1280px] items-center px-4 py-16 md:min-h-[520px] md:px-8">
        <div className="max-w-[480px]">
          <h2 id="titulo-parrillas" className="cond text-5xl leading-[0.9] md:text-7xl">
            Parrillas a pedido.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/85">
            Se fabrican únicamente a pedido. Pasanos la medida de tu patio o tu camping.
          </p>
          <a
            href={enlaceWhatsapp("Hola Willy, quiero consultar por una parrilla a pedido.")}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-parrilla-dp mt-8"
          >
            Pedir parrilla
          </a>
        </div>
      </div>
    </section>
  );
}

export function Ubicacion() {
  return (
    <section id="ubicacion" aria-labelledby="titulo-ubicacion" className="scroll-mt-16">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-12 lg:gap-16">
        <div className="mapa-dp lg:col-span-7">
          <iframe
            title={`Mapa de ${NEGOCIO.localidad}, ${NEGOCIO.provincia}`}
            src={MAPA_EMBED}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="lg:col-span-5">
          <h2 id="titulo-ubicacion" className="cond text-5xl leading-[0.9] md:text-7xl">
            Los Cóndores, Córdoba.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gris">
            Antes de venir, escribinos y coordinamos el horario.
          </p>
          <dl className="ficha-datos mt-10">
            <div>
              <dt className="font-dpmono text-xs text-gris">Zona</dt>
              <dd className="text-lg">
                {NEGOCIO.localidad}, {NEGOCIO.zona}
              </dd>
            </div>
            <div>
              <dt className="font-dpmono text-xs text-gris">WhatsApp</dt>
              <dd>
                <a href={enlaceWhatsapp()} target="_blank" rel="noopener noreferrer" className="dato-dp text-lg">
                  <GlifoWhatsapp className="h-4 w-4" />
                  {NEGOCIO.whatsappVisible}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-dpmono text-xs text-gris">Instagram</dt>
              <dd>
                <a href={ENLACE_INSTAGRAM} target="_blank" rel="noopener noreferrer" className="dato-dp text-lg">
                  <GlifoInstagram className="h-4 w-4" />@{NEGOCIO.instagram}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-dpmono text-xs text-gris">Horarios</dt>
              <dd className="text-lg">A convenir por WhatsApp</dd>
            </div>
          </dl>
          <a
            href={ENLACE_COMO_LLEGAR}
            target="_blank"
            rel="noopener noreferrer"
            className="como-llegar-dp mt-10"
          >
            Cómo llegar
            <Flecha className="h-4 w-4" rotar={-45} />
          </a>
        </div>
      </div>
    </section>
  );
}

export function Pie() {
  return (
    <footer className="pie-dp bg-tinta text-white">
      <div className="mx-auto max-w-[1280px] px-4 pb-10 pt-16 md:px-8 md:pt-20">
        <LogoWilly
          figura="#ffffff"
          fondo="#0c1424"
          titulo="Willy Pesca y Camping"
          className="h-auto w-full max-w-[620px]"
        />
        <div className="mt-12 flex flex-col gap-6 border-t border-white/15 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-white/70">
            Pesca y camping en {NEGOCIO.localidad}, {NEGOCIO.provincia}. © 2026
          </p>
          <ul className="flex gap-6 font-dpmono text-sm">
            <li>
              <a href={enlaceWhatsapp()} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </li>
            <li>
              <a href={ENLACE_INSTAGRAM} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            </li>
            <li>
              <a href="#inicio">Volver arriba</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
