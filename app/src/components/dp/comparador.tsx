import { useId, useState } from "react";
import { PRODUCTOS, enlaceWhatsapp, mensajeConsulta, type Categoria } from "./datos";
import { Flecha } from "./marca";

const PESTANAS: Array<{ valor: Categoria; texto: string; columnas: [string, string] }> = [
  { valor: "reel", texto: "Reels", columnas: ["Tipo", "Rulemanes"] },
  { valor: "cana", texto: "Cañas", columnas: ["Largo", "Armado"] },
];

export function Comparador() {
  const [cat, setCat] = useState<Categoria>("reel");
  const base = useId();
  const pestana = PESTANAS.find((t) => t.valor === cat)!;
  const filas = PRODUCTOS.filter((p) => p.categoria === cat);

  return (
    <section id="comparador" aria-labelledby="titulo-comparador" className="scroll-mt-16 border-b border-filete">
      <div className="mx-auto max-w-[1280px] px-4 py-20 md:px-8 md:py-28">
        <h2 id="titulo-comparador" className="cond text-5xl leading-none md:text-7xl">
          Comparador
        </h2>
        <p className="mt-4 max-w-[58ch] text-lg leading-relaxed text-gris">
          Todos los equipos con su ficha, lado a lado. Fotos reales; precio y stock por WhatsApp.
        </p>

        <div role="tablist" aria-label="Tipo de equipo" className="pestanas mt-10">
          {PESTANAS.map((t) => (
            <button
              key={t.valor}
              type="button"
              role="tab"
              id={`${base}-${t.valor}`}
              aria-selected={cat === t.valor}
              aria-controls={`${base}-panel`}
              className="pestana"
              onClick={() => setCat(t.valor)}
            >
              {t.texto}
            </button>
          ))}
        </div>

        <div id={`${base}-panel`} role="tabpanel" aria-labelledby={`${base}-${cat}`} className="mt-6">
          <table className="tabla">
            <thead>
              <tr>
                <th scope="col" colSpan={2}>
                  Equipo
                </th>
                <th scope="col">{pestana.columnas[0]}</th>
                <th scope="col">{pestana.columnas[1]}</th>
                <th scope="col">
                  <span className="sr-only">Consulta</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filas.map((p) => {
                const [a, b] =
                  cat === "reel" ? [p.ficha[1], p.ficha[0].split(" ")[0]] : [p.ficha[0], p.ficha[1]];
                return (
                  <tr key={p.id}>
                    <td className="w-[88px]">
                      <img
                        src={p.foto}
                        alt=""
                        width={64}
                        height={64}
                        loading="lazy"
                        decoding="async"
                        className="h-16 w-16 border border-filete object-cover"
                      />
                    </td>
                    <td>
                      <span className="cond text-2xl leading-none">{p.marca}</span>{" "}
                      <span className="text-lg font-semibold">{p.modelo}</span>
                    </td>
                    <td data-dato={pestana.columnas[0]} className="font-dpmono text-sm">
                      {a}
                    </td>
                    <td data-dato={pestana.columnas[1]} className="font-dpmono text-sm">
                      {b}
                    </td>
                    <td className="md:text-right">
                      <a
                        href={enlaceWhatsapp(mensajeConsulta(p))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="consultar-fila mt-2 md:mt-0"
                        aria-label={`Consultar por ${p.marca} ${p.modelo}`}
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
      </div>
    </section>
  );
}
