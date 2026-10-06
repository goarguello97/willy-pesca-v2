import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  CATEGORIAS,
  NOMBRE_CATEGORIA,
  filasFicha,
  formatearPrecio,
  fotoPrincipal,
  imagen,
  mensajeConsulta,
  seccionDeProducto,
  srcsetImagen,
  textoAlternativo,
  tituloProducto,
  urlProducto,
  type Producto,
} from "./catalogo";
import { enlaceWhatsapp } from "./datos";
import { Flecha } from "./marca";

const plural = (p: Producto) => CATEGORIAS.find((c) => c.valor === p.categoria)?.plural ?? "Equipos";

// Título de "relacionados" con el género de cada categoría.
const OTROS: Record<Producto["categoria"], string> = {
  reel: "Otros reels",
  cana: "Otras cañas",
  accesorio: "Otros accesorios",
  camping: "Más para camping",
  otro: "Otros productos",
};

export function FichaProducto({ producto: p, relacionados }: { producto: Producto; relacionados: Producto[] }) {
  const precio = formatearPrecio(p.precio);
  return (
    <>
      <section id="inicio" aria-labelledby="titulo-producto" className="border-b border-filete">
        <div className="mx-auto max-w-[1280px] px-4 pb-16 pt-8 md:px-8 lg:pb-24">
          <nav aria-label="Ruta de navegación" className="font-dpmono text-xs text-gris">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <Link to="/" className="underline-offset-4 hover:underline">
                  Inicio
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <a href={seccionDeProducto(p)} className="underline-offset-4 hover:underline">
                  {plural(p)}
                </a>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-tinta">
                {tituloProducto(p)}
              </li>
            </ol>
          </nav>

          <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
            <Galeria producto={p} />
            <div className="min-w-0">
              <p className="font-dpmono text-sm text-cobalto">{NOMBRE_CATEGORIA[p.categoria]}</p>
              <h1 id="titulo-producto" className="cond mt-2 text-5xl leading-[0.9] md:text-7xl">
                {tituloProducto(p)}
              </h1>
              <p className="mt-6 font-dpmono text-2xl text-tinta">{precio ?? "Consultá el precio"}</p>
              {p.descripcion ? (
                <p className="mt-6 max-w-[60ch] whitespace-pre-line text-lg leading-relaxed text-gris">
                  {p.descripcion}
                </p>
              ) : null}

              <dl className="ficha-datos mt-8 max-w-[520px]">
                {filasFicha(p).map((f) => (
                  <div key={f.dato}>
                    <dt className="font-dpmono text-xs text-gris">{f.dato}</dt>
                    <dd className="text-lg">{f.valor}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                <a
                  href={enlaceWhatsapp(mensajeConsulta(p))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-stock"
                  aria-label={`Consultá stock del ${textoAlternativo(p)}`}
                >
                  Consultá stock
                </a>
                <a href={seccionDeProducto(p)} className="enlace-comparar">
                  {p.categoria === "camping" ? "Ver más de camping" : "Comparar con otros equipos"}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {relacionados.length ? (
        <section aria-labelledby="titulo-relacionados" className="border-b border-filete">
          <div className="mx-auto max-w-[1280px] px-4 py-16 md:px-8 md:py-24">
            <h2 id="titulo-relacionados" className="cond text-4xl leading-none md:text-6xl">
              {OTROS[p.categoria]}
            </h2>
            <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {relacionados.map((r) => (
                <li key={r.id}>
                  <Tarjeta producto={r} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}

function Galeria({ producto: p }: { producto: Producto }) {
  const [actual, setActual] = useState(0);
  const foto = p.imagenes[actual] ?? p.imagenes[0];
  if (!foto) {
    return <div className="aspect-square w-full border border-filete bg-tarjeta" aria-hidden="true" />;
  }
  return (
    <div className="min-w-0">
      <div className="vitrina__foto border border-filete">
        <img
          key={foto.id}
          src={imagen(foto.url, 640)}
          srcSet={srcsetImagen(foto.url, [384, 640, 1080])}
          sizes="(min-width: 1024px) 600px, 100vw"
          alt={textoAlternativo(p)}
          width={640}
          height={640}
          fetchPriority="high"
        />
      </div>
      {p.imagenes.length > 1 ? (
        <div className="tira mt-3" role="group" aria-label="Fotos del producto">
          {p.imagenes.map((f, i) => (
            <button
              key={f.id}
              type="button"
              className="tira__boton"
              aria-pressed={i === actual}
              aria-label={`Ver foto ${i + 1}`}
              onClick={() => setActual(i)}
            >
              <img src={imagen(f.url, 128)} alt="" width={64} height={64} loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Tarjeta({ producto: p }: { producto: Producto }) {
  const foto = fotoPrincipal(p);
  return (
    <Link
      to="/producto/$slug"
      params={{ slug: urlProducto(p).replace("/producto/", "") }}
      className="group flex h-full flex-col border border-filete bg-tarjeta"
    >
      {foto ? (
        <img
          src={imagen(foto, 384)}
          alt={textoAlternativo(p)}
          width={384}
          height={384}
          loading="lazy"
          decoding="async"
          className="aspect-square w-full object-cover"
        />
      ) : (
        <span className="block aspect-square w-full bg-blanco" aria-hidden="true" />
      )}
      <span className="flex flex-1 items-center justify-between gap-3 border-t border-filete px-3 py-3">
        <span className="min-w-0">
          <span className="cond line-clamp-2 block text-xl leading-none group-hover:underline">
            {tituloProducto(p)}
          </span>
          <span className="mt-1 block font-dpmono text-xs text-gris">
            {formatearPrecio(p.precio) ?? "Consultar precio"}
          </span>
        </span>
        <Flecha className="h-4 w-4 shrink-0 text-cobalto" />
      </span>
    </Link>
  );
}
