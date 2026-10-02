import {
  ENLACE_COMO_LLEGAR,
  ENLACE_INSTAGRAM,
  MAPA_EMBED,
  NEGOCIO,
  enlaceWhatsapp,
} from "./datos";
import { LogoWilly } from "./logo-willy";
import { Flecha, GlifoInstagram, GlifoWhatsapp } from "./marca";

// Crédito de diseño del sitio.
const LINKEDIN_AUTOR = "https://www.linkedin.com/in/gonzalo-arg%C3%BCello/";

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
        <a
          href="#inicio"
          className="flex min-w-0 items-center gap-2.5"
          aria-label="Willy Pesca y Camping, inicio"
        >
          <LogoWilly
            variante="icono"
            figura="#ffffff"
            fondo="#0c1424"
            className="h-8 w-auto shrink-0 sm:h-10"
          />
          <span className="cond truncate text-lg leading-none sm:text-2xl">Willy Pesca y Camping</span>
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
          aria-label="Escribinos por WhatsApp"
          className="cta-encabezado shrink-0 text-[15px] max-sm:h-10 max-sm:w-10 max-sm:justify-center max-sm:border max-sm:border-white/25 max-sm:bg-none"
        >
          <GlifoWhatsapp className="h-4 w-4" />
          <span className="hidden sm:inline">Escribinos</span>
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
            Parrillas a pedido
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/85">
            Se fabrican únicamente a pedido. Pasanos la medida de tu asador o la de la parrilla que
            querés.
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
            Los Cóndores, Córdoba
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
      <div className="mx-auto flex max-w-[1280px] flex-col items-center px-4 pb-10 pt-16 text-center md:px-8 md:pt-20">
        <LogoWilly
          centrado
          figura="#ffffff"
          fondo="#0c1424"
          titulo="Willy Pesca y Camping"
          className="h-auto w-[260px] md:w-[320px]"
        />
        <p className="mt-6 max-w-[40ch] text-sm leading-relaxed text-white/70">
          Reels, cañas, taller y parrillas a pedido en{" "}
          <span className="whitespace-nowrap">
            {NEGOCIO.localidad}, {NEGOCIO.provincia}.
          </span>
        </p>

        <nav aria-label="Secciones del pie" className="mt-10">
          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-[15px]">
            {ANCLAS.map((a) => (
              <li key={a.href}>
                <a href={a.href}>{a.texto}</a>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-3 text-[15px]">
          <li>
            <a
              href={enlaceWhatsapp()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <GlifoWhatsapp className="h-4 w-4" />
              {NEGOCIO.whatsappVisible}
            </a>
          </li>
          <li>
            <a
              href={ENLACE_INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <GlifoInstagram className="h-4 w-4" />@{NEGOCIO.instagram}
            </a>
          </li>
        </ul>

        <div className="mt-12 flex w-full flex-col items-center gap-3 border-t border-white/15 pt-6 text-sm sm:flex-row sm:justify-center sm:gap-8">
          <p className="text-white/60">© 2026 Willy Pesca y Camping</p>
          <p className="text-white/60">
            Diseño web:{" "}
            <a
              href={LINKEDIN_AUTOR}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline decoration-white/35 underline-offset-4 hover:decoration-white"
            >
              Gonzalo Argüello<span className="sr-only"> (LinkedIn)</span>
            </a>
          </p>
          <a href="#inicio" className="font-dpmono">
            Volver arriba
          </a>
        </div>
      </div>
    </footer>
  );
}
