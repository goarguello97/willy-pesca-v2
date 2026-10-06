import { ENLACE_COMO_LLEGAR, enlaceWhatsapp } from "./datos";

const PASOS = [
  {
    titulo: "Elegí tu equipo",
    texto: "Mirá la vitrina y el comparador: cada equipo tiene su ficha técnica y fotos reales.",
    enlace: { texto: "Ver equipos", href: "/#comparador", externo: false },
  },
  {
    titulo: "Consultá por WhatsApp",
    texto:
      "Tocá «Consultá stock» y el mensaje sale armado con el equipo que elegiste. Te confirmamos precio y disponibilidad.",
    enlace: {
      texto: "Escribinos",
      href: enlaceWhatsapp("Hola Willy, quiero consultar por un equipo."),
      externo: true,
    },
  },
  {
    titulo: "Retiro, envío o entrega",
    texto: "Pasás a buscarlo por Los Cóndores o coordinamos por WhatsApp el envío o la entrega.",
    enlace: { texto: "Cómo llegar", href: ENLACE_COMO_LLEGAR, externo: true },
  },
];

export function ComoComprar() {
  return (
    <section id="como-comprar" aria-labelledby="titulo-como-comprar" className="pasos-dp scroll-mt-16">
      <div className="relative mx-auto max-w-[1280px] px-4 py-20 md:px-8 md:py-28">
        <h2 id="titulo-como-comprar" className="cond text-5xl leading-none md:text-7xl">
          Cómo comprar
        </h2>
        <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-white/75">
          Sin carrito ni registro: todo se arregla por WhatsApp, directo con Willy.
        </p>
        <ol className="pasos mt-12">
          {PASOS.map((paso, i) => (
            <li key={paso.titulo} className="paso">
              <span className="paso__numero" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="cond text-3xl leading-none">{paso.titulo}</h3>
              <p>{paso.texto}</p>
              <a
                href={paso.enlace.href}
                className="paso__enlace"
                {...(paso.enlace.externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {paso.enlace.texto}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
