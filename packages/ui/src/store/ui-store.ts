import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

/**
 * サイドナビの開閉状態（折りたたみ / セクション開閉）を保持する UI ストアの「ファクトリ」。
 *
 * アプリごとに永続化キーが異なる（RAG / NL2SQL / Agent で別 localStorage namespace）ため、
 * `createUiStore({ storageKey })` で各アプリが自分のインスタンスを生成する。
 * パッケージ内の Sidebar はストアに依存せず props で値を受け取るので、
 * このストアは「アプリ側の利便フック」という位置づけ。
 */

export interface UiState {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  /**
   * サイドナビのセクション折りたたみ状態。キーは NavSection.key。
   * 未指定（キー無し）は「展開」を既定とし、true のときだけ折りたたむ。
   */
  collapsedSections: Record<string, boolean>;
  toggleSection: (key: string) => void;
  setSectionCollapsed: (key: string, collapsed: boolean) => void;
}

export interface CreateUiStoreOptions {
  /** localStorage の永続化キー（アプリごとに一意）。 */
  storageKey: string;
  /**
   * 旧バージョンが単独で持っていた「サイドバー折りたたみ真偽値」の localStorage キー。
   * 指定すると初期値を移行する（任意）。
   */
  legacyCollapsedKey?: string;
  /** 初期状態でモバイル幅なら畳む判定の閾値（px, 既定 640）。 */
  mobileBreakpoint?: number;
}

const memoryStorage = new Map<string, string>();

const fallbackStorage: StateStorage = {
  getItem: (name) => memoryStorage.get(name) ?? null,
  setItem: (name, value) => memoryStorage.set(name, value),
  removeItem: (name) => memoryStorage.delete(name),
};

function resolveStorage(): StateStorage {
  if (typeof window === "undefined") {
    return fallbackStorage;
  }
  return window.localStorage;
}

function initialSidebarCollapsed(options: CreateUiStoreOptions): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const breakpoint = options.mobileBreakpoint ?? 640;
  if (window.matchMedia(`(max-width: ${breakpoint}px)`).matches) {
    return true;
  }
  if (options.legacyCollapsedKey) {
    return window.localStorage.getItem(options.legacyCollapsedKey) === "true";
  }
  return false;
}

export function createUiStore(options: CreateUiStoreOptions) {
  // 戻り値の型は推論に委ねる（persist ミドルウェアが付与する `.persist` API を保持するため）。
  return create<UiState>()(
    persist(
      (set) => ({
        sidebarCollapsed: initialSidebarCollapsed(options),
        setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
        toggleSidebarCollapsed: () =>
          set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        collapsedSections: {},
        toggleSection: (key) =>
          set((state) => ({
            collapsedSections: {
              ...state.collapsedSections,
              [key]: !state.collapsedSections[key],
            },
          })),
        setSectionCollapsed: (key, collapsed) =>
          set((state) => ({
            collapsedSections: { ...state.collapsedSections, [key]: collapsed },
          })),
      }),
      {
        name: options.storageKey,
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          collapsedSections: state.collapsedSections,
        }),
        storage: createJSONStorage(resolveStorage),
      }
    )
  );
}
