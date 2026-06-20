import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// tokens.css は Tailwind v4 のデザイントークン定義。バンドルせず素の CSS として dist へ配布し、
// 各アプリの globals.css が `@import "@engchina/production-ready-ui/tokens.css"` で取り込む。
const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, "../src/styles/tokens.css");
const dest = resolve(here, "../dist/tokens.css");

mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
console.log(`[copy-css] ${src} -> ${dest}`);
