// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// To deploy under https://agrofeedglobal.com/dataroom:
//   VITE_BASE_PATH=/dataroom/ bun run build
// Reverse-proxy /dataroom → this app's origin, preserving the /dataroom prefix.
const BASE = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    base: BASE,
  },
});
