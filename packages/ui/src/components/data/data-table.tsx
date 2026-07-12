import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

export type SortDirection = "asc" | "desc";

export interface DataTableSort {
  key: string;
  direction: SortDirection;
}

export interface DataTableColumn<T> {
  /** 列キー（sort 識別・fallback 値取得に使う）。 */
  key: string;
  /** 見出し（翻訳済み）。 */
  header: ReactNode;
  /** セル描画。省略時は row[key] を文字列化。 */
  render?: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  /** td/th 共通の追加 class。 */
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: readonly T[];
  getRowKey: (row: T, index: number) => string | number;
  /** 制御式ソート。並べ替え自体は caller が行う（presentational）。 */
  sort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort) => void;
  onRowClick?: (row: T) => void;
  /** 読込中は行の代わりにスケルトンを描画。 */
  loading?: boolean;
  /** 行が空かつ非読込のとき表示（EmptyState 等）。 */
  empty?: ReactNode;
  /** 密表示（py を詰める）。 */
  dense?: boolean;
  className?: string;
  /** テーブルの aria-label（任意）。 */
  ariaLabel?: string;
  /** <table> に付与する data-testid（既存 e2e の getByTestId 互換用）。 */
  testId?: string;
}

const ALIGN_CLASS: Record<NonNullable<DataTableColumn<unknown>["align"]>, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

function ariaSortValue(sort: DataTableSort | null | undefined, key: string) {
  if (!sort || sort.key !== key) return "none" as const;
  return sort.direction === "asc" ? ("ascending" as const) : ("descending" as const);
}

/**
 * 共通データテーブル。列定義 + 制御式ソート（aria-sort）+ 空/読込 + 横スクロール内蔵。
 * 生 <table> の手書きを段階置換する。ソート/選択が不要な単純表は columns の render だけで使う。
 */
export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  sort,
  onSortChange,
  onRowClick,
  loading,
  empty,
  dense,
  className,
  ariaLabel,
  testId,
}: DataTableProps<T>) {
  const cellPad = dense ? "px-3 py-1.5" : "px-3 py-2";

  function toggleSort(key: string) {
    if (!onSortChange) return;
    const nextDirection: SortDirection =
      sort?.key === key && sort.direction === "asc" ? "desc" : "asc";
    onSortChange({ key, direction: nextDirection });
  }

  const showEmpty = !loading && rows.length === 0;

  return (
    <div className={cn("overflow-x-auto rounded-md border border-border bg-card", className)}>
      <table className="min-w-full divide-y divide-border text-left text-xs" aria-label={ariaLabel} data-testid={testId}>
        <thead className="bg-background text-muted">
          <tr>
            {columns.map((column) => {
              const alignClass = column.align ? ALIGN_CLASS[column.align] : "text-left";
              if (column.sortable && onSortChange) {
                const active = sort?.key === column.key;
                const Icon = !active ? ChevronsUpDown : sort?.direction === "asc" ? ChevronUp : ChevronDown;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={ariaSortValue(sort, column.key)}
                    className={cn(cellPad, alignClass, "font-semibold", column.headerClassName)}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className="inline-flex cursor-pointer items-center gap-1 text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      <span>{column.header}</span>
                      <Icon size={13} aria-hidden="true" className={active ? "text-foreground" : "text-muted"} />
                    </button>
                  </th>
                );
              }
              return (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(cellPad, alignClass, "font-semibold", column.headerClassName)}
                >
                  {column.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/70 text-foreground">
          {loading
            ? Array.from({ length: 3 }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} aria-hidden="true">
                  {columns.map((column) => (
                    <td key={column.key} className={cellPad}>
                      <span className="block h-4 w-full animate-pulse rounded bg-muted/40" />
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row, index) => (
                <tr
                  key={getRowKey(row, index)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={onRowClick ? "cursor-pointer hover:bg-background" : undefined}
                >
                  {columns.map((column) => {
                    const alignClass = column.align ? ALIGN_CLASS[column.align] : "text-left";
                    const content = column.render
                      ? column.render(row, index)
                      : String((row as Record<string, unknown>)[column.key] ?? "");
                    return (
                      <td key={column.key} className={cn(cellPad, alignClass, "break-words", column.className)}>
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))}
          {showEmpty ? (
            <tr>
              <td colSpan={Math.max(columns.length, 1)} className="px-3 py-6 text-center text-muted">
                {empty}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
