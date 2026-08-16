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
const API_ORIGIN = import.meta.env.VITE_SUPABASE_URL
  ? new URL(import.meta.env.VITE_SUPABASE_URL).origin
  : undefined;

import { reportError } from "@/lib/error-reporting";
import { AuthProvider } from "@/lib/auth-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Layout } from "@/components/layout";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. Try again or head home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0b0b12" },
      { title: "GameFlex | The World's Premier Gaming Ecosystem" },
      { name: "description", content: "The world's premier gaming ecosystem." },
      { property: "og:title", content: "GameFlex | The World's Premier Gaming Ecosystem" },
      { property: "og:description", content: "The world's premier gaming ecosystem." },
      { property: "og:site_name", content: "GameFlex" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://gameflex.co.ke" },
      { name: "twitter:title", content: "GameFlex | The World's Premier Gaming Ecosystem" },
      { name: "twitter:description", content: "The world's premier gaming ecosystem." },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@GameFlex" },
      { property: "og:image", content: "https://gameflex.co.ke/icons/icon-512.png" },
      { name: "twitter:image", content: "https://gameflex.co.ke/icons/icon-512.png" },
    ],
    links: [
      { rel: "canonical", href: "https://gameflex.co.ke" },
      { rel: "stylesheet", href: appCss },
      { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      // Warm the TLS connection to the data backend before the first query fires.
      ...(API_ORIGIN
        ? [
            { rel: "preconnect", href: API_ORIGIN, crossOrigin: "anonymous" as const },
            { rel: "dns-prefetch", href: API_ORIGIN },
          ]
        : []),
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
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
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    document.documentElement.classList.add("dark");
    if (!("serviceWorker" in navigator)) return;

    if (import.meta.env.DEV) {
      // A stale service worker cache serves outdated modules and renders a blank
      // page in development. Always tear it down outside production builds.
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => reg.unregister());
      });
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Layout />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
