import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

/** 画面共通ヘッダー（タイトル + 説明 + 任意のアクション）。 */
export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  /** 右側に置くアクション（ボタン等）。 */
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex items-start justify-between gap-4 border-b border-border bg-card px-8 py-5",
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
