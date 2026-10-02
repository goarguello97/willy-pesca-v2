import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LogoWilly } from "../dp/logo-willy";
import { useSesion } from "./sesion";

export function MarcoPanel({ children }: { children: ReactNode }) {
  const { email, salir } = useSesion();
  return (
    <div className="min-h-dvh bg-blanco">
      <header className="bg-tinta text-white">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between gap-4 px-4 md:px-8">
          <Link to="/admin" className="flex min-w-0 items-center gap-2.5" aria-label="Panel, inicio">
            <LogoWilly variante="icono" figura="#ffffff" fondo="#0c1424" className="h-8 w-auto shrink-0" />
            <span className="cond text-xl leading-none">Panel</span>
          </Link>
          <div className="flex items-center gap-5 text-sm">
            <span className="hidden truncate text-white/60 md:inline">{email}</span>
            <Link to="/" className="text-white/85 hover:text-white">
              Ver sitio
            </Link>
            <button type="button" onClick={salir} className="font-semibold text-white hover:underline">
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1100px] px-4 py-10 md:px-8">{children}</main>
    </div>
  );
}
