import { useId, useState, type FormEvent } from "react";
import { imagen } from "./catalogo";
import { enlaceWhatsapp } from "./datos";
import { Flecha } from "./marca";

const ARREGLOS = ["Ataduras y empatillado", "Pasahilos", "Puntera rota", "Mango o portarreel", "Otro"];

export function Taller() {
  const [elegidos, setElegidos] = useState<string[]>([]);
  const [detalle, setDetalle] = useState("");
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState<string | null>(null);
  const idDetalle = useId();
  const idNombre = useId();
  const idError = useId();

  const alternar = (a: string) =>
    setElegidos((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (elegidos.length === 0 && detalle.trim().length < 4) {
      setError("Marcá qué le pasa a la caña o contalo en el detalle.");
      return;
    }
    setError(null);
    const partes = [
      `Hola Willy${nombre.trim() ? `, soy ${nombre.trim()}` : ""}. Quiero consultar por un arreglo.`,
      elegidos.length ? `Arreglo: ${elegidos.join(", ")}.` : "",
      detalle.trim() ? `Detalle: ${detalle.trim()}` : "",
    ].filter(Boolean);
    window.open(enlaceWhatsapp(partes.join("\n")), "_blank", "noopener,noreferrer");
  };

  return (
    <section id="taller" aria-labelledby="titulo-taller" className="scroll-mt-16 border-b border-filete">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <h2 id="titulo-taller" className="cond text-5xl leading-none md:text-7xl">
            Taller de cañas
          </h2>
          <p className="mt-4 max-w-[44ch] text-lg leading-relaxed text-gris">
            Ataduras, pasahilos, punteras y mangos. Contanos qué le pasó y te pasamos el presupuesto
            por WhatsApp.
          </p>
          <figure className="foto-taller-dp mt-10">
            <img
              src={imagen("/assets/fotos/reparacion-empatillado.jpg", 640)}
              alt="Caña de pesca con una atadura de hilo nueva en el empalme"
              width={361}
              height={640}
              loading="lazy"
              decoding="async"
            />
            <figcaption className="absolute bottom-0 left-0 bg-tinta px-3 py-2 font-dpmono text-xs text-white">
              Atadura hecha en el taller
            </figcaption>
          </figure>
        </div>

        <form onSubmit={enviar} noValidate className="orden self-start lg:col-span-7 lg:mt-24">
          <div className="orden__cabeza">
            <span className="cond text-2xl leading-none">Orden de taller</span>
            <span className="font-dpmono text-xs text-cobalto-claro">Respuesta por WhatsApp</span>
          </div>
          <div className="p-5 md:p-8">
            <fieldset>
              <legend className="text-sm font-semibold">¿Qué le pasa?</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {ARREGLOS.map((a) => (
                  <label key={a} className="chip-arreglo text-[15px]">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={elegidos.includes(a)}
                      onChange={() => alternar(a)}
                    />
                    <span>{a}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-7">
              <label htmlFor={idDetalle} className="text-sm font-semibold">
                Detalle
              </label>
              <textarea
                id={idDetalle}
                rows={4}
                value={detalle}
                onChange={(e) => setDetalle(e.target.value)}
                aria-describedby={error ? idError : undefined}
                aria-invalid={error ? true : undefined}
                className="campo-dp mt-2"
                placeholder="Ej.: se partió el último tramo de una telescópica de 2,40 m."
              />
            </div>

            <div className="mt-6">
              <label htmlFor={idNombre} className="text-sm font-semibold">
                Tu nombre <span className="font-normal text-gris">(opcional)</span>
              </label>
              <input
                id={idNombre}
                type="text"
                autoComplete="given-name"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="campo-dp mt-2"
              />
            </div>

            {error ? (
              <p id={idError} role="alert" className="mt-4 text-sm font-medium text-error">
                {error}
              </p>
            ) : null}

            <button type="submit" className="boton-arreglo mt-8">
              <span className="cond text-2xl">Pedir arreglo</span>
              <span aria-hidden="true">
                <Flecha className="h-5 w-5" />
              </span>
            </button>
            <p className="mt-3 text-sm text-gris">
              Se abre WhatsApp con el mensaje armado. Lo revisás y lo mandás vos.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
