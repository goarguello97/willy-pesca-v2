import { Tarjeta } from "./ficha-producto";
import type { Producto } from "./catalogo";
import { enlaceWhatsapp } from "./datos";
import { Flecha } from "./marca";

// Muestra los productos cargados con la categoría "camping" en el panel.
export function Camping({ productos }: { productos: Producto[] }) {
  const items = productos.filter((p) => p.categoria === "camping");
  return (
    <section id="camping" aria-labelledby="titulo-camping" className="scroll-mt-16 border-b border-filete">
      <div className="mx-auto max-w-[1280px] px-4 py-20 md:px-8 md:py-28">
        <h2 id="titulo-camping" className="cond text-5xl leading-none md:text-7xl">
          Camping
        </h2>
        <p className="mt-4 max-w-[58ch] text-lg leading-relaxed text-gris">
          Todo para acampar y completar la salida de pesca.
        </p>
        {items.length ? (
          <ul className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {items.map((p) => (
              <li key={p.id}>
                <Tarjeta producto={p} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 max-w-[620px] border border-filete bg-tarjeta px-5 py-6">
            <p className="text-lg">Estamos sumando artículos de camping. Si buscás algo en particular, consultanos.</p>
            <a
              href={enlaceWhatsapp("Hola Willy, quiero consultar por artículos de camping.")}
              target="_blank"
              rel="noopener noreferrer"
              className="consultar-fila mt-4"
            >
              Escribinos
              <Flecha className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
