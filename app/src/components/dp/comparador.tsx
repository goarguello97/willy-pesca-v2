import { Link } from "@tanstack/react-router";
import { useId, useMemo, useState } from "react";
import {
  CATEGORIAS,
  NOMBRE_CATEGORIA,
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
const CATEGORIA: Columna = { titulo: "Categoría", valor: (p) => NOMBRE_CATEGORIA[p.categoria] };

type Orden = "nuevos" | "menor" | "mayor";

const normalizar = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

// Todo lo que se puede buscar de un producto, sin tildes ni mayúsculas.
const textoBuscable = (p: Producto) =>
  normalizar(
    [
      p.marca,
      p.nombre,
      NOMBRE_CATEGORIA[p.categoria],
      CATEGORIAS.find((c) => c.valor === p.categoria)?.plural,
      p.descripcion,
      p.reelTipo,
      p.rulemanes === null ? null : `${p.rulemanes} rulemanes`,
      p.largoM === null ? null : formatearLargo(p.largoM),
      p.canaArmado,
    ]
      .filter(Boolean)
      .join(" "),
  );

// "Más nuevos" respeta el orden del catálogo; por precio, los que no tienen van al final.
function ordenar(lista: Producto[], orden: Orden): Producto[] {
  if (orden === "nuevos") return lista;
  const conPrecio = lista.filter((p) => p.precio !== null);
  conPrecio.sort((a, b) => (orden === "menor" ? a.precio! - b.precio! : b.precio! - a.precio!));
  return [...conPrecio, ...lista.filter((p) => p.precio === null)];
}

export function Comparador({ productos }: { productos: Producto[] }) {
  // Camping tiene su propia sección; acá van solo los equipos de pesca.
  const pestanas = CATEGORIAS.filter(
    (c) => c.valor !== "camping" && productos.some((p) => p.categoria === c.valor),
  );
  const [elegida, setElegida] = useState<Categoria | null>(null);
  const cat = pestanas.find((t) => t.valor === elegida)?.valor ?? pestanas[0]?.valor;
  const base = useId();
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState<Orden>("nuevos");
  const palabras = normalizar(busqueda).split(/\s+/).filter(Boolean);
  const resultados = useMemo(
    () => ordenar(productos.filter((p) => palabras.every((w) => textoBuscable(p).includes(w))), orden),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productos, busqueda, orden],
  );

  return (
    <section id="comparador" aria-labelledby="titulo-comparador" className="scroll-mt-16 border-b border-filete">
      <div className="mx-auto max-w-[1280px] px-4 py-20 md:px-8 md:py-28">
        <h2 id="titulo-comparador" className="cond text-5xl leading-none md:text-7xl">
          Comparador
        </h2>
        <p className="mt-4 max-w-[58ch] text-lg leading-relaxed text-gris">
          Todos los equipos con su ficha, lado a lado. Fotos reales; stock por WhatsApp.
        </p>

        {productos.length ? (
          <div className="mt-10 flex flex-wrap items-end gap-4">
            <div className="grid min-w-[240px] max-w-[440px] flex-1 gap-2">
              <label htmlFor={`${base}-buscar`} className="text-sm font-semibold">
                Buscar
              </label>
              <input
                id={`${base}-buscar`}
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Marca, modelo o tipo: spinit, telescópica…"
                className="campo-dp"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor={`${base}-orden`} className="text-sm font-semibold">
                Ordenar
              </label>
              <select
                id={`${base}-orden`}
                value={orden}
                onChange={(e) => setOrden(e.target.value as Orden)}
                className="campo-dp"
              >
                <option value="nuevos">Más nuevos</option>
                <option value="menor">Menor precio</option>
                <option value="mayor">Mayor precio</option>
              </select>
            </div>
          </div>
        ) : null}

        {palabras.length ? (
          <>
            <p role="status" className="mt-6 font-dpmono text-sm text-gris">
              {resultados.length === 1 ? "1 resultado" : `${resultados.length} resultados`}
            </p>
            {resultados.length ? (
              <Tabla columnas={[CATEGORIA, PRECIO]} filas={resultados} />
            ) : (
              <p className="mt-4 border border-filete bg-tarjeta px-5 py-6 text-lg">
                No encontramos «{busqueda.trim()}». Probá con otra palabra o consultanos por WhatsApp.
              </p>
            )}
          </>
        ) : cat ? (
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
                filas={ordenar(
                  productos.filter((p) => p.categoria === t.valor),
                  orden,
                )}
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
  oculta = false,
  columnas,
  filas,
}: {
  id?: string;
  etiqueta?: string;
  oculta?: boolean;
  columnas: Columna[];
  filas: Producto[];
}) {
  // Con pestañas es un tabpanel; los resultados de búsqueda son una tabla común.
  const panel = etiqueta ? { role: "tabpanel", "aria-labelledby": etiqueta } : {};
  return (
    <div id={id} {...panel} hidden={oculta} className="mt-6">
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
