import { cpSync, mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const pdfjs = dirname(require.resolve("pdfjs-dist/package.json"));
const { version } = JSON.parse(readFileSync(join(pdfjs, "package.json"), "utf8"));
const output = fileURLToPath(new URL(`../public/pdfjs/${version}/`, import.meta.url));
mkdirSync(output, { recursive: true });
for (const name of ["cmaps", "standard_fonts", "wasm", "iccs", "LICENSE"]) cpSync(join(pdfjs, name), join(output, name), { recursive: true });
cpSync(join(pdfjs, "build/pdf.worker.min.mjs"), join(output, "pdf.worker.min.mjs"));
console.log(`Prepared local PDF.js ${version} viewer resources.`);
