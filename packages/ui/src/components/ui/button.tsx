import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, Ref } from "react";

import { cn } from "../../lib/utils";
import { Spinner } from "./spinner";

export const buttonVariants = cva(
  "inline-flex max-w-full cursor-pointer items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap rounded-md text-sm font-medium leading-none transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring [&>span]:min-w-0 [&>span]:truncate [&>svg]:block [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-accent-emphasis text-fg-on-accent hover:bg-accent-emphasis-hover",
        secondary: "border border-border-control bg-surface text-fg hover:bg-surface-hover",
        ghost: "text-fg hover:bg-surface-hover",
        danger: "bg-danger-emphasis text-fg-on-emphasis hover:bg-[color-mix(in_srgb,var(--color-danger-emphasis)_88%,#000)]",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-9 px-4",
        lg: "h-10 px-5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

/** 共通ボタン。loading 時はスピナー表示＋無効化（submit-feedback）。 */
export function Button({
  className,
  variant,
  size,
  loading,
  disabled,
  children,
  ref,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      className={cn(
        buttonVariants({ variant, size }),
        // loading 中は自前のスピナーのみ表示し、children 側の先頭アイコン（svg）を隠してアイコン二重表示を防ぐ
        loading && "[&>svg:not(.animate-spin)]:hidden",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {/*
        スピナーは全周トラック付きの Spinner を使う（回転してもシルエットが変わらず中心ぶれして見えない）。
        寸法は children 側の先頭アイコンと同じ 16px に揃え、loading 切替時のずれも防ぐ。
      */}
      {loading ? <Spinner size={16} /> : null}
      {children}
    </button>
  );
}
