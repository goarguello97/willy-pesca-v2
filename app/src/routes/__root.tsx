import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportHiggsfieldError } from "../lib/higgsfield-error-reporting";
// Page metadata (browser <title>/favicon + social og: tags) committed into the
// repo by the marketplace meta API and read at BUILD time — no runtime fetch.
// Editing it via the app settings UI rewrites this file and redeploys the app.
import appMetaJson from "../app-meta.json";
import { SITE_URL } from "../lib/sitio";
// Fuentes críticas (texto, titulares y la línea mono del hero): se precargan para
// que lleguen junto con el CSS y el hero no salte al cambiar de fuente.
import fuenteTexto from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url";
import fuenteTitulos from "@fontsource/barlow-condensed/files/barlow-condensed-latin-800-italic.woff2?url";
import fuenteMono from "@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2?url";

// Search Console: el valor de la etiqueta de verificación (método "Etiqueta HTML").
const VERIFICACION_GOOGLE = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION;

declare const __HF_DESIGN_INSPECTOR__: boolean;

// Built-in defaults for any field that isn't set in app-meta.json.
const DEFAULT_TITLE = "Willy Pesca y Camping";
const DEFAULT_DESCRIPTION = "Equipos de pesca y reparación de cañas en Los Cóndores, Córdoba.";

type AppMeta = {
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  favicon_url?: string | null;
  og_video_url?: string | null;
};

const appMeta = appMetaJson as AppMeta;

// Build the document head (title / description / og: / twitter: / favicon) from
// app-meta.json, falling back to the defaults above for any unset field.
// og_title/og_description double as the browser <title> and meta description;
// og_image_url (when set) also drives the twitter card + image. Built from
// inline tag literals (conditional spreads for the optional image/favicon) so
// it matches the head() shape TanStack expects.
// favicon/og images live in THIS app's own /assets, so the host is never
// inherent. app-meta.json may carry an absolute higgsfield-app URL with a STALE
// host — baked from the app this one was copied/remixed/renamed from — which would
// serve the wrong app's favicon/og. Strip any higgsfield-app host (prod
// higgsfield.app + dev higgsfield-dev.app) down to a root-relative path so it
// always resolves against whoever serves THIS page (preview / prod / custom
// domain). Genuinely external URLs (a CDN image the owner set) are left absolute.
const APP_HOST_ZONES = ["higgsfield.app", "higgsfield-dev.app"];

function toOwnAssetUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.startsWith("/")) return value; // already root-relative
  try {
    const u = new URL(value);
    const isAppHost = APP_HOST_ZONES.some(
      (zone) => u.hostname === zone || u.hostname.endsWith(`.${zone}`),
    );
    if (isAppHost) return u.pathname + u.search;
    return value; // external host (CDN, etc.) — keep absolute
  } catch {
    return value; // not a parseable URL — leave as-is
  }
}

function buildHead(meta: AppMeta) {
  const title = meta.og_title ?? DEFAULT_TITLE;
  const description = meta.og_description ?? DEFAULT_DESCRIPTION;
  const ogImage = toOwnAssetUrl(meta.og_image_url);
  const favicon = toOwnAssetUrl(meta.favicon_url);
  const ogVideo = toOwnAssetUrl(meta.og_video_url);

  return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title },
      { name: "description", content: description },
      { name: "author", content: "Willy Pesca y Camping" },
      { name: "theme-color", content: "#0c1424" },
      ...(VERIFICACION_GOOGLE ? [{ name: "google-site-verification", content: VERIFICACION_GOOGLE }] : []),
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "es_AR" },
      { property: "og:site_name", content: "Willy Pesca y Camping" },
      { name: "twitter:card", content: ogImage ? "summary_large_image" : "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      ...(ogImage
        ? [
            // Las tarjetas sociales necesitan URL absoluta.
            {
              property: "og:image",
              content: ogImage.startsWith("/") ? `${SITE_URL}${ogImage}` : ogImage,
            },
            {
              name: "twitter:image",
              content: ogImage.startsWith("/") ? `${SITE_URL}${ogImage}` : ogImage,
            },
          ]
        : []),
      // Cover video (og:video) — the animated counterpart of og:image; the
      // Higgsfield feed cards also play it on hover.
      ...(ogVideo ? [{ property: "og:video", content: ogVideo }] : []),
    ],
    links: [
      ...[fuenteTexto, fuenteTitulos, fuenteMono].map((href) => ({
        rel: "preload",
        href,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous" as const,
      })),
      { rel: "stylesheet", href: appCss },
      ...(favicon ? [{ rel: "icon", href: favicon, type: "image/svg+xml" }] : []),
      { rel: "icon", href: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  };
}

function NotFoundComponent() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-blanco px-4">
      <div className="max-w-md">
        <p className="font-dpmono text-sm text-gris">404</p>
        <h1 className="mt-2 cond text-5xl leading-none text-tinta">
          Acá no pica nada
        </h1>
        <p className="mt-4 text-base leading-relaxed text-gris">
          La página que buscás no existe o cambió de lugar.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-12 items-center border-[1.5px] border-tinta px-5 font-dp font-semibold text-tinta hover:bg-tinta hover:text-white"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportHiggsfieldError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-blanco px-4">
      <div className="max-w-md">
        <h1 className="cond text-5xl leading-none text-tinta">
          La página no cargó
        </h1>
        <p className="mt-4 text-base leading-relaxed text-gris">
          Algo falló de nuestro lado. Probá de nuevo o volvé al inicio.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-12 items-center bg-cobalto px-5 font-dp font-semibold text-white"
          >
            Reintentar
          </button>
          <a
            href="/"
            className="inline-flex h-12 items-center border-[1.5px] border-tinta px-5 font-dp font-semibold text-tinta"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </main>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // Read the committed page metadata at build time (no runtime fetch).
  head: () => buildHead(appMeta),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es-AR" style={{ colorScheme: "light" }}>
      {/* Sitio con marca propia: tema claro fijo, sin Quanta ni tema oscuro. */}
      <head>
        <HeadContent />
      </head>
      <body className="bg-blanco text-tinta">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if (!__HF_DESIGN_INSPECTOR__) {
      return;
    }

    void import("../module/design-inspector/runtime")
      .then(({ installHiggsfieldDesignInspector }) => {
        installHiggsfieldDesignInspector();
      })
      .catch((error) => {
        reportHiggsfieldError(
          error instanceof Error ? error : new Error("Failed to load design inspector"),
          {
            boundary: "higgsfield_design_inspector_import",
          },
        );
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
