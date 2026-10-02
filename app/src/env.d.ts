interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_GOOGLE_SITE_VERIFICATION?: string;
  readonly VITE_IMAGENES_VERCEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
