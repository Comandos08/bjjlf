import { useEffect } from "react";
import { Outlet, Link, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import appCss from "../styles.css?url";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ImageDebugPanel } from "@/components/ImageDebugPanel";
import { cleanupStaleCaches } from "@/lib/cache-cleanup";
import { I18nProvider } from "@/lib/i18n";

interface RouterContext {
  queryClient: QueryClient;
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl text-primary">404</h1>
        <h2 className="mt-4 font-display text-2xl tracking-wider text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This page doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-primary px-6 py-3 font-heading uppercase tracking-wider text-primary-foreground hover:bg-primary-dark transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "BJJLF — Brazilian Jiu-Jitsu Legends Federation" },
      { name: "description", content: "Official home of BJJLF: rankings, events, athlete & academy registration, and the global black belt registry." },
      { name: "author", content: "BJJLF" },
      { property: "og:title", content: "BJJLF — Brazilian Jiu-Jitsu Legends Federation" },
      { property: "og:description", content: "Official home of BJJLF: rankings, events, athlete & academy registration, and the global black belt registry." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "BJJLF — Brazilian Jiu-Jitsu Legends Federation" },
      { name: "twitter:description", content: "Official home of BJJLF: rankings, events, athlete & academy registration, and the global black belt registry." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  // queryClient flows in via router context (set up in src/router.tsx).
  // QueryClientProvider here makes useQuery/useSuspenseQuery work in every
  // child route without each route having to grab the client itself.
  const { queryClient } = Route.useRouteContext();

  // Dev-only: scrub any leftover service workers / cache entries that could
  // be serving stale (4xx) image responses for URLs we now want to load.
  useEffect(() => {
    cleanupStaleCaches();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <div className="min-h-screen flex flex-col bg-background">
          <Navbar />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
        <ImageDebugPanel />
      </I18nProvider>
    </QueryClientProvider>
  );
}
