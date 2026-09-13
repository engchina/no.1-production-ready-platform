import { RefreshCw, Upload } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AppShell } from "../src/components/app-shell/AppShell";
import { PageBody } from "../src/components/app-shell/PageBody";
import { orderActions, PageHeader } from "../src/components/app-shell/PageHeader";
import { StatusBadge } from "../src/components/data/status-badge";
import { Button } from "../src/components/ui/button";
import { nextTabId, Tabs } from "../src/components/ui/tabs";
import { TextField } from "../src/components/ui/text-field";

describe("Tabs", () => {
  const items = [
    { id: "all", label: "すべて" },
    { id: "off", label: "無効", disabled: true },
    { id: "failed", label: "失敗", count: 6 },
  ];

  it("← → は無効タブを飛ばして端で循環し、Home / End は端へ移る", () => {
    expect(nextTabId(items, "all", "ArrowRight")).toBe("failed");
    expect(nextTabId(items, "failed", "ArrowRight")).toBe("all");
    expect(nextTabId(items, "all", "ArrowLeft")).toBe("failed");
    expect(nextTabId(items, "failed", "Home")).toBe("all");
    expect(nextTabId(items, "all", "End")).toBe("failed");
    expect(nextTabId(items, "all", "Enter")).toBeNull();
  });

  it("選択中だけが Tab 順に入り（roving tabIndex）、パネルと aria-controls で結ばれる", () => {
    const html = renderToStaticMarkup(<Tabs items={items} value="failed" ariaLabel="表示" />);
    expect(html).toContain('role="tablist"');
    expect(html).toMatch(/id="pr-tab-failed"[^>]*aria-selected="true"[^>]*aria-controls="pr-tabpanel-failed"[^>]*tabindex="0"/);
    expect(html).toMatch(/id="pr-tab-all"[^>]*aria-selected="false"[^>]*tabindex="-1"/);
  });
});

describe("PageHeader", () => {
  it("アクションを danger → utility → secondary → primary に並べ、同じ kind は渡した順を保つ", () => {
    const ordered = orderActions([
      { id: "save", kind: "primary", label: "保存" },
      { id: "delete", kind: "danger", label: "削除" },
      { id: "reload", kind: "secondary", label: "再読込" },
      { id: "export", kind: "secondary", label: "CSV" },
      { id: "more", kind: "utility", ariaLabel: "その他" },
    ]);
    expect(ordered.map((action) => action.id)).toEqual(["delete", "more", "reload", "export", "save"]);
  });

  it("中身は PageBody と同じ計測コンテナに入る（ワイドモニタで左端が揃う）", () => {
    const measure = "max-w-[var(--content-max-width)]";
    expect(renderToStaticMarkup(<PageHeader title="文書" />)).toContain(measure);
    expect(renderToStaticMarkup(<PageBody>本文</PageBody>)).toContain(measure);
    expect(renderToStaticMarkup(<PageHeader title="文書" wide />)).not.toContain(measure);
  });

  it("本文の grid item は内容幅で広がらず、アクション群は折り返す（狭い画面で横にはみ出さない）", () => {
    expect(renderToStaticMarkup(<PageBody>本文</PageBody>)).toContain("[&amp;&gt;*]:min-w-0");
    expect(renderToStaticMarkup(<PageHeader title="文書" actions={[{ id: "a", kind: "primary", label: "保存" }]} />)).toMatch(
      /role="group"[^>]*class="[^"]*flex-wrap/
    );
  });

  it("アクションの testId と ariaLabel、補足の meta を出力する", () => {
    const html = renderToStaticMarkup(
      <PageHeader
        title="文書"
        meta={<span>最終更新 10:00</span>}
        actions={[{ id: "reload", kind: "secondary", label: "再読込", ariaLabel: "文書一覧を再読込", testId: "reload-docs" }]}
      />
    );
    expect(html).toMatch(/aria-label="文書一覧を再読込"[^>]*data-testid="reload-docs"/);
    expect(html).toContain("最終更新 10:00");
    expect(
      renderToStaticMarkup(<PageHeader title="文書" actionsTestId="doc-actions" actions={[{ id: "a", kind: "primary", label: "保存" }]} />)
    ).toMatch(/role="group"[^>]*data-testid="doc-actions"/);
  });

  it("従来の ReactNode の actions もそのまま描画する（後方互換）", () => {
    const html = renderToStaticMarkup(<PageHeader title="文書" actions={<button type="button">旧</button>} />);
    expect(html).toContain("旧</button>");
  });
});

