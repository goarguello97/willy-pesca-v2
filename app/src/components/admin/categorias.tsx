import type { SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useId, useState, type FormEvent } from "react";
import {
  SELECT_CATEGORIA,
  SLUGS_RESERVADOS,
  aSlug,
  armarArbol,
  desdeFilaCategoria,
  urlCategoria,
  type Categoria,
  type FilaCategoria,
  type Ficha,
} from "../dp/catalogo";
import { useSesion } from "./sesion";

/** Todas las categorías, también las ocultas (el admin las ve por RLS). */
export async function leerCategorias(sb: SupabaseClient): Promise<Categoria[]> {
  const { data, error } = await sb.from("categorias").select(SELECT_CATEGORIA).returns<FilaCategoria[]>();
  if (error) throw new Error(error.message);
  return data.map(desdeFilaCategoria);
}

const FICHAS: Array<{ valor: Ficha | ""; texto: string }> = [
  { valor: "", texto: "Ninguna (solo descripción)" },
  { valor: "reel", texto: "Reel: tipo y rulemanes" },
  { valor: "cana", texto: "Caña: largo y armado" },
];

type Edicion = {
  id: string | null; // null = nueva
  padreId: string | null; // null = madre
  nombre: string;
  singular: string;
  slug: string;
  slugTocado: boolean;
  descripcion: string;
  ficha: Ficha | "";
  visible: boolean;
};

const nueva = (padreId: string | null): Edicion => ({
  id: null,
  padreId,
  nombre: "",
  singular: "",
  slug: "",
  slugTocado: false,
  descripcion: "",
  ficha: "",
  visible: true,
});

const desdeCategoria = (c: Categoria): Edicion => ({
  id: c.id,
  padreId: c.padreId,
  nombre: c.nombre,
  singular: c.singular ?? "",
  slug: c.slug,
  slugTocado: true,
  descripcion: c.descripcion ?? "",
  ficha: c.ficha ?? "",
  visible: c.visible,
});

const mensajeDeError = (e: { message: string; code?: string }) =>
  e.code === "23505"
    ? "Ya hay otra categoría con esa dirección en el mismo nivel."
    : e.code === "23503"
      ? "Tiene productos o subcategorías: primero movelos o borralos."
      : e.message;

