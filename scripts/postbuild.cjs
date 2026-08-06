#!/usr/bin/env node
// Copies .output/public/assets → .output/public/<subpath>/assets
// so that static files are found at /<subpath>/assets/* on the server.
const { mkdirSync, cpSync, existsSync } = require("fs");
const { join } = require("path");

const rawBase = process.env.VITE_BASE_PATH ?? "/dataroom/";
const subpath = rawBase.replace(/^\//, "").replace(/\/$/, "");

if (!subpath) {
  console.log("postbuild: BASE is root (/), nothing to copy.");
  process.exit(0);
}

const src = join(".output", "public", "assets");
const dest = join(".output", "public", subpath, "assets");

if (!existsSync(src)) {
  console.warn(`postbuild: source '${src}' not found, skipping.`);
  process.exit(0);
}

mkdirSync(join(".output", "public", subpath), { recursive: true });
cpSync(src, dest, { recursive: true });
console.log(`postbuild: copied ${src} -> ${dest}`);
