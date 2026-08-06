#!/usr/bin/env node
// The app is served under a sub-path (e.g. /dataroom/), so the browser requests
// /dataroom/assets/*. Static files are emitted to dist/client/assets, which only
// answers /assets/* — the prefixed request then falls through to SSR and returns
// HTML, producing "Refused to apply style ... MIME type ('text/html')" errors.
// Fix: mirror the assets (and other static files) under dist/client/<subpath>/.
const { mkdirSync, cpSync, existsSync, readdirSync, appendFileSync } = require("fs");
const { join } = require("path");

const rawBase = process.env.VITE_BASE_PATH ?? "/dataroom/";
const subpath = rawBase.replace(/^\//, "").replace(/\/$/, "");

if (!subpath) {
  console.log("postbuild: BASE is root (/), nothing to copy.");
  process.exit(0);
}

// Support both current (dist/client) and legacy (.output/public) output dirs.
const roots = [join("dist", "client"), join(".output", "public")].filter((r) => existsSync(r));

if (roots.length === 0) {
  console.warn("postbuild: no client output directory found, skipping.");
  process.exit(0);
}

for (const root of roots) {
  const dest = join(root, subpath);
  mkdirSync(dest, { recursive: true });

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (entry.name === subpath || entry.name === "_headers") continue;
    cpSync(join(root, entry.name), join(dest, entry.name), { recursive: true });
    console.log(`postbuild: copied ${join(root, entry.name)} -> ${join(dest, entry.name)}`);
  }

  const headers = join(root, "_headers");
  if (existsSync(headers)) {
    appendFileSync(
      headers,
      `\n/${subpath}/assets/*\n  cache-control: public, max-age=31536000, immutable\n`,
    );
    console.log(`postbuild: added cache headers for /${subpath}/assets/*`);
  }
}
