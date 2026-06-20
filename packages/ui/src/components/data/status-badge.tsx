import { cn } from "../../lib/utils";

/**
 * 汎用ステータスバッジの配色トークン。
 * 各アプリは固有のステータス enum（RAG の FileStatus 等）を `variant` + 翻訳済み `label` に
 * マッピングして渡す（パッケージは特定ドメインの状態を知らない）。
 */
export type StatusVariant =
  | "neutral"
  | "info"
  | "pending"
  | "success"
  | "warning"
  | "danger";

const VARIANT_STYLES: Record<StatusVariant, string> = {
  neutral: "bg-slate-100 text-slate-700",
  info: "bg-sky-100 text-sky-700",
  pending: "bg-amber-100 text-amber-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-yellow-100 text-yellow-800",
  danger: "bg-red-100 text-red-700",
};

/** ステータスバッジ（状態を色＋ラベルで表示）。ラベルは i18n 済み文字列を渡す。 */
export function StatusBadge({
  variant,
  label,
  className,
}: {
  variant: StatusVariant;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        VARIANT_STYLES[variant],
        className
      )}
    >
      {label}
    </span>
  );
}
