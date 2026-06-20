import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

/**
 * アプリ全体のシェル。左に Sidebar、右にメイン領域（スクロール）を配置する。
 * Sidebar は `sidebar` スロットで注入する（ルーター/auth/i18n を持ち込まないため）。
 */
export function AppShell({
  sidebar,
  children,
  className,
  mainClassName,
}: {
  sidebar: ReactNode;
  children: ReactNode;
  className?: string;
  mainClassName?: string;
}) {
  return (
    <div className={cn("flex h-screen w-full overflow-hidden bg-background", className)}>
      {sidebar}
      <main className={cn("flex min-w-0 flex-1 flex-col overflow-y-auto", mainClassName)}>
        {children}
      </main>
    </div>
  );
}
