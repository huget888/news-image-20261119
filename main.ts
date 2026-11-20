// news-image-20261119 — entrypoint.
// Reads entry.png from the repo root (same directory as this file) and writes
// it to $MAKEFUN_OUTPUT_DIR/entry.png (default /output/entry.png).
// Stdlib only, deterministic: the output is byte-identical to entry.png.
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BYTES = 1024 * 1024; // 1 MiB cap

function fail(message: string): never {
  console.error(`news-image-20261119: ${message}`);
  process.exit(1);
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)));
const src = join(repoRoot, "entry.png");
if (!existsSync(src)) fail(`entry.png not found at ${src}`);
if (statSync(src).size > MAX_BYTES) {
  fail(`entry.png is ${statSync(src).size} bytes, over the 1 MiB limit`);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
// Clear ONLY the contents of the output dir — never delete the dir itself,
// because the grader runs as a non-root user and removing /output fails
// with EACCES.
for (const name of readdirSync(outDir)) {
  rmSync(join(outDir, name), { recursive: true, force: true });
}

const dest = join(outDir, "entry.png");
try {
  copyFileSync(src, dest);
} catch (err) {
  fail(`failed to copy entry.png to ${dest}: ${err instanceof Error ? err.message : String(err)}`);
}
if (statSync(dest).size !== statSync(src).size) {
  fail(`size mismatch after copy: ${dest} is not the same size as ${src}`);
}
console.log(`news-image-20261119: wrote ${dest} (${statSync(dest).size} bytes)`);
