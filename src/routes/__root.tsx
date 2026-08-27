import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { ThemeProvider } from "@/lib/theme";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { JsonLd } from "@/components/json-ld";
import { AppErrorComponent } from "@/lib/error-component";
import {
  DEFAULT_DESCRIPTION,
  personJsonLd,
  SITE_NAME,
  websiteJsonLd,
} from "@/lib/seo";
import appCss from "../styles.css?url";

const THEME_BOOT = `(function(){var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);else if(window.matchMedia("(prefers-color-scheme: light)").matches)document.documentElement.setAttribute("data-theme","light");else document.documentElement.setAttribute("data-theme","dark");})();`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: SITE_NAME },
      { name: "description", content: DEFAULT_DESCRIPTION },
      { name: "theme-color", content: "#0c0d11" },
      { name: "author", content: "Damian Vink" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
    ],
  }),
  errorComponent: AppErrorComponent,
  notFoundComponent: NotFound,
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="nl" data-theme="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <JsonLd data={personJsonLd} />
        <JsonLd data={websiteJsonLd} />
        <PreviewHostBridge />
        <AuthProvider>
          <ThemeProvider>
            <a
              href="#inhoud"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-fg"
            >
              Ga naar inhoud
            </a>
            <Outlet />
          </ThemeProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  return (
    <div
      id="inhoud"
      className="flex min-h-dvh flex-col items-center justify-center bg-paper px-6 text-center text-ink"
    >
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">404</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
        Pagina niet <span className="text-accent">gevonden.</span>
      </h1>
      <p className="mt-3 max-w-md text-muted">
        Dit pad bestaat niet. Terug naar home, of naar de engineering toolkit.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <a href="/" className="text-sm text-accent hover:underline">
          Home
        </a>
        <a href="/denk/toolkit" className="text-sm text-accent hover:underline">
          Toolkit
        </a>
      </div>
    </div>
  );
}
