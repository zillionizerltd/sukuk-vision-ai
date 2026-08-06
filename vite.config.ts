// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins.
import path from "node:path";

// To deploy under https://agrofeedglobal.com/dataroom:
//   VITE_BASE_PATH=/dataroom/ bun run build
// Reverse-proxy /dataroom → this app's origin, preserving the /dataroom prefix.
const rawBase = process.env.VITE_BASE_PATH ?? "/dataroom/";
// Ensure trailing slash for Vite base
const BASE = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;
// Strip leading and trailing slashes to get a relative folder path (e.g. "dataroom")
const subpath = BASE.replace(/^\//, "").replace(/\/$/, "");
// Assets will land in .output/public/<subpath>/assets/ so the server can
// find them at /<subpath>/assets/ without any post-build copy step.
const ASSETS_DIR = subpath ? `${subpath}/assets` : "assets";

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
      build: {
        assetsDir: ASSETS_DIR,
      },
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
