import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

/**
 * 本文の計測コンテナ（最大幅 --content-max-width = 1440px で中央寄せ、左右ガター 2rem）。
 * PageHeader の中身と PageBody で共有し、ワイドモニタでもタイトルと本文の左端を揃える。
 * `wide` は PageHeader と PageBody で必ず同じ値にする。
 */
export function measureClass(wide: boolean) {
  return cn("w-full min-w-0 px-8", wide ? "max-w-none" : "mx-auto max-w-[var(--content-max-width)]");
}

/**
 * PageHeader の直後に置く本文コンテナ（左右ガター 2rem / 上下 1.5rem / セクション間 1.5rem）。
 * 手書きの `<div style={{ padding: "1.5rem 2rem" }}>` を置き換える。
 * 表を画面幅いっぱいに出す画面だけ `wide`（PageHeader にも同じ値を渡す）。
 */
export function PageBody({
  wide = false,
  className,
  children,
}: {
  wide?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return <div className={cn(measureClass(wide), "grid content-start gap-6 py-6", className)}>{children}</div>;
}

/**
 * 見出し付きのひとまとまり。見出しは 16px / 600（ページタイトル 20px とカード見出し 14px の間の段）。
 */
export function Section({
  title,
  description,
  actions,
  className,
  children,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <section className={cn("grid min-w-0 gap-3", className)}>
      {title || actions ? (
        <div className="flex min-w-0 items-start justify-between gap-4">
          <div className="min-w-0">
            {title ? <h2 className="text-base font-semibold text-fg">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-fg-muted">{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
