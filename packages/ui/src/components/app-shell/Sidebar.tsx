import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";

import { cn } from "../../lib/utils";
import type { NavLinkComponent, NavSection, SidebarLabels } from "../../navigation/types";

export interface SidebarProps {
  /** ナビ構成（解決済みラベル）。 */
  sections: NavSection[];
  /** 現在の URL パス（react-router の useLocation().pathname 等）。 */
  currentPath: string;
  /** アプリ名（展開時に 2 行で表示 + ツールチップ）。 */
  title: { line1: string; line2: string; full: string };
  /** サイドバー全体の折りたたみ状態とハンドラ。 */
  collapsed: boolean;
  onToggleCollapsed: () => void;
  /** セクション単位の折りたたみ状態とハンドラ。 */
  collapsedSections: Record<string, boolean>;
  onToggleSection: (key: string) => void;
  onSetSectionCollapsed: (key: string, collapsed: boolean) => void;
  /** ルーター非依存のリンク（react-router Link 等）。 */
  linkComponent: NavLinkComponent;
  labels: SidebarLabels;
  /** Command パレットを開く。未指定なら検索ボタンを表示しない。 */
  onOpenCommandPalette?: () => void;
  /** 下部のユーザー/ログアウト等のスロット（アプリ側が auth を注入）。 */
  footer?: ReactNode;
}

/**
 * 折りたたみ可能なサイドナビ（参照実装の sideTabBar 構造を踏襲）。
 * ルーター・i18n・auth・状態ストアには依存せず、すべて props で注入する。
 */
