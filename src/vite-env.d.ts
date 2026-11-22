/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FAKE_BACKEND?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