describe("Button", () => {
  it("loading 中は先頭アイコンがスピナーに置き換わり、ラベルは変えず aria-busy と disabled が付く", () => {
    const idle = renderToStaticMarkup(<Button icon={Upload}>アップロード</Button>);
    const busy = renderToStaticMarkup(<Button icon={Upload} loading>アップロード</Button>);
    expect(idle).toContain("lucide-upload");
    expect(busy).not.toContain("lucide-upload");
    expect(busy).toContain("animate-spin");
    expect(busy).toContain("アップロード");
    expect(busy).toContain('aria-busy="true"');
    expect(busy).toContain("disabled");
    // 先頭スロットは svg 1 つだけ（スピナー + アイコンの二重表示にしない）
    expect(busy.match(/<svg/g)).toHaveLength(1);
  });

  it("trailingIcon は loading 中に出さない", () => {
    const html = renderToStaticMarkup(<Button trailingIcon={RefreshCw} loading>次へ</Button>);
    expect(html).not.toContain("lucide-refresh-cw");
  });
});

describe("StatusBadge", () => {
  it("既定でバリアントのアイコンを付け、icon={false} で外せる", () => {
    expect(renderToStaticMarkup(<StatusBadge variant="success" label="完了" />)).toContain("lucide-circle-check");
    expect(renderToStaticMarkup(<StatusBadge variant="success" label="完了" icon={false} />)).not.toContain("<svg");
  });

  it("pending は warning と同じ配色（非推奨の別名）", () => {
    const colors = (html: string) => html.match(/border-warning-border bg-warning-subtle text-warning-fg/)?.[0];
    expect(colors(renderToStaticMarkup(<StatusBadge variant="pending" label="待機" />))).toBeTruthy();
    expect(colors(renderToStaticMarkup(<StatusBadge variant="warning" label="注意" />))).toBeTruthy();
  });
});

describe("AppShell", () => {
  it("本文へスキップのリンクと、フォーカスを受けられる <main id=\"pr-main\"> を出力する", () => {
    const html = renderToStaticMarkup(<AppShell sidebar={<nav />}>本文</AppShell>);
    expect(html).toMatch(/<a class="pr-skip-link" href="#pr-main">/);
    expect(html).toMatch(/<main id="pr-main" tabindex="-1"/);
  });
});

describe("TextField", () => {
  it("required は aria-required とバッジだけで伝え、ネイティブの required 検証を付けない", () => {
    const html = renderToStaticMarkup(<TextField id="name" label="名前" required requiredLabel="必須" value="" readOnly />);
    expect(html).toContain('aria-required="true"');
    expect(html).not.toMatch(/<input[^>]*\srequired=""/);
    expect(html).toContain("必須");
  });

  it("helper にリンクを含められ、入力欄の aria-describedby と結ばれる", () => {
    const html = renderToStaticMarkup(
      <TextField id="endpoint" label="エンドポイント" value="" readOnly helper={<a href="https://example.com/docs">ドキュメント</a>} />
    );
    const describedBy = html.match(/aria-describedby="([^"]+)"/)?.[1];
    expect(describedBy).toBeTruthy();
    expect(html).toMatch(new RegExp(`<p id="${describedBy}"[^>]*><a href="https://example.com/docs">ドキュメント</a></p>`));
  });
});