export function Sidebar({
  sections,
  currentPath,
  title,
  collapsed,
  onToggleCollapsed,
  collapsedSections,
  onToggleSection,
  onSetSectionCollapsed,
  linkComponent: Link,
  labels,
  onOpenCommandPalette,
  footer,
}: SidebarProps) {
  const sidebarState = collapsed ? "collapsed" : "expanded";

  const isActive = (href: string) =>
    currentPath === href || currentPath.startsWith(href + "/");

  // 現在地を含むセクション（無ければ undefined）。
  const activeSectionKey = sections.find((section) =>
    section.items.some((item) => isActive(item.href))
  )?.key;

  // ナビゲーションで別セクションへ入ったら、そのセクションを自動展開して現在地を露出させる。
  useEffect(() => {
    if (activeSectionKey) {
      onSetSectionCollapsed(activeSectionKey, false);
    }
  }, [activeSectionKey, onSetSectionCollapsed]);

  return (
    <aside
      className={cn(
        "sidebar-shell flex h-screen shrink-0 flex-col overflow-hidden bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-out motion-reduce:transition-none",
        collapsed ? "w-16" : "w-60"
      )}
      aria-label={labels.aria}
      data-state={sidebarState}
    >
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-white/10",
          collapsed ? "justify-center px-2" : "justify-between px-3"
        )}
      >
        <div
          className={cn(
            "sidebar-reveal min-w-0 px-2 text-white",
            collapsed ? "w-0 px-0" : "flex-1"
          )}
          aria-hidden={collapsed}
          title={title.full}
        >
          <span className="block whitespace-nowrap text-base font-bold leading-5">
            {title.line1}
          </span>
          <span className="block whitespace-nowrap text-xs font-semibold leading-4 text-sidebar-foreground/80">
            {title.line2}
          </span>
        </div>
        <button
          type="button"
          className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-md text-sidebar-foreground/90 transition-colors hover:bg-white/10 hover:text-white"
          aria-label={collapsed ? labels.expand : labels.collapse}
          aria-expanded={!collapsed}
          title={collapsed ? labels.expand : labels.collapse}
          onClick={onToggleCollapsed}
        >
          {collapsed ? <PanelLeftOpen size={18} aria-hidden /> : <PanelLeftClose size={18} aria-hidden />}
        </button>
      </div>
      <nav className={cn("flex-1 overflow-y-auto overflow-x-hidden py-3", collapsed ? "px-2" : "px-3")}>
        {onOpenCommandPalette ? (
          <SidebarTooltip label={labels.commandOpen} enabled={collapsed}>
            <button
              type="button"
              onClick={onOpenCommandPalette}
              aria-label={labels.commandOpen}
              title={collapsed ? undefined : labels.commandOpen}
              className={cn(
                "mb-3 flex h-9 min-h-9 w-full items-center overflow-hidden rounded-md border border-white/10 text-sm text-sidebar-foreground/80 transition-colors hover:bg-white/10 hover:text-white",
                collapsed ? "justify-center px-0" : "gap-2 px-3"
              )}
            >
              <Search className="shrink-0" size={16} aria-hidden />
              <span
                className={cn(
                  "sidebar-reveal min-w-0 flex-1 truncate text-left",
                  collapsed && "w-0"
                )}
                aria-hidden={collapsed}
              >
                {labels.commandOpen}
              </span>
              <kbd
                className={cn(
                  "sidebar-reveal shrink-0 rounded border border-white/20 px-1.5 py-0.5 text-[10px] font-medium text-sidebar-foreground/70",
                  collapsed && "hidden"
                )}
                aria-hidden
              >
                ⌘K
              </kbd>
            </button>
          </SidebarTooltip>
        ) : null}
        {sections.map((section) => {
          const containsActive = section.items.some((item) => isActive(item.href));
          // セクション開閉は展開幅サイドバーでのみ作用（icon-only 幅は常に全表示）。
          const collapsible = section.collapsible !== false && !collapsed;
          const sectionExpanded = !collapsible || !collapsedSections[section.key];
          const collapsedWithActive = collapsible && !sectionExpanded && containsActive;
          const regionId = `nav-section-${sectionId(section.key)}`;
          return (
            <div key={section.key} className={cn(collapsed ? "mb-3" : "mb-4")}>
              {collapsible ? (
                <button
                  type="button"
                  className="sidebar-reveal flex w-full items-center justify-between gap-2 rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors hover:bg-white/10 [--sidebar-reveal-opacity:0.6]"
                  aria-expanded={sectionExpanded}
                  aria-controls={regionId}
                  aria-label={
                    collapsedWithActive
                      ? `${labels.sectionToggleExpand(section.title)}（${labels.sectionContainsActive}）`
                      : sectionExpanded
                        ? labels.sectionToggleCollapse(section.title)
                        : labels.sectionToggleExpand(section.title)
                  }
                  onClick={() => onToggleSection(section.key)}
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className="truncate">{section.title}</span>
                    {collapsedWithActive ? (
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-sidebar-active"
                        aria-hidden
                        title={labels.sectionContainsActive}
                      />
                    ) : null}
                  </span>
                  <ChevronDown
                    size={14}
                    aria-hidden
                    className={cn(
                      "shrink-0 transition-transform duration-200 ease-out motion-reduce:transition-none",
                      sectionExpanded ? "rotate-0" : "-rotate-90"
                    )}
                  />
                </button>
              ) : (
                <div
                  className={cn(
                    "sidebar-reveal px-3 py-1 text-xs font-semibold uppercase tracking-wide [--sidebar-reveal-opacity:0.6]",
                    collapsed && "sr-only"
                  )}
                >
                  {section.title}
                </div>
              )}
              <div
                id={regionId}
                className={cn(
                  "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
                  sectionExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
                inert={sectionExpanded ? undefined : true}
              >
                <ul
                  className={cn(
                    "min-h-0 space-y-1 overflow-hidden",
                    collapsed ? "pt-0" : "pt-1",
                    !sectionExpanded && "invisible"
                  )}
                >
                  {section.items.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    const fullLabel = item.label;
                    const displayLabel = item.sidebarLabel ?? item.label;
                    const ariaLabel =
                      collapsed || displayLabel !== fullLabel ? fullLabel : undefined;
                    return (
                      <li key={item.href}>
                        <SidebarTooltip label={fullLabel} enabled={collapsed}>
                          <Link
                            to={item.href}
                            className={cn(
                              "relative flex h-11 min-h-11 items-center overflow-hidden rounded-md text-sm transition-colors",
                              collapsed ? "justify-center px-0" : "gap-2.5 px-3 py-2",
                              active ? "bg-sidebar-active text-white" : "hover:bg-white/10"
                            )}
                            aria-current={active ? "page" : undefined}
                            aria-label={ariaLabel}
                            title={collapsed ? undefined : fullLabel}
                          >
                            {/* 左アクセントバー: 現在地を背景色だけに頼らず位置でも示す（color-not-only）。 */}
                            {active ? (
                              <span
                                className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-white"
                                aria-hidden
                              />
                            ) : null}
                            <Icon className="shrink-0" size={18} aria-hidden />
                            <span
                              className={cn(
                                "sidebar-reveal min-w-0 truncate whitespace-nowrap leading-5",
                                collapsed && "w-0"
                              )}
                              aria-hidden={collapsed}
                            >
                              {displayLabel}
                            </span>
                          </Link>
                        </SidebarTooltip>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })}
      </nav>
      {footer ? (
        <div className={cn("border-t border-white/10 py-3", collapsed ? "px-2" : "px-3")}>
          {footer}
        </div>
      ) : null}
    </aside>
  );
}

/** キー文字列を DOM id 用の安全な slug に変換する。 */
function sectionId(key: string): string {
  return key.replace(/[^a-zA-Z0-9]+/g, "-");
}

/**
 * icon-only 幅のサイドバー項目に表示するツールチップ。
 * サイドバーは横方向 overflow-hidden のため、右側へ出すラベルが clip される。
 * これを避けるため portal で document.body へ描画し、fixed 配置で trigger の右に出す。
 * 視覚補助のため `aria-hidden`（読み上げは trigger の `aria-label` が担う）。
 * hover とキーボード focus の双方で表示する（hover 依存にしない）。
 */
function SidebarTooltip({
  label,
  enabled,
  children,
}: {
  label: string;
  enabled: boolean;
  children: ReactNode;
}) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  if (!enabled) {
    return <>{children}</>;
  }

  function show(target: HTMLElement) {
    const rect = target.getBoundingClientRect();
    setCoords({ top: rect.top + rect.height / 2, left: rect.right + 10 });
  }

  function hide() {
    setCoords(null);
  }

  return (
    <span
      className="block"
      onMouseEnter={(event) => show(event.currentTarget)}
      onMouseLeave={hide}
      onFocus={(event) => show(event.currentTarget)}
      onBlur={hide}
    >
      {children}
      {coords
        ? createPortal(
            <div
              role="tooltip"
              aria-hidden
              className="pointer-events-none fixed z-[1000] max-w-[16rem] -translate-y-1/2 truncate whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg ring-1 ring-white/10"
              style={{ top: coords.top, left: coords.left }}
            >
              {label}
            </div>,
            document.body
          )
        : null}
    </span>
  );
}
