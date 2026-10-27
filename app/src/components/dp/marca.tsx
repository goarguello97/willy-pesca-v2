import { siInstagram, siWhatsapp } from "simple-icons";

// Isotipo: el pulso del logo de Willy que sube por la caña y termina en anzuelo.
export function Isotipo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}>
      <path
        d="M3 42h13l3-7 4 15 5-24 4 20 3-4h8"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <path d="M43 42C47 26 52 15 60 8" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
      <path d="M60 8v19" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M60 27v6a3.5 3.5 0 0 1-7 0v-2"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

// Logo metálico oficial (marca/willy-pesca-metalico.png). Solo en tamaño grande:
// a menos de ~200 px se vuelve una mancha; ahí va LogoWilly.
// "recortado": sin fondo, en acero oscuro, para fondos claros (el hero).
// "fundido": sobre la tinta; usa una copia con el fondo llevado a negro puro,
// que desaparece con mix-blend-mode: screen.
export function LogoMetalico({
  estilo,
  className,
  prioridad = false,
}: {
  estilo: "recortado" | "fundido";
  className?: string;
  prioridad?: boolean;
}) {
  return (
    <img
      src={`/marca/willy-pesca-metalico-${estilo}.webp`}
      alt="Willy Pesca y Camping, artículos de pesca y camping"
      width={estilo === "recortado" ? 626 : 673}
      height={estilo === "recortado" ? 444 : 476}
      loading={prioridad ? "eager" : "lazy"}
      decoding="async"
      className={`logo-metalico logo-metalico--${estilo} ${className ?? ""}`}
    />
  );
}

export function Marca({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <Isotipo className="h-8 w-8 shrink-0" />
      <span className="font-wp text-lg font-bold leading-none tracking-tight">
        Willy Pesca
        <span className="sr-only"> y Camping</span>
      </span>
    </span>
  );
}

export function GlifoWhatsapp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d={siWhatsapp.path} />
    </svg>
  );
}

export function GlifoInstagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d={siInstagram.path} />
    </svg>
  );
}

export function Flecha({ className, rotar = 0 }: { className?: string; rotar?: number }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
      style={rotar ? { transform: `rotate(${rotar}deg)` } : undefined}
    >
      <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" />
    </svg>
  );
}

export function Anzuelo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M10 1v14a4.5 4.5 0 0 1-9 0v-3l3 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
      <circle cx="10" cy="2.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
