import { useState } from "react";
import { NOMBRE_CATEGORIA, PRODUCTOS, enlaceWhatsapp, mensajeConsulta, type Producto } from "./datos";

// Las dos lecturas técnicas de la vitrina, armadas con la ficha real del equipo.
function lecturas(p: Producto): Array<{ dato: string; valor: string }> {
  if (p.categoria === "reel") {
    return [
      { dato: "Tipo", valor: p.ficha[1] },
      { dato: "Rulemanes", valor: p.ficha[0].split(" ")[0] },
    ];
  }
  return [
    { dato: "Armado", valor: p.ficha[1] },
    { dato: "Largo", valor: p.ficha[0] },
  ];
}

export function Vitrina() {
  const [actual, setActual] = useState(0);
  const p = PRODUCTOS[actual];
  const [lecturaA, lecturaB] = lecturas(p);

  return (
    <section id="inicio" aria-labelledby="titulo-vitrina" className="overflow-hidden border-b border-filete">
      <div className="mx-auto grid max-w-[1280px] items-center gap-14 px-4 pb-16 pt-12 md:px-8 lg:grid-cols-2 lg:gap-10 lg:pb-20 lg:pt-16">
        <div className="min-w-0">
          <h1 id="titulo-vitrina" className="cond text-[3.4rem] leading-[0.88] md:text-[clamp(3.4rem,6.2vw,5.6rem)]">
            Equipá tu
            <br />
            próxima salida.
          </h1>
          <p className="mt-6 max-w-[42ch] text-lg leading-relaxed text-gris">
            Reels y cañas para pejerrey, carpa y trucha en Calamuchita. Taller propio para dejar tu
            equipo como nuevo.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <a
              href={enlaceWhatsapp(mensajeConsulta(p))}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-stock"
              aria-label={`Consultá stock del ${NOMBRE_CATEGORIA[p.categoria]} ${p.marca} ${p.modelo}`}
            >
              Consultá stock
            </a>
            <a href="#comparador" className="enlace-comparar">
              Comparar equipos
            </a>
          </div>
        </div>

        <div className="min-w-0">
          <div className="vitrina__escena mx-auto w-full max-w-[540px] pb-6 pt-8 lg:pl-24">
            <figure className="vitrina__tarjeta mx-auto w-[82%] lg:w-full">
              <div className="vitrina__foto">
                <img
                  key={p.id}
                  src={p.foto}
                  alt={p.alt}
                  width={640}
                  height={640}
                  className={actual === 0 ? undefined : "entra"}
                />
              </div>
              <span className="etiqueta-tecnica hidden lg:flex" style={{ top: "18%" }} aria-hidden="true">
                <b>
                  <span>{lecturaA.dato}</span>
                  {lecturaA.valor}
                </b>
                <i />
              </span>
              <span className="etiqueta-tecnica hidden lg:flex" style={{ top: "56%" }} aria-hidden="true">
                <b>
                  <span>{lecturaB.dato}</span>
                  {lecturaB.valor}
                </b>
                <i />
              </span>
              <figcaption className="flex items-center justify-between gap-4 border-t border-filete px-4 py-3">
                <span className="cond text-2xl leading-none">
                  {p.marca} {p.modelo}
                </span>
                <span className="font-dpmono text-xs text-cobalto">
                  {NOMBRE_CATEGORIA[p.categoria]} · {String(actual + 1).padStart(2, "0")}/
                  {String(PRODUCTOS.length).padStart(2, "0")}
                </span>
              </figcaption>
              <p className="border-t border-filete px-4 py-2 font-dpmono text-xs text-gris lg:hidden">
                {lecturaA.dato}: {lecturaA.valor} · {lecturaB.dato}: {lecturaB.valor}
              </p>
            </figure>
          </div>

          <div className="mx-auto mt-4 max-w-[540px] lg:pl-24">
            <p id="tira-ayuda" className="mb-2 font-dpmono text-xs text-gris">
              Elegí un equipo para verlo en la vitrina
            </p>
            <div className="tira" role="group" aria-labelledby="tira-ayuda">
              {PRODUCTOS.map((q, i) => (
                <button
                  key={q.id}
                  type="button"
                  className="tira__boton"
                  aria-pressed={i === actual}
                  aria-label={`${NOMBRE_CATEGORIA[q.categoria]} ${q.marca} ${q.modelo}`}
                  onClick={() => setActual(i)}
                  onMouseEnter={() => setActual(i)}
                  onFocus={() => setActual(i)}
                >
                  <img src={q.foto} alt="" width={64} height={64} loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
