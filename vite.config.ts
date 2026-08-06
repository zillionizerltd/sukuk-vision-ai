// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins.
import path from "node:path";

// Deployed under https://agrofeedglobal.com/dataroom:
//   VITE_BASE_PATH=/dataroom/ (see .env)
// Static files are emitted to dist/client/assets and must ALSO exist at
// dist/client/dataroom/assets — scripts/postbuild.cjs copies them there.
// Without that copy, /dataroom/assets/*.css falls through to SSR and the
// browser rejects it as text/html.
const rawBase = process.env.VITE_BASE_PATH ?? "/dataroom/";
const BASE = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;



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
