import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(new URL(`../src/styles/${path}`, import.meta.url), "utf8");
const colors = read("tokens/colors.css");

describe("tokens CSS", () => {
  it("light-dark() には色だけを渡す（混合率などを渡すと宣言ごと無効になる）", () => {
    expect(colors).not.toMatch(/light-dark\(\s*\d+%/);
  });

  it("意味トークンを color-scheme を切り替える要素すべてで宣言し直す（Lightning CSS 変換後もスコープ内でダーク値になる）", () => {
    expect(colors).toMatch(/:root, \.light, \.dark, \[data-theme\], \[data-surface\] \{\s*--font-sans/);
  });

  it("文字は px、ルートは 14px のまま（余白の rem を動かさない）", () => {
    expect(read("tokens/base.css")).toMatch(/html\s*\{\s*font-size:\s*14px;/);
    expect(read("tokens/typography.css")).toMatch(/--font-size-sm:\s*14px;/);
    expect(read("tokens/typography.css")).toMatch(/--font-size-xs:\s*12px;/);
    expect(read("tokens.css")).toMatch(/--text-sm:\s*var\(--font-size-sm\);/);
    expect(read("tokens.css")).toMatch(/--text-xs:\s*var\(--font-size-xs\);/);
  });

  it("フォーム入力のフォーカスリングは外側へはみ出さない（内側 1px のリング）", () => {
    const base = read("tokens/base.css");
    const rule = base.match(
      /:is\(input, textarea, select\):not\(\[type="checkbox"\]\):not\(\[type="radio"\]\):focus-visible\s*\{([^}]*)\}/
    )?.[1];
    expect(rule).toMatch(/outline:\s*none;/);
    expect(rule).toMatch(/box-shadow:\s*inset 0 0 0 1px var\(--color-focus-ring\);/);
  });

  it(".dark に色値の手書き宣言を持たない（テーマは light-dark() で解決する）", () => {
    for (const file of ["tokens.css", "tokens/colors.css", "tokens/base.css"]) {
      expect(read(file)).not.toMatch(/\.dark\s*\{[^}]*#[0-9a-f]{3,8}/i);
    }
  });
});
