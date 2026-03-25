// ── Imports (tous en premier — avant tout code exécutable) ───────────────────
import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from "@shared/const";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import * as Sentry from "@sentry/react";
import { LOGIN_PATH } from "./const";
import { CsrfProvider } from "@/components/CsrfProvider";
import { I18nextProvider } from "react-i18next";
import i18n from "./lib/i18n";
import { getCsrfToken } from "@/hooks/useCsrfToken";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TenantProvider } from "@/contexts/TenantContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import App from "./App";
import "./index.css";
import "./lib/i18n";

// ── Sentry init (optionnel — ne crashe pas si DSN absent) ────────────────────
try {
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      environment: import.meta.env.MODE ?? "production",
    });
  }
} catch (e) {
  // Sentry non disponible — continuer sans monitoring
  console.warn("[Sentry] Init failed, continuing without monitoring:", e);
}

// ── QueryClient ───────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5000,
    },
  },
});

// ── Redirection automatique si session expirée ────────────────────────────────
const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;
  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;
  if (!isUnauthorized) return;
  window.location.href = LOGIN_PATH;
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    try { Sentry.captureException(error, { tags: { type: "api_query" } }); } catch (_) {}
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    try { Sentry.captureException(error, { tags: { type: "api_mutation" } }); } catch (_) {}
  }
});

// ── tRPC client factory ────────────────────────────────────────────────────────
export function createTrpcClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: "/api/trpc",
        transformer: superjson,
        headers() {
          const csrfToken = getCsrfToken();
          if (csrfToken) {
            return { "x-csrf-token": csrfToken };
          }
          return {};
        },
        fetch(input, init) {
          return globalThis.fetch(input, {
            ...(init ?? {}),
            credentials: "include",
          });
        },
      }),
    ],
  });
}

const trpcClient = createTrpcClient();

// ── Montage React ─────────────────────────────────────────────────────────────
// Ordre des providers :
//   ErrorBoundary     → capture les crash JS et affiche le message d'erreur
//   trpc.Provider     → contexte tRPC (requis par useAuth dans TenantProvider)
//   QueryClientProvider
//   I18nextProvider   → traductions
//   ThemeProvider     → useTheme()
//   CsrfProvider      → initialise le token CSRF au démarrage
//   TenantProvider    → useTenant() (utilise useAuth → doit être dans trpc + queryClient)
//   App               → routeur et pages

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("[Servicall] ERREUR CRITIQUE : Element #root introuvable dans index.html");
  console.error("[Servicall] Document body:", document.body.innerHTML.substring(0, 200));
  throw new Error("[Servicall] Element #root introuvable dans index.html");
}

console.log("[Servicall] Initialisation de l'application...");
console.log("[Servicall] Root element trouvé:", rootElement);
console.log("[Servicall] Mode:", import.meta.env.MODE ?? "unknown");

try {
  console.log("[Servicall] Montage de l'arborescence des providers...");
  createRoot(rootElement).render(
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <I18nextProvider i18n={i18n}>
            <ThemeProvider defaultTheme="light">
              <CsrfProvider>
                <TenantProvider>
                  <App />
                </TenantProvider>
              </CsrfProvider>
            </ThemeProvider>
          </I18nextProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
  console.log("[Servicall] Application montée avec succès");
} catch (error) {
  console.error("[Servicall] ERREUR CRITIQUE au montage:", error);
  console.error("[Servicall] Stack trace:", (error as Error).stack);
  throw error;
}
