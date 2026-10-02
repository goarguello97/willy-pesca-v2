import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  CATEGORIAS,
  SELECT_PRODUCTO,
  desdeFila,
  formatearPrecio,
  type Categoria,
  type FilaProducto,
} from "../dp/catalogo";
import { MAXIMO_FOTOS, borrarArchivos, subirImagen } from "./imagenes";
import { useSesion } from "./sesion";

type Foto =
  | { tipo: "guardada"; id: string; url: string; ruta: string | null }
  | { tipo: "nueva"; clave: string; archivo: File; vista: string };

type Formulario = {
  categoria: Categoria;
  marca: string;
  nombre: string;
  precio: string;
  descripcion: string;
  reelTipo: string;
  rulemanes: string;
  largo: string;
  canaArmado: string;
  destacado: boolean;
  publicado: boolean;
};

const VACIO: Formulario = {
  categoria: "reel",
  marca: "",
  nombre: "",
  precio: "",
  descripcion: "",
  reelTipo: "",
  rulemanes: "",
  largo: "",
  canaArmado: "",
  destacado: false,
  publicado: true,
};

// "45.000", "$ 45000" o "45000,50" → 45000 / 45000.5. Vacío → null.
function leerPrecio(texto: string): number | null | "invalido" {
  const limpio = texto.replace(/[$\s]/g, "");
  if (!limpio) return null;
  const n = Number(limpio.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : "invalido";
}

// "2,40" o "2.4" → 2.4 (metros).
function leerLargo(texto: string): number | null | "invalido" {
  const limpio = texto.replace(/m$/i, "").trim();
  if (!limpio) return null;
  const n = Number(limpio.replace(",", "."));
  return Number.isFinite(n) && n > 0 && n < 100 ? n : "invalido";
}

function leerEntero(texto: string): number | null | "invalido" {
  if (!texto.trim()) return null;
  const n = Number(texto);
  return Number.isInteger(n) && n >= 0 ? n : "invalido";
}

export function EditorProducto({ id }: { id: string }) {
  const nuevo = id === "nuevo";
  const { sb } = useSesion();
  const navigate = useNavigate();
  const [form, setForm] = useState<Formulario>(VACIO);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [quitadas, setQuitadas] = useState<Array<{ id: string; ruta: string | null }>>([]);
  const [cargando, setCargando] = useState(!nuevo);
  const [guardando, setGuardando] = useState<string | null>(null);
  const [errores, setErrores] = useState<Partial<Record<keyof Formulario | "fotos" | "general", string>>>({});
  const vistas = useRef<string[]>([]);

  useEffect(() => {
    if (nuevo) return;
    let vivo = true;
    sb.from("productos")
      .select(SELECT_PRODUCTO)
      .eq("id", id)
      .returns<FilaProducto[]>()
      .maybeSingle()
      .then(({ data, error }) => {
        if (!vivo) return;
        setCargando(false);
        if (error || !data) {
          setErrores({ general: error ? error.message : "No existe ese producto." });
          return;
        }
        const p = desdeFila(data as unknown as FilaProducto);
        setForm({
          categoria: p.categoria,
          marca: p.marca ?? "",
          nombre: p.nombre,
          precio: p.precio === null ? "" : String(p.precio).replace(".", ","),
          descripcion: p.descripcion ?? "",
          reelTipo: p.reelTipo ?? "",
          rulemanes: p.rulemanes === null ? "" : String(p.rulemanes),
          largo: p.largoM === null ? "" : String(p.largoM).replace(".", ","),
          canaArmado: p.canaArmado ?? "",
          destacado: p.destacado,
          publicado: p.publicado,
        });
        setFotos(p.imagenes.map((i) => ({ tipo: "guardada", id: i.id, url: i.url, ruta: i.ruta })));
      });
    return () => {
      vivo = false;
    };
  }, [sb, id, nuevo]);

  // Libera las vistas previas locales al salir.
  useEffect(() => () => vistas.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const campo = <K extends keyof Formulario>(k: K, v: Formulario[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const agregarFotos = (lista: FileList | null) => {
    if (!lista) return;
    const libres = MAXIMO_FOTOS - fotos.length;
    const archivos = Array.from(lista).slice(0, Math.max(0, libres));
    const nuevas: Foto[] = archivos.map((archivo) => {
      const vista = URL.createObjectURL(archivo);
      vistas.current.push(vista);
      return { tipo: "nueva", clave: crypto.randomUUID(), archivo, vista };
    });
    setFotos((f) => [...f, ...nuevas]);
    setErrores((e) => ({
      ...e,
      fotos: lista.length > archivos.length ? `Máximo ${MAXIMO_FOTOS} fotos por producto.` : undefined,
    }));
  };

  const mover = (i: number, paso: -1 | 1) =>
    setFotos((f) => {
      const j = i + paso;
      if (j < 0 || j >= f.length) return f;
      const copia = [...f];
      [copia[i], copia[j]] = [copia[j], copia[i]];
      return copia;
    });

  const quitar = (i: number) => {
    const foto = fotos[i];
    if (foto?.tipo === "guardada") setQuitadas((q) => [...q, { id: foto.id, ruta: foto.ruta }]);
    setFotos((f) => f.filter((_, k) => k !== i));
  };

  const guardar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const precio = leerPrecio(form.precio);
    const rulemanes = leerEntero(form.rulemanes);
    const largo = leerLargo(form.largo);
    const errs: typeof errores = {};
    if (!form.nombre.trim()) errs.nombre = "Poné el nombre o modelo.";
    if (precio === "invalido") errs.precio = "Escribí solo números, por ejemplo 45000.";
    if (form.categoria === "reel" && rulemanes === "invalido") errs.rulemanes = "Tiene que ser un número entero.";
    if (form.categoria === "cana" && largo === "invalido") errs.largo = "Escribí el largo en metros, por ejemplo 2,40.";
    setErrores(errs);
    if (Object.keys(errs).length) return;

    const fila = {
      categoria: form.categoria,
      marca: form.marca.trim() || null,
      nombre: form.nombre.trim(),
      precio: precio as number | null,
      descripcion: form.descripcion.trim() || null,
      reel_tipo: form.categoria === "reel" ? form.reelTipo.trim() || null : null,
      rulemanes: form.categoria === "reel" ? (rulemanes as number | null) : null,
      largo_m: form.categoria === "cana" ? (largo as number | null) : null,
      cana_armado: form.categoria === "cana" ? form.canaArmado.trim() || null : null,
      destacado: form.destacado,
      publicado: form.publicado,
    };

    let idProducto = id;
    try {
      setGuardando("Guardando datos…");
      if (nuevo) {
        const { data, error } = await sb.from("productos").insert(fila).select("id").single();
        if (error) throw new Error(error.message);
        idProducto = data.id as string;
      } else {
        const { error } = await sb.from("productos").update(fila).eq("id", id);
        if (error) throw new Error(error.message);
      }

      if (quitadas.length) {
        setGuardando("Borrando fotos quitadas…");
        await borrarArchivos(sb, quitadas.map((q) => q.ruta));
        const { error } = await sb.from("producto_imagenes").delete().in("id", quitadas.map((q) => q.id));
        if (error) throw new Error(error.message);
        setQuitadas([]);
      }

      const total = fotos.filter((f) => f.tipo === "nueva").length;
      let subidas = 0;
      for (const [orden, foto] of fotos.entries()) {
        if (foto.tipo === "nueva") {
          setGuardando(`Subiendo fotos ${++subidas}/${total}…`);
          const { url, ruta } = await subirImagen(sb, idProducto, foto.archivo);
          const { data, error } = await sb
            .from("producto_imagenes")
            .insert({ producto_id: idProducto, url, ruta, orden })
            .select("id")
            .single();
          if (error) throw new Error(error.message);
          // Ya subida: si algo falla más adelante, el reintento no la duplica.
          const guardada: Foto = { tipo: "guardada", id: data.id as string, url, ruta };
          setFotos((fs) => fs.map((x) => (x.tipo === "nueva" && x.clave === foto.clave ? guardada : x)));
        } else {
          const { error } = await sb.from("producto_imagenes").update({ orden }).eq("id", foto.id);
          if (error) throw new Error(error.message);
        }
      }
      navigate({ to: "/admin" });
    } catch (err) {
      setGuardando(null);
      setErrores({ general: `No se pudo guardar: ${(err as Error).message}` });
      // Si el producto ya se creó, seguimos sobre él para no duplicarlo al reintentar.
      if (nuevo && idProducto !== "nuevo") {
        navigate({ to: "/admin/producto/$id", params: { id: idProducto }, replace: true });
      }
    }
  };

  if (cargando) return <p className="text-gris">Cargando producto…</p>;

  const precioLeido = leerPrecio(form.precio);

  return (
    <form onSubmit={guardar} noValidate className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="grid content-start gap-6">
        <div>
          <Link to="/admin" className="font-dpmono text-sm underline underline-offset-4">
            Volver a productos
          </Link>
          <h1 className="cond mt-3 text-5xl leading-none">{nuevo ? "Nuevo producto" : "Editar producto"}</h1>
        </div>

        {errores.general ? (
          <p role="alert" className="border border-error/40 bg-tarjeta px-4 py-3 text-sm text-error">
            {errores.general}
          </p>
        ) : null}

        <Seccion titulo="Datos">
          <Campo etiqueta="Categoría">
            {(idc) => (
              <select
                id={idc}
                value={form.categoria}
                onChange={(e) => campo("categoria", e.target.value as Categoria)}
                className="campo-dp"
              >
                {CATEGORIAS.map((c) => (
                  <option key={c.valor} value={c.valor}>
                    {c.singular}
                  </option>
                ))}
              </select>
            )}
          </Campo>
          <div className="grid gap-5 sm:grid-cols-2">
            <Campo etiqueta="Marca" ayuda="Opcional. Ej.: Spinit">
              {(idc) => (
                <input id={idc} value={form.marca} onChange={(e) => campo("marca", e.target.value)} className="campo-dp" />
              )}
            </Campo>
            <Campo etiqueta="Nombre o modelo" error={errores.nombre}>
              {(idc, desc) => (
                <input
                  id={idc}
                  value={form.nombre}
                  onChange={(e) => campo("nombre", e.target.value)}
                  aria-invalid={errores.nombre ? true : undefined}
                  aria-describedby={desc}
                  className="campo-dp"
                />
              )}
            </Campo>
          </div>
          <Campo
            etiqueta="Precio"
            error={errores.precio}
            ayuda={
              typeof precioLeido === "number"
                ? `Se verá como ${formatearPrecio(precioLeido)}.`
                : "Opcional. Si lo dejás vacío, se muestra «Consultar»."
            }
          >
            {(idc, desc) => (
              <input
                id={idc}
                inputMode="decimal"
                value={form.precio}
                onChange={(e) => campo("precio", e.target.value)}
                aria-invalid={errores.precio ? true : undefined}
                aria-describedby={desc}
                placeholder="Ej.: 45000"
                className="campo-dp max-w-[240px]"
              />
            )}
          </Campo>
          <Campo etiqueta="Descripción" ayuda="Opcional. Se muestra en el comparador para accesorios y camping.">
            {(idc, desc) => (
              <textarea
                id={idc}
                rows={4}
                value={form.descripcion}
                onChange={(e) => campo("descripcion", e.target.value)}
                aria-describedby={desc}
                className="campo-dp"
              />
            )}
          </Campo>
        </Seccion>

        {form.categoria === "reel" ? (
          <Seccion titulo="Ficha técnica">
            <div className="grid gap-5 sm:grid-cols-2">
              <Campo etiqueta="Tipo" ayuda="Ej.: frontal, rotativo">
                {(idc, desc) => (
                  <>
                    <input
                      id={idc}
                      list="tipos-reel"
                      value={form.reelTipo}
                      onChange={(e) => campo("reelTipo", e.target.value)}
                      aria-describedby={desc}
                      className="campo-dp"
                    />
                    <datalist id="tipos-reel">
                      <option value="frontal" />
                      <option value="rotativo" />
                      <option value="baitcasting" />
                    </datalist>
                  </>
                )}
              </Campo>
              <Campo etiqueta="Rulemanes" error={errores.rulemanes}>
                {(idc, desc) => (
                  <input
                    id={idc}
                    inputMode="numeric"
                    value={form.rulemanes}
                    onChange={(e) => campo("rulemanes", e.target.value)}
                    aria-invalid={errores.rulemanes ? true : undefined}
                    aria-describedby={desc}
                    className="campo-dp"
                  />
                )}
              </Campo>
            </div>
          </Seccion>
        ) : null}

        {form.categoria === "cana" ? (
          <Seccion titulo="Ficha técnica">
            <div className="grid gap-5 sm:grid-cols-2">
              <Campo etiqueta="Largo (metros)" error={errores.largo} ayuda="Ej.: 2,40">
                {(idc, desc) => (
                  <input
                    id={idc}
                    inputMode="decimal"
                    value={form.largo}
                    onChange={(e) => campo("largo", e.target.value)}
                    aria-invalid={errores.largo ? true : undefined}
                    aria-describedby={desc}
                    className="campo-dp"
                  />
                )}
              </Campo>
              <Campo etiqueta="Armado" ayuda="Ej.: telescópica, 2 tramos">
                {(idc, desc) => (
                  <>
                    <input
                      id={idc}
                      list="armados-cana"
                      value={form.canaArmado}
                      onChange={(e) => campo("canaArmado", e.target.value)}
                      aria-describedby={desc}
                      className="campo-dp"
                    />
                    <datalist id="armados-cana">
                      <option value="telescópica" />
                      <option value="2 tramos" />
                      <option value="3 tramos" />
                      <option value="enteriza" />
                    </datalist>
                  </>
                )}
              </Campo>
            </div>
          </Seccion>
        ) : null}

        <Seccion titulo="Fotos">
          <p className="text-sm text-gris">
            La primera es la principal. Se achican y comprimen solas antes de subirse.
          </p>
          {fotos.length ? (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {fotos.map((f, i) => (
                <li key={f.tipo === "guardada" ? f.id : f.clave} className="border border-filete bg-blanco">
                  <div className="relative">
                    <img
                      src={f.tipo === "guardada" ? f.url : f.vista}
                      alt={`Foto ${i + 1}`}
                      className="aspect-square w-full object-cover"
                    />
                    {i === 0 ? (
                      <span className="absolute left-0 top-0 bg-cobalto px-2 py-1 font-dpmono text-[11px] text-white">
                        Principal
                      </span>
                    ) : null}
                  </div>
                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => mover(i, -1)}
                      disabled={i === 0}
                      className="boton-foto"
                      aria-label={`Mover la foto ${i + 1} antes`}
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => mover(i, 1)}
                      disabled={i === fotos.length - 1}
                      className="boton-foto"
                      aria-label={`Mover la foto ${i + 1} después`}
                    >
                      →
                    </button>
                    <button
                      type="button"
                      onClick={() => quitar(i)}
                      className="boton-foto boton-foto--quitar"
                      aria-label={`Quitar la foto ${i + 1}`}
                    >
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
          {fotos.length < MAXIMO_FOTOS ? (
            <label className="boton-admin boton-admin--sec w-fit cursor-pointer">
              Agregar fotos
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                onChange={(e) => {
                  agregarFotos(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          ) : null}
          {errores.fotos ? <p className="text-sm text-error">{errores.fotos}</p> : null}
        </Seccion>
      </div>

      <aside className="grid content-start gap-6 lg:sticky lg:top-6 lg:self-start">
        <Seccion titulo="Visibilidad">
          <Interruptor
            etiqueta="Publicado"
            ayuda="Si está apagado queda como borrador y no se ve en el sitio."
            valor={form.publicado}
            onCambio={(v) => campo("publicado", v)}
          />
          <Interruptor
            etiqueta="En la vitrina"
            ayuda="Aparece en la portada, junto a los demás destacados."
            valor={form.destacado}
            onCambio={(v) => campo("destacado", v)}
          />
        </Seccion>
        <button type="submit" disabled={guardando !== null} className="boton-admin w-full justify-center">
          {guardando ?? "Guardar"}
        </button>
      </aside>
    </form>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="grid gap-5 border border-filete bg-tarjeta p-5 md:p-6">
      <h2 className="cond text-2xl leading-none">{titulo}</h2>
      {children}
    </section>
  );
}

function Campo({
  etiqueta,
  ayuda,
  error,
  children,
}: {
  etiqueta: string;
  ayuda?: string;
  error?: string;
  children: (id: string, descripcion: string | undefined) => ReactNode;
}) {
  const idc = useId();
  const desc = error || ayuda ? `${idc}-desc` : undefined;
  return (
    <div className="grid gap-2">
      <label htmlFor={idc} className="text-sm font-semibold">
        {etiqueta}
      </label>
      {children(idc, desc)}
      {error ? (
        <p id={desc} className="text-sm font-medium text-error">
          {error}
        </p>
      ) : ayuda ? (
        <p id={desc} className="text-sm text-gris">
          {ayuda}
        </p>
      ) : null}
    </div>
  );
}

function Interruptor({
  etiqueta,
  ayuda,
  valor,
  onCambio,
}: {
  etiqueta: string;
  ayuda: string;
  valor: boolean;
  onCambio: (v: boolean) => void;
}) {
  return (
    <label className="interruptor">
      <input type="checkbox" checked={valor} onChange={(e) => onCambio(e.target.checked)} />
      <span className="interruptor__pista" aria-hidden="true" />
      <span>
        <span className="block font-semibold">{etiqueta}</span>
        <span className="block text-sm text-gris">{ayuda}</span>
      </span>
    </label>
  );
}
