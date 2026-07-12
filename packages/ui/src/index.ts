// @engchina/production-ready-ui — 公開 API バレル
//
// デザイントークン CSS は別 export（"@engchina/production-ready-ui/tokens.css"）で取り込む。

// --- lib ---
export { cn } from "./lib/utils";

// --- UI primitives ---
export { Button, buttonVariants, type ButtonProps } from "./components/ui/button";
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./components/ui/card";
export { Skeleton } from "./components/ui/skeleton";
export { Switch, type SwitchProps } from "./components/ui/switch";
export { ToggleChip } from "./components/ui/toggle-chip";
export { FieldError } from "./components/ui/field-error";
export { FormStatus } from "./components/ui/form-status";
export {
  SelectField,
  type SelectFieldOption,
} from "./components/ui/select-field";
export { Banner } from "./components/ui/banner";
export { Toaster } from "./components/ui/toast";
export {
  ConfirmProvider,
  useConfirm,
  type ConfirmOptions,
  type ConfirmDefaultLabels,
} from "./components/ui/confirm-dialog";
export {
  toneIcon,
  toneText,
  toneSurface,
  toneRole,
  type FeedbackTone,
} from "./components/ui/feedback-tone";

// --- feedback / state views ---
export {
  LoadingState,
  ErrorState,
  EmptyState,
} from "./components/feedback/state-views";

// --- data ---
export {
  StatusBadge,
  type StatusVariant,
} from "./components/data/status-badge";
export {
  Pagination,
  usePagination,
  DEFAULT_PAGE_SIZE,
  type PaginationProps,
  type PaginationRange,
} from "./components/data/pagination";
export {
  DataTable,
  type DataTableProps,
  type DataTableColumn,
  type DataTableSort,
  type SortDirection,
} from "./components/data/data-table";

// --- app shell / layout ---
export { AppShell } from "./components/app-shell/AppShell";
export { Sidebar, type SidebarProps } from "./components/app-shell/Sidebar";
export { PageHeader } from "./components/app-shell/PageHeader";
export {
  Breadcrumbs,
  type BreadcrumbItem,
} from "./components/app-shell/Breadcrumbs";

// --- navigation types ---
export type {
  NavItem,
  NavSection,
  NavLinkComponent,
  SidebarLabels,
} from "./navigation/types";

// --- stores ---
export {
  createUiStore,
  type UiState,
  type CreateUiStoreOptions,
  type ThemePreference,
} from "./store/ui-store";
export {
  useToastStore,
  toast,
  type ToastItem,
  type ToastOptions,
  type ToastAction,
} from "./store/toast-store";
