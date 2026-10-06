import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  NOMBRE_CATEGORIA,
  formatearPrecio,
  fotoPrincipal,
  imagen,
  lecturas,
  mensajeConsulta,
  slugProducto,
  srcsetImagen,
  textoAlternativo,
  tituloProducto,
  type Producto,
} from "./catalogo";
import { enlaceWhatsapp } from "./datos";

const MAXIMO_VITRINA = 10;

// Los destacados van a la vitrina; si no hay ninguno, los más nuevos.
function elegirVitrina(productos: Producto[]): Producto[] {
  const destacados = productos.filter((p) => p.destacado && fotoPrincipal(p));
  const base = destacados.length ? destacados : productos.filter((p) => fotoPrincipal(p));
  return base.slice(0, MAXIMO_VITRINA);
}

export function Vitrina({ productos }: { productos: Producto[] }) {
  const enVitrina = elegirVitrina(productos);
  const [elegido, setElegido] = useState(0);
  const actual = Math.min(elegido, Math.max(0, enVitrina.length - 1));
  const p = enVitrina[actual] as Producto | undefined;

  return (
    <section id="inicio" aria-labelledby="titulo-vitrina" className="overflow-hidden border-b border-filete">
      <div className="mx-auto grid max-w-[1280px] items-center gap-14 px-4 pb-16 pt-12 md:px-8 lg:grid-cols-2 lg:gap-10 lg:pb-20 lg:pt-16">
        <div className="min-w-0">
          <h1 id="titulo-vitrina">
            <span className="mb-4 block font-dpmono text-sm font-medium text-cobalto">
              Casa de pesca y camping en Los Cóndores, Córdoba
            </span>
            <span className="cond block text-[3.4rem] leading-[0.88] md:text-[clamp(3.4rem,6.2vw,5.6rem)]">
              Equipá tu
              <br />
              próxima salida
            </span>
          </h1>
          <p className="mt-6 max-w-[42ch] text-lg leading-relaxed text-gris">
            Reels, cañas y accesorios de pesca para cualquier especie y cualquier salida.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <a
              href={enlaceWhatsapp(p ? mensajeConsulta(p) : "Hola Willy, quiero consultar stock.")}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-stock"
              aria-label={p ? `Consultá stock del ${textoAlternativo(p)}` : undefined}
            >
              Consultá stock
            </a>
            <a href="#comparador" className="enlace-comparar">
              Comparar equipos
            </a>
          </div>
        </div>

        {p ? <Escena productos={enVitrina} actual={actual} onElegir={setElegido} /> : null}
      </div>
    </section>
  );
}

function Escena({
  productos,
  actual,
  onElegir,
}: {
  productos: Producto[];
  actual: number;
  onElegir: (i: number) => void;
}) {
  const p = productos[actual];
  const [lecturaA, lecturaB] = lecturas(p);
  const precio = formatearPrecio(p.precio);

  return (
    <div className="min-w-0">
      <div className="vitrina__escena mx-auto w-full max-w-[540px] pb-6 pt-8 lg:pl-24">
        <figure className="vitrina__tarjeta mx-auto w-[82%] lg:w-full">
          <div className="vitrina__foto">
            <img
              key={p.id}
              src={imagen(fotoPrincipal(p) ?? "", 640)}
              srcSet={srcsetImagen(fotoPrincipal(p) ?? "", [384, 640, 1080])}
              sizes="(min-width: 1024px) 444px, 82vw"
              alt={textoAlternativo(p)}
              width={640}
              height={640}
              fetchPriority={actual === 0 ? "high" : undefined}
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
            <Link
              to="/producto/$slug"
              params={{ slug: slugProducto(p) }}
              className="cond text-2xl leading-none underline-offset-4 hover:underline"
            >
              {tituloProducto(p)}
            </Link>
            <span className="shrink-0 font-dpmono text-xs text-cobalto">
              {NOMBRE_CATEGORIA[p.categoria]} · {String(actual + 1).padStart(2, "0")}/
              {String(productos.length).padStart(2, "0")}
            </span>
          </figcaption>
          {precio ? (
            <p className="border-t border-filete px-4 py-2 font-dpmono text-sm text-tinta">{precio}</p>
          ) : null}
          <p className="border-t border-filete px-4 py-2 font-dpmono text-xs text-gris lg:hidden">
            {lecturaA.dato}: {lecturaA.valor} · {lecturaB.dato}: {lecturaB.valor}
          </p>
        </figure>
      </div>

      {productos.length > 1 ? (
        <div className="mx-auto mt-4 max-w-[540px] lg:pl-24">
          <p id="tira-ayuda" className="mb-2 font-dpmono text-xs text-gris">
            Elegí un equipo para verlo en la vitrina
          </p>
          <div className="tira" role="group" aria-labelledby="tira-ayuda">
            {productos.map((q, i) => (
              <button
                key={q.id}
                type="button"
                className="tira__boton"
                aria-pressed={i === actual}
                aria-label={textoAlternativo(q)}
                onClick={() => onElegir(i)}
                onMouseEnter={() => onElegir(i)}
                onFocus={() => onElegir(i)}
              >
                <img
                  src={imagen(fotoPrincipal(q) ?? "", 128)}
                  alt=""
                  width={64}
                  height={64}
                  loading="lazy"
                  decoding="async"
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
