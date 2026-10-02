import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  NOMBRE_CATEGORIA,
  SELECT_PRODUCTO,
  desdeFila,
  formatearPrecio,
  fotoPrincipal,
  ordenarCatalogo,
  tituloProducto,
  type FilaProducto,
  type Producto,
} from "../dp/catalogo";
import { borrarArchivos } from "./imagenes";
import { useSesion } from "./sesion";

type Filtro = "todos" | "publicados" | "borradores";

export function ListaProductos() {
  const { sb } = useSesion();
  const [productos, setProductos] = useState<Producto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [ocupado, setOcupado] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    sb.from("productos")
      .select(SELECT_PRODUCTO)
      .returns<FilaProducto[]>()
      .then(({ data, error: e }) => {
        if (!vivo) return;
        if (e) setError(`No se pudo cargar el catálogo: ${e.message}`);
        else setProductos(ordenarCatalogo(data.map(desdeFila)));
      });
    return () => {
      vivo = false;
    };
  }, [sb]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return (productos ?? []).filter(
      (p) =>
        (filtro === "todos" || (filtro === "publicados" ? p.publicado : !p.publicado)) &&
        (!q || tituloProducto(p).toLowerCase().includes(q)),
    );
  }, [productos, filtro, busqueda]);

  const cambiar = async (p: Producto, campo: "publicado" | "destacado") => {
    setOcupado(p.id);
    setError(null);
    const valor = !p[campo];
    const { error: e } = await sb.from("productos").update({ [campo]: valor }).eq("id", p.id);
    setOcupado(null);
    if (e) return setError(`No se pudo actualizar: ${e.message}`);
    setProductos((ps) => ps?.map((x) => (x.id === p.id ? { ...x, [campo]: valor } : x)) ?? null);
  };

  const borrar = async (p: Producto) => {
    if (!window.confirm(`¿Borrar "${tituloProducto(p)}"? No se puede deshacer.`)) return;
    setOcupado(p.id);
    setError(null);
    try {
      await borrarArchivos(sb, p.imagenes.map((i) => i.ruta));
      const { error: e } = await sb.from("productos").delete().eq("id", p.id);
      if (e) throw new Error(e.message);
      setProductos((ps) => ps?.filter((x) => x.id !== p.id) ?? null);
    } catch (e) {
      setError(`No se pudo borrar: ${(e as Error).message}`);
    } finally {
      setOcupado(null);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="cond text-5xl leading-none">Productos</h1>
          <p className="mt-2 text-sm text-gris">Los cambios se ven en el sitio en hasta un minuto.</p>
        </div>
        <Link to="/admin/producto/$id" params={{ id: "nuevo" }} className="boton-admin">
          Nuevo producto
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div role="group" aria-label="Filtrar por estado" className="pestanas">
          {(["todos", "publicados", "borradores"] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filtro === f}
              onClick={() => setFiltro(f)}
              className="pestana pestana--chica"
            >
              {f}
            </button>
          ))}
        </div>
        <label className="sr-only" htmlFor="buscar-producto">
          Buscar producto
        </label>
        <input
          id="buscar-producto"
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por marca o nombre"
          className="campo-dp max-w-[280px]"
        />
      </div>

      {error ? (
        <p role="alert" className="mt-6 border border-error/40 bg-tarjeta px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}

      {productos === null && !error ? <p className="mt-8 text-gris">Cargando productos…</p> : null}

      {productos !== null && visibles.length === 0 ? (
        <p className="mt-8 border border-filete bg-tarjeta px-5 py-6 text-gris">
          {productos.length === 0 ? "Todavía no hay productos cargados." : "Ningún producto coincide."}
        </p>
      ) : null}

      <ul className="mt-6 grid gap-3">
        {visibles.map((p) => {
          const foto = fotoPrincipal(p);
          return (
            <li
              key={p.id}
              className="grid grid-cols-[64px_1fr] items-center gap-x-4 gap-y-3 border border-filete bg-tarjeta p-3 md:grid-cols-[64px_1fr_auto_auto]"
            >
              {foto ? (
                <img src={foto} alt="" className="h-16 w-16 border border-filete object-cover" />
              ) : (
                <span className="h-16 w-16 border border-dashed border-filete" aria-hidden="true" />
              )}
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold">{tituloProducto(p)}</p>
                <p className="font-dpmono text-xs text-gris">
                  {NOMBRE_CATEGORIA[p.categoria]} · {formatearPrecio(p.precio) ?? "sin precio"} ·{" "}
                  {p.imagenes.length} {p.imagenes.length === 1 ? "foto" : "fotos"}
                </p>
              </div>
              <div className="col-span-2 flex flex-wrap gap-2 md:col-span-1">
                <button
                  type="button"
                  disabled={ocupado === p.id}
                  onClick={() => cambiar(p, "publicado")}
                  aria-pressed={p.publicado}
                  className="chip-estado"
                  title={p.publicado ? "Pasar a borrador" : "Publicar"}
                >
                  {p.publicado ? "Publicado" : "Borrador"}
                </button>
                <button
                  type="button"
                  disabled={ocupado === p.id}
                  onClick={() => cambiar(p, "destacado")}
                  aria-pressed={p.destacado}
                  className="chip-estado"
                  title={p.destacado ? "Sacar de la vitrina" : "Mostrar en la vitrina"}
                >
                  {p.destacado ? "En vitrina" : "Fuera de vitrina"}
                </button>
              </div>
              <div className="col-span-2 flex gap-2 md:col-span-1">
                <Link
                  to="/admin/producto/$id"
                  params={{ id: p.id }}
                  className="boton-admin boton-admin--sec boton-admin--chico"
                >
                  Editar
                </Link>
                <button
                  type="button"
                  disabled={ocupado === p.id}
                  onClick={() => borrar(p)}
                  className="boton-admin boton-admin--peligro boton-admin--chico"
                >
                  Borrar
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
