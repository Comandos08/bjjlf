import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

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
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 font-heading uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
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
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/89b20644-4f86-4541-b2f3-524af335ef6d/id-preview-770d530f--f9ae5ffa-f92c-4c62-9ef2-d13b373be473.lovable.app-1777242769351.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/89b20644-4f86-4541-b2f3-524af335ef6d/id-preview-770d530f--f9ae5ffa-f92c-4c62-9ef2-d13b373be473.lovable.app-1777242769351.png" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
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
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
