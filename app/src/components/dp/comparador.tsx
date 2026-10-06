import { Link } from "@tanstack/react-router";
import { useId, useState } from "react";
import {
  CATEGORIAS,
  formatearLargo,
  formatearPrecio,
  fotoPrincipal,
  imagen,
  mensajeConsulta,
  slugProducto,
  textoAlternativo,
  type Categoria,
  type Producto,
} from "./catalogo";
import { enlaceWhatsapp } from "./datos";
import { Flecha } from "./marca";

type Columna = { titulo: string; valor: (p: Producto) => string };

const sinDato = (v: string | null | undefined) => (v && v.trim() ? v : "—");

// Las columnas técnicas dependen de la categoría; precio va siempre.
const COLUMNAS: Record<Categoria, Columna[]> = {
  reel: [
    { titulo: "Tipo", valor: (p) => sinDato(p.reelTipo) },
    { titulo: "Rulemanes", valor: (p) => (p.rulemanes === null ? "—" : String(p.rulemanes)) },
  ],
  cana: [
    { titulo: "Largo", valor: (p) => (p.largoM === null ? "—" : formatearLargo(p.largoM)) },
    { titulo: "Armado", valor: (p) => sinDato(p.canaArmado) },
  ],
  accesorio: [{ titulo: "Detalle", valor: (p) => sinDato(p.descripcion) }],
  camping: [{ titulo: "Detalle", valor: (p) => sinDato(p.descripcion) }],
  otro: [{ titulo: "Detalle", valor: (p) => sinDato(p.descripcion) }],
};

const PRECIO: Columna = { titulo: "Precio", valor: (p) => formatearPrecio(p.precio) ?? "Consultar" };

export function Comparador({ productos }: { productos: Producto[] }) {
  // Camping tiene su propia sección; acá van solo los equipos de pesca.
  const pestanas = CATEGORIAS.filter(
    (c) => c.valor !== "camping" && productos.some((p) => p.categoria === c.valor),
  );
  const [elegida, setElegida] = useState<Categoria | null>(null);
  const cat = pestanas.find((t) => t.valor === elegida)?.valor ?? pestanas[0]?.valor;
  const base = useId();

  return (
    <section id="comparador" aria-labelledby="titulo-comparador" className="scroll-mt-16 border-b border-filete">
      <div className="mx-auto max-w-[1280px] px-4 py-20 md:px-8 md:py-28">
        <h2 id="titulo-comparador" className="cond text-5xl leading-none md:text-7xl">
          Comparador
        </h2>
        <p className="mt-4 max-w-[58ch] text-lg leading-relaxed text-gris">
          Todos los equipos con su ficha, lado a lado. Fotos reales; stock por WhatsApp.
        </p>

        {cat ? (
          <>
            <div role="tablist" aria-label="Tipo de equipo" className="pestanas mt-10">
              {pestanas.map((t) => (
                <button
                  key={t.valor}
                  type="button"
                  role="tab"
                  id={`${base}-${t.valor}`}
                  aria-selected={cat === t.valor}
                  aria-controls={`${base}-panel-${t.valor}`}
                  className="pestana"
                  onClick={() => setElegida(t.valor)}
                >
                  {t.plural}
                </button>
              ))}
            </div>
            {/* Todas las tablas van en el HTML (las inactivas ocultas): así los
                buscadores encuentran el enlace a cada producto. */}
            {pestanas.map((t) => (
              <Tabla
                key={t.valor}
                id={`${base}-panel-${t.valor}`}
                etiqueta={`${base}-${t.valor}`}
                oculta={t.valor !== cat}
                columnas={[...COLUMNAS[t.valor], PRECIO]}
                filas={productos.filter((p) => p.categoria === t.valor)}
              />
            ))}
          </>
        ) : (
          <p className="mt-10 border border-filete bg-tarjeta px-5 py-6 text-lg">
            Estamos actualizando el catálogo. Escribinos por WhatsApp y te contamos qué hay.
          </p>
        )}
      </div>
    </section>
  );
}

function Tabla({
  id,
  etiqueta,
  oculta,
  columnas,
  filas,
}: {
  id: string;
  etiqueta: string;
  oculta: boolean;
  columnas: Columna[];
  filas: Producto[];
}) {
  return (
    <div id={id} role="tabpanel" aria-labelledby={etiqueta} hidden={oculta} className="mt-6">
      <table className="tabla">
        <thead>
          <tr>
            <th scope="col" colSpan={2}>
              Equipo
            </th>
            {columnas.map((c) => (
              <th key={c.titulo} scope="col">
                {c.titulo}
              </th>
            ))}
            <th scope="col">
              <span className="sr-only">Consulta</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {filas.map((p) => {
            const foto = fotoPrincipal(p);
            return (
              <tr key={p.id}>
                <td className="w-[88px]">
                  {foto ? (
                    <img
                      src={imagen(foto, 128)}
                      alt=""
                      width={64}
                      height={64}
                      loading="lazy"
                      decoding="async"
                      className="h-16 w-16 border border-filete object-cover"
                    />
                  ) : (
                    <span className="block h-16 w-16 border border-filete bg-blanco" aria-hidden="true" />
                  )}
                </td>
                <td>
                  <Link
                    to="/producto/$slug"
                    params={{ slug: slugProducto(p) }}
                    className="underline-offset-4 hover:underline"
                  >
                    {p.marca ? <span className="cond text-2xl leading-none">{p.marca}</span> : null}{" "}
                    <span className="text-lg font-semibold">{p.nombre}</span>
                  </Link>
                </td>
                {columnas.map((c) => (
                  <td key={c.titulo} data-dato={c.titulo} className="font-dpmono text-sm">
                    {c.valor(p)}
                  </td>
                ))}
                <td className="md:text-right">
                  <a
                    href={enlaceWhatsapp(mensajeConsulta(p))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="consultar-fila mt-2 md:mt-0"
                    aria-label={`Consultar por ${textoAlternativo(p)}`}
                  >
                    Consultar
                    <Flecha className="h-4 w-4" />
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
