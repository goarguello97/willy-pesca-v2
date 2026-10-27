import { Link } from "@tanstack/react-router";
import { useState } from "react";
import type { PaginaCategoria as Datos } from "../../lib/catalogo.functions";
import { Listado, SelectorOrden, SinProductos, ordenar, type Orden } from "./listados";

// /pesca (todas sus subcategorías, una debajo de otra) y /pesca/canas.
export function PaginaCategoria({ madre, sub, productos, hermanas }: Datos) {
  const [orden, setOrden] = useState<Orden>("nuevos");
  const nombre = sub?.nombre ?? madre.nombre;
  const descripcion = (sub ?? madre).descripcion;
  const grupos = sub
    ? [{ cat: sub, filas: productos }]
    : madre.hijas
        .map((h) => ({ cat: h, filas: productos.filter((p) => p.categoria.id === h.id) }))
        .filter((g) => g.filas.length);

  return (
    <section id="inicio" aria-labelledby="titulo-categoria" className="border-b border-filete">
      <div className="mx-auto max-w-[1280px] px-4 pb-20 pt-8 md:px-8 md:pb-28">
        <nav aria-label="Ruta de navegación" className="font-dpmono text-xs text-gris">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li>
              <Link to="/" className="underline-offset-4 hover:underline">
                Inicio
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            {sub ? (
              <>
                <li>
                  <Link
                    to="/$madre"
                    params={{ madre: madre.slug }}
                    activeOptions={{ exact: true }}
                    className="underline-offset-4 hover:underline"
                  >
                    {madre.nombre}
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
              </>
            ) : null}
            <li aria-current="page" className="text-tinta">
              {nombre}
            </li>
          </ol>
        </nav>

        <h1 id="titulo-categoria" className="mt-8">
          {sub ? (
            <span className="mb-3 block font-dpmono text-sm font-medium text-cobalto">{madre.nombre}</span>
          ) : null}
          <span className="cond block text-5xl leading-[0.9] md:text-7xl">{nombre}</span>
        </h1>
        <p className="mt-4 max-w-[58ch] text-lg leading-relaxed text-gris">
          {descripcion ?? "Fotos y ficha de cada producto. Consultá precio y stock por WhatsApp."}
        </p>

        {hermanas.length > 1 ? (
          <nav aria-label={`Categorías de ${madre.nombre.toLowerCase()}`} className="mt-8">
            <ul className="flex flex-wrap gap-2">
              {hermanas.map((h) => (
                <li key={h.slug}>
                  <Link
                    to="/$madre/$sub"
                    params={{ madre: madre.slug, sub: h.slug }}
                    aria-current={sub?.slug === h.slug ? "page" : undefined}
                    className="chip-categoria"
                  >
                    {h.nombre} <span className="font-dpmono text-xs opacity-70">{h.cantidad}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        {productos.length ? (
          <>
            <div className="mt-10 flex justify-end">
              <SelectorOrden valor={orden} onCambio={setOrden} />
            </div>
            {grupos.map(({ cat, filas }) =>
              sub ? (
                <Listado key={cat.id} ficha={cat.ficha} productos={ordenar(filas, orden)} />
              ) : (
                <div key={cat.id} className="mt-12 first-of-type:mt-6">
                  <h2 className="cond text-4xl leading-none md:text-5xl">
                    <Link
                      to="/$madre/$sub"
                      params={{ madre: madre.slug, sub: cat.slug }}
                      className="underline-offset-4 hover:underline"
                    >
                      {cat.nombre}
                    </Link>
                  </h2>
                  <Listado ficha={cat.ficha} productos={ordenar(filas, orden)} />
                </div>
              ),
            )}
          </>
        ) : (
          <SinProductos nombre={nombre} />
        )}
      </div>
    </section>
  );
}
