import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { Link } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { siGoogle } from "simple-icons";
import { LogoWilly } from "../dp/logo-willy";
import { supabaseConfigurado, supabaseNavegador } from "../../lib/supabase";

type Estado =
  | { fase: "sin-config" }
  | { fase: "cargando" }
  | { fase: "afuera"; error: string | null }
  | { fase: "sin-permiso"; email: string }
  | { fase: "adentro"; email: string };

type Sesion = { sb: SupabaseClient; email: string; salir: () => Promise<void> };

const ContextoSesion = createContext<Sesion | null>(null);

/** Cliente de Supabase y datos del admin logueado (solo dentro del panel). */
export function useSesion(): Sesion {
  const s = useContext(ContextoSesion);
  if (!s) throw new Error("useSesion se usa dentro de <PuertaAdmin>");
  return s;
}

// Error que devuelve Supabase/Google en la URL al volver del login.
function errorDeLaUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const desc = params.get("error_description") ?? hash.get("error_description");
  if (!desc) return null;
  return /signups? not allowed/i.test(desc)
    ? "Esta cuenta de Google no está habilitada para el panel."
    : desc.replace(/\+/g, " ");
}

/** Muestra el panel solo a las cuentas de Google habilitadas en public.admins. */
export function PuertaAdmin({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>(
    supabaseConfigurado ? { fase: "cargando" } : { fase: "sin-config" },
  );

  useEffect(() => {
    if (!supabaseConfigurado) return;
    const sb = supabaseNavegador();
    let vivo = true;

    const evaluar = async (sesion: Session | null) => {
      if (!sesion) {
        if (vivo) setEstado({ fase: "afuera", error: errorDeLaUrl() });
        return;
      }
      // Limpia el ?code= que deja el regreso de Google.
      if (window.location.search) window.history.replaceState(null, "", window.location.pathname);
      const email = sesion.user.email ?? "";
      const { data, error } = await sb.rpc("es_admin");
      if (!vivo) return;
      setEstado(!error && data === true ? { fase: "adentro", email } : { fase: "sin-permiso", email });
    };

    sb.auth.getSession().then(({ data }) => evaluar(data.session));
    // No se llama a Supabase dentro del callback (puede trabarse): se difiere.
    const { data: sub } = sb.auth.onAuthStateChange((evento, sesion) => {
      if (evento === "SIGNED_IN" || evento === "SIGNED_OUT") setTimeout(() => evaluar(sesion), 0);
    });
    return () => {
      vivo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (estado.fase === "adentro") {
    const sb = supabaseNavegador();
    const sesion: Sesion = {
      sb,
      email: estado.email,
      salir: async () => {
        await sb.auth.signOut();
      },
    };
    return <ContextoSesion.Provider value={sesion}>{children}</ContextoSesion.Provider>;
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-blanco px-4 py-12">
      <div className="w-full max-w-[420px] border border-filete bg-tarjeta p-8">
        <LogoWilly variante="icono" figura="#0c1424" fondo="#ffffff" className="h-12 w-auto" />
        <h1 className="cond mt-6 text-4xl leading-none">Panel de administración</h1>
        {estado.fase === "cargando" ? (
          <p className="mt-4 text-gris">Revisando la sesión…</p>
        ) : null}
        {estado.fase === "sin-config" ? (
          <p className="mt-4 leading-relaxed text-gris">
            Falta conectar Supabase. Cargá VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY en las
            variables de entorno y volvé a desplegar.
          </p>
        ) : null}
        {estado.fase === "afuera" ? <Ingreso error={estado.error} /> : null}
        {estado.fase === "sin-permiso" ? <SinPermiso email={estado.email} /> : null}
        <Link to="/" className="mt-8 inline-block font-dpmono text-sm underline underline-offset-4">
          Volver al sitio
        </Link>
      </div>
    </main>
  );
}

function Ingreso({ error }: { error: string | null }) {
  const [yendo, setYendo] = useState(false);
  const [fallo, setFallo] = useState<string | null>(error);

  const ingresar = async () => {
    setYendo(true);
    setFallo(null);
    const { error: e } = await supabaseNavegador().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/admin`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (e) {
      setFallo(e.message);
      setYendo(false);
    }
  };

  return (
    <>
      <p className="mt-4 leading-relaxed text-gris">Ingresá con la cuenta de Google habilitada.</p>
      <button type="button" onClick={ingresar} disabled={yendo} className="boton-google mt-6">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="currentColor">
          <path d={siGoogle.path} />
        </svg>
        {yendo ? "Abriendo Google…" : "Ingresar con Google"}
      </button>
      {fallo ? (
        <p role="alert" className="mt-4 text-sm font-medium text-error">
          {fallo}
        </p>
      ) : null}
    </>
  );
}

function SinPermiso({ email }: { email: string }) {
  return (
    <>
      <p role="alert" className="mt-4 leading-relaxed">
        La cuenta <strong>{email}</strong> no tiene permiso para administrar el sitio.
      </p>
      <button
        type="button"
        onClick={() => supabaseNavegador().auth.signOut()}
        className="boton-admin boton-admin--sec mt-6"
      >
        Usar otra cuenta
      </button>
    </>
  );
}