export function AdminCategorias() {
  const { sb } = useSesion();
  const [categorias, setCategorias] = useState<Categoria[] | null>(null);
  const [conteo, setConteo] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [edicion, setEdicion] = useState<Edicion | null>(null);

  const recargar = useCallback(async () => {
    const [cats, prods] = await Promise.all([
      leerCategorias(sb),
      sb.from("productos").select("categoria_id").returns<Array<{ categoria_id: string }>>(),
    ]);
    if (prods.error) throw new Error(prods.error.message);
    const n: Record<string, number> = {};
    for (const p of prods.data) n[p.categoria_id] = (n[p.categoria_id] ?? 0) + 1;
    setCategorias(cats);
    setConteo(n);
  }, [sb]);

  useEffect(() => {
    recargar().catch((e: Error) => setError(`No se pudieron cargar las categorías: ${e.message}`));
  }, [recargar]);

  // Corre una acción contra la base y vuelve a leer todo. Devuelve el error, si hubo.
  const hacer = async (accion: () => Promise<void>): Promise<string | null> => {
    setOcupado(true);
    setError(null);
    try {
      await accion();
      await recargar();
      return null;
    } catch (e) {
      const mensaje = mensajeDeError(e as { message: string; code?: string });
      setError(mensaje);
      return mensaje;
    } finally {
      setOcupado(false);
    }
  };

  const arbol = armarArbol(categorias ?? []);
  const hermanas = (c: Pick<Categoria, "padreId">) =>
    c.padreId === null ? arbol : (arbol.find((m) => m.id === c.padreId)?.hijas ?? []);

  // Mueve una posición y renumera el nivel (1, 2, 3…).
  const mover = (c: Categoria, paso: -1 | 1) =>
    hacer(async () => {
      const lista = [...hermanas(c)];
      const i = lista.findIndex((x) => x.id === c.id);
      const j = i + paso;
      if (j < 0 || j >= lista.length) return;
      [lista[i], lista[j]] = [lista[j], lista[i]];
      const cambios = lista.map((x, k) => ({ x, orden: k + 1 })).filter(({ x, orden }) => x.orden !== orden);
      const resultados = await Promise.all(
        cambios.map(({ x, orden }) => sb.from("categorias").update({ orden }).eq("id", x.id)),
      );
      const fallo = resultados.find((r) => r.error)?.error;
      if (fallo) throw fallo;
    });

  const alternarVisible = (c: Categoria) =>
    hacer(async () => {
      const { error: e } = await sb.from("categorias").update({ visible: !c.visible }).eq("id", c.id);
      if (e) throw e;
    });

  const borrar = (c: Categoria) => {
    if (!window.confirm(`¿Borrar la categoría "${c.nombre}"?`)) return;
    void hacer(async () => {
      const { error: e } = await sb.from("categorias").delete().eq("id", c.id);
      if (e) throw e;
    });
  };

  const guardar = async (ed: Edicion): Promise<string | null> => {
    const slug = ed.slug.trim();
    if (!ed.nombre.trim()) return "Poné un nombre.";
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return "La dirección va en minúsculas, sin tildes ni espacios: cañas → canas.";
    if (ed.padreId === null && SLUGS_RESERVADOS.includes(slug)) return `La dirección "${slug}" está reservada, elegí otra.`;
    if (hermanas(ed).some((h) => h.slug === slug && h.id !== ed.id)) {
      return "Ya hay otra categoría con esa dirección en el mismo nivel.";
    }
    const fila = {
      padre_id: ed.padreId,
      nombre: ed.nombre.trim(),
      singular: ed.padreId ? ed.singular.trim() || null : null,
      slug,
      descripcion: ed.descripcion.trim() || null,
      ficha: ed.padreId ? ed.ficha || null : null,
      visible: ed.visible,
    };
    const fallo = await hacer(async () => {
      if (ed.id) {
        const { error: e } = await sb.from("categorias").update(fila).eq("id", ed.id);
        if (e) throw e;
      } else {
        const orden = Math.max(0, ...hermanas(ed).map((h) => h.orden)) + 1;
        const { error: e } = await sb.from("categorias").insert({ ...fila, orden });
        if (e) throw e;
      }
    });
    // El error se muestra en el formulario, no arriba.
    if (fallo) setError(null);
    else setEdicion(null);
    return fallo;
  };

  const formulario = (padre: Categoria | null) => (
    <FormCategoria
      edicion={edicion!}
      madres={arbol}
      padre={padre}
      ocupado={ocupado}
      onCambio={setEdicion}
      onGuardar={guardar}
      onCancelar={() => setEdicion(null)}
    />
  );

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="cond text-5xl leading-none">Categorías</h1>
          <p className="mt-2 max-w-[60ch] text-sm text-gris">
            Ordená con las flechas: ese orden se usa en el sitio (secciones, pestañas y menú). Los cambios se ven
            en hasta un minuto.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEdicion(nueva(null))}
          disabled={ocupado}
          className="boton-admin"
        >
          Nueva categoría madre
        </button>
      </div>

      {error ? (
        <p role="alert" className="mt-6 border border-error/40 bg-tarjeta px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}

      {categorias === null && !error ? <p className="mt-8 text-gris">Cargando categorías…</p> : null}

      {edicion && edicion.id === null && edicion.padreId === null ? <div className="mt-6">{formulario(null)}</div> : null}

      <ul className="mt-6 grid gap-5">
        {arbol.map((m, i) => (
          <li key={m.id} className="border border-filete bg-tarjeta">
            <Fila
              c={m}
              url={urlCategoria(m)}
              detalle={`${m.hijas.length} ${m.hijas.length === 1 ? "subcategoría" : "subcategorías"}`}
              primera={i === 0}
              ultima={i === arbol.length - 1}
              borrable={m.hijas.length === 0}
              motivoNoBorrable="Tiene subcategorías"
              ocupado={ocupado}
              onMover={(paso) => mover(m, paso)}
              onVisible={() => alternarVisible(m)}
              onEditar={() => setEdicion(desdeCategoria(m))}
              onBorrar={() => borrar(m)}
            />
            {edicion?.id === m.id ? <div className="border-t border-filete p-4">{formulario(null)}</div> : null}

            <ul className="border-t border-filete">
              {m.hijas.map((h, j) => {
                const n = conteo[h.id] ?? 0;
                return (
                  <li key={h.id} className="border-b border-filete pl-6 last:border-b-0 md:pl-10">
                    <Fila
                      c={h}
                      url={urlCategoria(m, h)}
                      detalle={[
                        n === 1 ? "1 producto" : `${n} productos`,
                        h.ficha ? `ficha de ${h.ficha === "reel" ? "reel" : "caña"}` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                      primera={j === 0}
                      ultima={j === m.hijas.length - 1}
                      borrable={n === 0}
                      motivoNoBorrable="Tiene productos"
                      ocupado={ocupado}
                      onMover={(paso) => mover(h, paso)}
                      onVisible={() => alternarVisible(h)}
                      onEditar={() => setEdicion(desdeCategoria(h))}
                      onBorrar={() => borrar(h)}
                    />
                    {edicion?.id === h.id ? <div className="pb-4 pr-4">{formulario(m)}</div> : null}
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-filete p-4">
              {edicion && edicion.id === null && edicion.padreId === m.id ? (
                formulario(m)
              ) : (
                <button
                  type="button"
                  onClick={() => setEdicion(nueva(m.id))}
                  disabled={ocupado}
                  className="boton-admin boton-admin--sec boton-admin--chico"
                >
                  Nueva subcategoría en {m.nombre}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function Fila({
  c,
  url,
  detalle,
  primera,
  ultima,
  borrable,
  motivoNoBorrable,
  ocupado,
  onMover,
  onVisible,
  onEditar,
  onBorrar,
}: {
  c: Categoria;
  url: string;
  detalle: string;
  primera: boolean;
  ultima: boolean;
  borrable: boolean;
  motivoNoBorrable: string;
  ocupado: boolean;
  onMover: (paso: -1 | 1) => void;
  onVisible: () => void;
  onEditar: () => void;
  onBorrar: () => void;
}) {
  const madre = c.padreId === null;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 p-3 md:p-4">
      <div className="flex">
        <button
          type="button"
          onClick={() => onMover(-1)}
          disabled={primera || ocupado}
          className="boton-orden"
          aria-label={`Subir ${c.nombre}`}
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => onMover(1)}
          disabled={ultima || ocupado}
          className="boton-orden"
          aria-label={`Bajar ${c.nombre}`}
        >
          ↓
        </button>
      </div>
      <div className="min-w-0 flex-1">
        <p className={madre ? "cond text-3xl leading-none" : "text-lg font-semibold"}>
          {c.nombre}
          {c.visible ? null : <span className="ml-2 font-dpmono text-xs font-normal text-error">oculta</span>}
        </p>
        <p className="mt-1 font-dpmono text-xs text-gris">
          {url} · {detalle}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={ocupado}
          onClick={onVisible}
          aria-pressed={c.visible}
          className="chip-estado"
          title={c.visible ? "Ocultar del sitio" : "Mostrar en el sitio"}
        >
          {c.visible ? "Visible" : "Oculta"}
        </button>
        <button type="button" onClick={onEditar} disabled={ocupado} className="boton-admin boton-admin--sec boton-admin--chico">
          Editar
        </button>
        <button
          type="button"
          onClick={onBorrar}
          disabled={!borrable || ocupado}
          title={borrable ? undefined : `${motivoNoBorrable}: no se puede borrar`}
          className="boton-admin boton-admin--peligro boton-admin--chico"
        >
          Borrar
        </button>
      </div>
    </div>
  );
}

function FormCategoria({
  edicion: ed,
  madres,
  padre,
  ocupado,
  onCambio,
  onGuardar,
  onCancelar,
}: {
  edicion: Edicion;
  madres: Categoria[];
  padre: Categoria | null;
  ocupado: boolean;
  onCambio: (e: Edicion) => void;
  onGuardar: (e: Edicion) => Promise<string | null>;
  onCancelar: () => void;
}) {
  const id = useId();
  const [error, setError] = useState<string | null>(null);
  const esSub = ed.padreId !== null;
  const madreActual = madres.find((m) => m.id === ed.padreId) ?? padre;
  const set = (cambios: Partial<Edicion>) => onCambio({ ...ed, ...cambios });

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setError(await onGuardar(ed));
  };

  return (
    <form onSubmit={enviar} noValidate className="grid gap-5 border border-cobalto/40 bg-blanco p-4 md:p-5">
      <h2 className="cond text-2xl leading-none">
        {ed.id ? `Editar ${ed.nombre || "categoría"}` : esSub ? `Nueva subcategoría en ${padre?.nombre}` : "Nueva categoría madre"}
      </h2>
      {error ? (
        <p role="alert" className="text-sm font-medium text-error">
          {error}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor={`${id}-nombre`} className="text-sm font-semibold">
            Nombre
          </label>
          <input
            id={`${id}-nombre`}
            value={ed.nombre}
            onChange={(e) =>
              set({ nombre: e.target.value, ...(ed.slugTocado ? {} : { slug: aSlug(e.target.value) }) })
            }
            placeholder={esSub ? "Ej.: Carpas" : "Ej.: Náutica"}
            className="campo-dp"
          />
        </div>
        {esSub ? (
          <div className="grid gap-2">
            <label htmlFor={`${id}-singular`} className="text-sm font-semibold">
              Nombre de un producto suelto
            </label>
            <input
              id={`${id}-singular`}
              value={ed.singular}
              onChange={(e) => set({ singular: e.target.value })}
              aria-describedby={`${id}-singular-ayuda`}
              placeholder="Ej.: Carpa"
              className="campo-dp"
            />
            <p id={`${id}-singular-ayuda`} className="text-sm text-gris">
              Opcional. Va delante del modelo: «Carpa Doite Kailas».
            </p>
          </div>
        ) : null}
      </div>

      {esSub && ed.id ? (
        <div className="grid gap-2">
          <label htmlFor={`${id}-madre`} className="text-sm font-semibold">
            Categoría madre
          </label>
          <select
            id={`${id}-madre`}
            value={ed.padreId ?? ""}
            onChange={(e) => set({ padreId: e.target.value })}
            className="campo-dp max-w-[320px]"
          >
            {madres.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="grid gap-2">
        <label htmlFor={`${id}-slug`} className="text-sm font-semibold">
          Dirección
        </label>
        <div className="flex items-center gap-1 font-dpmono text-sm">
          <span className="text-gris">/{esSub && madreActual ? `${madreActual.slug}/` : ""}</span>
          <input
            id={`${id}-slug`}
            value={ed.slug}
            onChange={(e) => set({ slug: e.target.value.toLowerCase(), slugTocado: true })}
            aria-describedby={`${id}-slug-ayuda`}
            className="campo-dp max-w-[320px]"
          />
        </div>
        <p id={`${id}-slug-ayuda`} className="text-sm text-gris">
          {ed.id
            ? "Si la cambiás, los enlaces viejos a esta página dejan de funcionar."
            : "Se arma sola con el nombre; podés cambiarla."}
        </p>
      </div>

      <div className="grid gap-2">
        <label htmlFor={`${id}-desc`} className="text-sm font-semibold">
          Descripción
        </label>
        <textarea
          id={`${id}-desc`}
          rows={2}
          value={ed.descripcion}
          onChange={(e) => set({ descripcion: e.target.value })}
          aria-describedby={`${id}-desc-ayuda`}
          className="campo-dp"
        />
        <p id={`${id}-desc-ayuda`} className="text-sm text-gris">
          Opcional. Se muestra arriba de la sección y es el texto que lee Google.
        </p>
      </div>

      {esSub ? (
        <div className="grid gap-2">
          <label htmlFor={`${id}-ficha`} className="text-sm font-semibold">
            Ficha técnica
          </label>
          <select
            id={`${id}-ficha`}
            value={ed.ficha}
            onChange={(e) => set({ ficha: e.target.value as Ficha | "" })}
            aria-describedby={`${id}-ficha-ayuda`}
            className="campo-dp max-w-[320px]"
          >
            {FICHAS.map((f) => (
              <option key={f.valor} value={f.valor}>
                {f.texto}
              </option>
            ))}
          </select>
          <p id={`${id}-ficha-ayuda`} className="text-sm text-gris">
            Con ficha, los productos se comparan en una tabla; sin ficha, se muestran en tarjetas con foto.
          </p>
        </div>
      ) : null}

      <label className="flex items-center gap-3">
        <input type="checkbox" checked={ed.visible} onChange={(e) => set({ visible: e.target.checked })} />
        <span>Visible en el sitio</span>
      </label>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={ocupado} className="boton-admin">
          {ocupado ? "Guardando…" : "Guardar"}
        </button>
        <button type="button" onClick={onCancelar} className="boton-admin boton-admin--sec">
          Cancelar
        </button>
      </div>
    </form>
  );
}
