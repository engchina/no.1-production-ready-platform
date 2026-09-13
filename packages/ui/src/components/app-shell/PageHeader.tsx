import type { LucideIcon } from "lucide-react";
import { isValidElement, type ReactNode } from "react";

import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { measureClass } from "./PageBody";

export interface PageHeaderAction {
  id: string;
  /** primary = ページの主操作 / secondary / utility = ghost / danger = 破壊的操作。 */
  kind: "primary" | "secondary" | "utility" | "danger";
  /** 翻訳済みラベル。省略するとアイコンだけのボタンになる（`ariaLabel` 必須）。 */
  label?: string;
  /** 画面の文脈を含む読み上げ名。ラベルがあっても指定すれば優先する（アイコンだけの場合は必須）。 */
  ariaLabel?: string;
  icon?: LucideIcon;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  /** ボタンの data-testid。 */
  testId?: string;
}

const ORDER: Record<PageHeaderAction["kind"], number> = { danger: 0, utility: 1, secondary: 2, primary: 3 };
const VARIANT = { primary: "primary", secondary: "secondary", utility: "ghost", danger: "danger" } as const;

/**
 * アクションの並び順。右寄せグループなので右端（最も押しやすい位置）に primary、左端に danger。
 * 同じ kind の中は渡した順を保つ。
 */
export function orderActions(actions: PageHeaderAction[]): PageHeaderAction[] {
  return actions
    .map((action, index) => ({ action, index }))
    .sort((a, b) => ORDER[a.action.kind] - ORDER[b.action.kind] || a.index - b.index)
    .map(({ action }) => action);
}

/**
 * 画面共通ヘッダー。スクロールしても上端に貼り付き（sticky）、タイトルと主要操作に常に手が届く。
 * `<header>` は画面幅いっぱい（背景と罫線）、中身は PageBody と同じ計測コンテナに入れる。
 * `wide` は PageBody と必ず同じ値にする（ずらすと 1920px でタイトルと本文の左端がずれる）。
 */
export function PageHeader({
  title,
  subtitle,
  meta,
  status,
  breadcrumbs,
  actions,
  actionsLabel = "ページ操作",
  actionsTestId,
  tabs,
  wide = false,
  className,
}: {
  title: string;
  subtitle?: string;
  /** 副題の下の補足（最終更新・件数など）。 */
  meta?: ReactNode;
  /** タイトル横の状態表示（StatusBadge 等）。 */
  status?: ReactNode;
  /** タイトル上のパンくず（`<Breadcrumbs>`）。 */
  breadcrumbs?: ReactNode;
  /**
   * 配列で渡すと danger → utility → secondary → primary の順に並べ替えて描画する（推奨）。
   * ReactNode（ボタン等）も後方互換で受けるが、並び順は呼び出し側の責任になる。
   */
  actions?: PageHeaderAction[] | ReactNode;
  /** アクション群の aria-label（翻訳済み）。 */
  actionsLabel?: string;
  /** アクション群の data-testid。 */
  actionsTestId?: string;
  /** `<Tabs>` を渡すとヘッダー下端に吸い付く（ビュー切替の唯一の置き場所）。 */
  tabs?: ReactNode;
  wide?: boolean;
  className?: string;
}) {
  const actionNodes = Array.isArray(actions) && !actions.some(isValidElement)
    ? orderActions(actions as PageHeaderAction[]).map((action) => (
        <Button
          key={action.id}
          variant={VARIANT[action.kind]}
          icon={action.icon}
          iconOnly={!action.label}
          aria-label={action.ariaLabel}
          data-testid={action.testId}
          loading={action.loading}
          disabled={action.disabled}
          onClick={action.onClick}
        >
          {action.label ? <span>{action.label}</span> : null}
        </Button>
      ))
    : (actions as ReactNode);

  return (
    <header
      className={cn(
        "sticky top-0 z-[var(--z-sticky)] flex flex-col border-b border-border bg-surface",
        tabs ? "gap-4 pt-5" : "py-5",
        className
      )}
    >
      <div className={cn(measureClass(wide), "flex flex-wrap items-start justify-between gap-4")}>
        <div className="min-w-0 flex-auto">
          {breadcrumbs ? <div className="mb-1.5">{breadcrumbs}</div> : null}
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-bold text-fg">{title}</h1>
            {status}
          </div>
          {subtitle ? <p className="mt-1 text-sm text-fg-muted">{subtitle}</p> : null}
          {meta ? <div className="mt-1 text-xs text-fg-muted">{meta}</div> : null}
        </div>
        {(Array.isArray(actionNodes) ? actionNodes.length > 0 : actionNodes) ? (
          <div role="group" aria-label={actionsLabel} data-testid={actionsTestId} className="flex min-w-0 flex-wrap items-center gap-2">
            {actionNodes}
          </div>
        ) : null}
      </div>
      {tabs ? <div className={measureClass(wide)}>{tabs}</div> : null}
    </header>
  );
}
