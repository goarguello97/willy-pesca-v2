import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Datos públicos del proyecto de Supabase. La clave publishable está pensada
// para el navegador: lo que protege la base son las políticas RLS
// (supabase/01_esquema.sql), no esconder esta clave.
const URL_SUPABASE = import.meta.env.VITE_SUPABASE_URL;
const CLAVE_PUBLICA = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigurado = Boolean(URL_SUPABASE && CLAVE_PUBLICA);

let clienteNavegador: SupabaseClient | null = null;

/** Cliente con sesión (login con Google), solo para el panel en el navegador. */
export function supabaseNavegador(): SupabaseClient {
  if (!URL_SUPABASE || !CLAVE_PUBLICA) {
    throw new Error("Falta configurar Supabase: VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY.");
  }
  clienteNavegador ??= createClient(URL_SUPABASE, CLAVE_PUBLICA, {
    auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return clienteNavegador;
}

/** Cliente sin sesión para leer el catálogo publicado desde el servidor. */
export function supabaseServidor(): SupabaseClient | null {
  if (!URL_SUPABASE || !CLAVE_PUBLICA) return null;
  return createClient(URL_SUPABASE, CLAVE_PUBLICA, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
