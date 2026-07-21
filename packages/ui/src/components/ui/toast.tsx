import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "../../lib/utils";
import { useToastStore, type ToastItem } from "../../store/toast-store";

import { toneIcon, toneRole, toneText } from "./feedback-tone";
import { MessageText } from "./message-text";

export interface ToasterProps {
  dismissLabel?: string;
  regionLabel?: string;
}

/**
 * Toast 表示領域（画面右下スタック）。
 * フォーカスを奪わず aria-live で読み上げる（toast-accessibility）。
 * アプリ最上位で一度だけ描画する。
 *
 * 閉じるボタンの aria ラベルは `dismissLabel` で注入（既定「閉じる」）。
 */
export function Toaster({
  dismissLabel = "閉じる",
  regionLabel = "通知",
}: ToasterProps = {}) {
  const toasts = useToastStore((state) => state.toasts);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div
      role="region"
      aria-label={regionLabel}
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed z-[1000] flex max-h-[calc(100dvh-2rem)] w-[min(92vw,22rem)] flex-col gap-2 overflow-y-auto"
      style={{
        bottom: "max(1rem, env(safe-area-inset-bottom))",
        right: "max(1rem, env(safe-area-inset-right))",
      }}
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} dismissLabel={dismissLabel} />
      ))}
    </div>,
    document.body
  );
}

function ToastCard({ item, dismissLabel }: { item: ToastItem; dismissLabel: string }) {
  const dismiss = useToastStore((state) => state.dismiss);
  const Icon = toneIcon[item.tone];

  return (
    <div
      role={toneRole(item.tone)}
      className="animate-toast-in pointer-events-auto flex items-start gap-2.5 rounded-lg border border-border bg-card px-3.5 py-3 shadow-lg"
    >
      <Icon size={16} className={cn("mt-0.5 shrink-0", toneText[item.tone])} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-relaxed text-foreground">
          <MessageText text={item.message} />
        </p>
        {item.description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            <MessageText text={item.description} />
          </p>
        ) : null}
        {item.action ? (
          <button
            type="button"
            onClick={() => {
              item.action?.onClick();
              dismiss(item.id);
            }}
            className="mt-1.5 cursor-pointer text-xs font-medium text-primary hover:underline"
          >
            {item.action.label}
          </button>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => dismiss(item.id)}
        aria-label={dismissLabel}
        className="-mr-2 -mt-2 inline-flex h-[44px] w-[44px] min-h-[44px] min-w-[44px] shrink-0 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:bg-background hover:text-foreground"
      >
        <X size={14} aria-hidden />
      </button>
    </div>
  );
}
