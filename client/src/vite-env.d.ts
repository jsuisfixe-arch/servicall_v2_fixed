/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FRONTEND_FORGE_API_KEY: string;
  readonly VITE_FRONTEND_FORGE_API_URL: string;
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_API_URL: string;
  readonly VITE_MODE: string;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
