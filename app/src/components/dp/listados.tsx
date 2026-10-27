import { Link } from "@tanstack/react-router";
import { useId, useMemo, useState } from "react";
import {
  formatearLargo,
  formatearPrecio,
  fotoPrincipal,
  imagen,
  mensajeConsulta,
  rutaCategoria,
  slugProducto,
  textoAlternativo,
  type Ficha,
  type Producto,
  type Rama,
} from "./catalogo";
import { enlaceWhatsapp } from "./datos";
import { Tarjeta } from "./ficha-producto";
import { Flecha } from "./marca";

type Columna = { titulo: string; valor: (p: Producto) => string };

const sinDato = (v: string | null | undefined) => (v && v.trim() ? v : "—");

// Las columnas técnicas dependen de la ficha de la subcategoría; precio va siempre.
const COLUMNAS: Record<Ficha, Columna[]> = {
  reel: [
    { titulo: "Tipo", valor: (p) => sinDato(p.reelTipo) },
    { titulo: "Rulemanes", valor: (p) => (p.rulemanes === null ? "—" : String(p.rulemanes)) },
  ],
  cana: [
    { titulo: "Largo", valor: (p) => (p.largoM === null ? "—" : formatearLargo(p.largoM)) },
    { titulo: "Armado", valor: (p) => sinDato(p.canaArmado) },
  ],
};

const PRECIO: Columna = { titulo: "Precio", valor: (p) => formatearPrecio(p.precio) ?? "Consultar" };
const CATEGORIA: Columna = { titulo: "Categoría", valor: rutaCategoria };

export type Orden = "nuevos" | "menor" | "mayor";

const normalizar = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

// Todo lo que se puede buscar de un producto, sin tildes ni mayúsculas.
const textoBuscable = (p: Producto) =>
  normalizar(
    [
      p.marca,
      p.nombre,
      p.madre.nombre,
      p.categoria.nombre,
      p.categoria.singular,
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
export function ordenar(lista: Producto[], orden: Orden): Producto[] {
  if (orden === "nuevos") return lista;
  const conPrecio = lista.filter((p) => p.precio !== null);
  conPrecio.sort((a, b) => (orden === "menor" ? a.precio! - b.precio! : b.precio! - a.precio!));
  return [...conPrecio, ...lista.filter((p) => p.precio === null)];
}

export function SelectorOrden({ valor, onCambio }: { valor: Orden; onCambio: (o: Orden) => void }) {
  const id = useId();
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-semibold">
        Ordenar
      </label>
      <select id={id} value={valor} onChange={(e) => onCambio(e.target.value as Orden)} className="campo-dp">
        <option value="nuevos">Más nuevos</option>
        <option value="menor">Menor precio</option>
        <option value="mayor">Mayor precio</option>
      </select>
    </div>
  );
}

// Buscador de todo el catálogo, arriba de las secciones de la portada.
export function Buscador({ productos }: { productos: Producto[] }) {
  const id = useId();
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState<Orden>("nuevos");
  const palabras = normalizar(busqueda).split(/\s+/).filter(Boolean);
  const resultados = useMemo(
    () => ordenar(productos.filter((p) => palabras.every((w) => textoBuscable(p).includes(w))), orden),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productos, busqueda, orden],
  );
  if (!productos.length) return null;

  return (
    <section id="buscar" aria-labelledby={`${id}-titulo`} className="scroll-mt-16 border-b border-filete">
      <div className="mx-auto max-w-[1280px] px-4 py-14 md:px-8 md:py-16">
        <h2 id={`${id}-titulo`} className="cond text-4xl leading-none md:text-5xl">
          Buscá en el catálogo
        </h2>
        <div className="mt-6 flex flex-wrap items-end gap-4">
          <div className="grid min-w-[240px] max-w-[440px] flex-1 gap-2">
            <label htmlFor={`${id}-buscar`} className="text-sm font-semibold">
              Buscar
            </label>
            <input
              id={`${id}-buscar`}
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Marca, modelo o tipo: spinit, telescópica, carpa…"
              className="campo-dp"
            />
          </div>
          {palabras.length ? <SelectorOrden valor={orden} onCambio={setOrden} /> : null}
        </div>

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
        ) : null}
      </div>
    </section>
  );
}

// Una categoría madre en la portada: una pestaña por subcategoría con productos.
export function SeccionMadre({ madre, productos }: { madre: Rama; productos: Producto[] }) {
  const base = useId();
  const hijas = madre.hijas.filter((h) => productos.some((p) => p.categoria.id === h.id));
  const [elegida, setElegida] = useState<string | null>(null);
  const actual = hijas.find((h) => h.id === elegida) ?? hijas[0];
  if (!actual) return null;

  return (
    <section id={madre.slug} aria-labelledby={`${base}-titulo`} className="scroll-mt-16 border-b border-filete">
      <div className="mx-auto max-w-[1280px] px-4 py-20 md:px-8 md:py-28">
        <h2 id={`${base}-titulo`} className="cond text-5xl leading-none md:text-7xl">
          {madre.nombre}
        </h2>
        {madre.descripcion ? (
          <p className="mt-4 max-w-[58ch] text-lg leading-relaxed text-gris">{madre.descripcion}</p>
        ) : null}

        <div role="tablist" aria-label={`Categorías de ${madre.nombre.toLowerCase()}`} className="pestanas mt-10">
          {hijas.map((h) => (
            <button
              key={h.id}
              type="button"
              role="tab"
              id={`${base}-${h.slug}`}
              aria-selected={actual.id === h.id}
              aria-controls={`${base}-panel-${h.slug}`}
              className="pestana"
              onClick={() => setElegida(h.id)}
            >
              {h.nombre}
            </button>
          ))}
        </div>
        {/* Todos los paneles van en el HTML (los inactivos ocultos): así los
            buscadores encuentran el enlace a cada producto. */}
        {hijas.map((h) => {
          const filas = productos.filter((p) => p.categoria.id === h.id);
          return (
            <div
              key={h.id}
              id={`${base}-panel-${h.slug}`}
              role="tabpanel"
              aria-labelledby={`${base}-${h.slug}`}
              hidden={actual.id !== h.id}
            >
              <Listado ficha={h.ficha} productos={filas} />
              <Link
                to="/$madre/$sub"
                params={{ madre: madre.slug, sub: h.slug }}
                className="enlace-comparar mt-6 inline-block"
              >
                Ver todo en {h.nombre}
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// Con ficha técnica, tabla comparativa; sin ficha, tarjetas con foto.
export function Listado({ ficha, productos }: { ficha: Ficha | null; productos: Producto[] }) {
  if (ficha) return <Tabla columnas={[...COLUMNAS[ficha], PRECIO]} filas={productos} />;
  return (
    <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      {productos.map((p) => (
        <li key={p.id}>
          <Tarjeta producto={p} />
        </li>
      ))}
    </ul>
  );
}

export function SinProductos({ nombre }: { nombre: string }) {
  return (
    <div className="mt-10 max-w-[620px] border border-filete bg-tarjeta px-5 py-6">
      <p className="text-lg">Estamos sumando productos en {nombre}. Si buscás algo en particular, consultanos.</p>
      <a
        href={enlaceWhatsapp(`Hola Willy, quiero consultar por ${nombre.toLowerCase()}.`)}
        target="_blank"
        rel="noopener noreferrer"
        className="consultar-fila mt-4"
      >
        Escribinos
        <Flecha className="h-4 w-4" />
      </a>
    </div>
  );
}

function Tabla({ columnas, filas }: { columnas: Columna[]; filas: Producto[] }) {
  return (
    <div className="mt-6">
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
