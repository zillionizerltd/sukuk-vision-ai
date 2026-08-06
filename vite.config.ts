// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins.
import path from "node:path";

// Deployed under https://agrofeedglobal.com/dataroom.
// IMPORTANT: static files are served from the origin ROOT (/assets/*), so Vite's
// `base` must stay "/" — prefixing it with /dataroom/ makes every CSS/JS request
// fall through to SSR and return HTML (MIME-type errors in the browser).
// The URL prefix is applied by the ROUTER basepath instead (see src/router.tsx),
// driven by VITE_ROUTER_BASEPATH.
const BASE = "/";


export default async (env: any) => {
  const { loadEnv } = await import("vite");
  const { defineConfig } = await import("@lovable.dev/vite-tanstack-config");

  // Load all env vars (including non-VITE server-only secrets) into process.env
  // for server-side code. These are NOT exposed to the client bundle.
  const serverEnv = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "");
  Object.assign(process.env, serverEnv);

  const configFn = defineConfig({
    tanstackStart: {
      server: { entry: "server" },
    },
    vite: {
      base: BASE,
      resolve: {
        alias: {
          "entities/lib/decode.js": path.resolve(import.meta.dirname, "node_modules/entities/lib/decode.js"),
          "entities/lib/encode.js": path.resolve(import.meta.dirname, "node_modules/entities/lib/encode.js"),
          entities: path.resolve(import.meta.dirname, "node_modules/entities"),
        },
      },
    },
  });
  // Agro-%y29G4zs
  return configFn(env);
};
