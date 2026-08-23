import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Boxes, CheckCircle2, ChevronRight, Layers3, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { skus, subparts } from "@/lib/erp-data";

const SESSION_KEY = "float-subhub-demo-session";

const parentVariants = skus.map((sku) => ({
  code: sku.code,
  name: sku.name,
  company: sku.company,
  parts: subparts
    .filter((part) => part.bom[sku.id])
    .map((part) => ({
      code: part.code,
      name: part.name,
      material: part.material,
      qty: part.bom[sku.id] ?? 1,
    })),
}));

export const Route = createFileRoute("/subhub/float-parent")({
  head: () => ({
    meta: [
      { title: "Float Parent Details — SubHub" },
      { name: "description", content: "Company variants and BOM combinations for the Float parent part." },
    ],
  }),
  component: FloatParentDetails,
});

function FloatParentDetails() {
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [selectedCode, setSelectedCode] = useState("FL-RVN");

  useEffect(() => {
    setSignedIn(window.localStorage.getItem(SESSION_KEY) === "true");
    setReady(true);
  }, []);

  if (!ready) return <div className="min-h-screen bg-background" />;
  if (!signedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <div>
          <p className="text-sm text-muted-foreground">Your SubHub session is not active.</p>
          <Link to="/subhub" className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            <ArrowLeft className="size-4" /> Go to SubHub sign in
          </Link>
        </div>
      </main>
    );
  }

  const selected = parentVariants.find((variant) => variant.code === selectedCode) ?? parentVariants[0];

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
          <div className="rule-header flex size-9 items-center justify-center rounded-md"><Boxes className="size-4" /></div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">SubHub</p>
            <p className="text-xs text-muted-foreground">Float ERP workspace</p>
          </div>
        </div>
        <nav className="flex-1 p-3">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Modules</p>
          <Link to="/subhub" className="flex items-center gap-3 rounded-md bg-sidebar-accent px-3 py-2 text-sm font-medium text-sidebar-primary">
            <Layers3 className="size-4" /> Part Families
          </Link>
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-md px-2 py-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-secondary font-mono text-xs font-semibold">AD</div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-medium">Admin</p>
              <p className="text-xs text-muted-foreground">SubHub owner</p>
            </div>
            <button type="button" aria-label="Sign out" className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground" onClick={() => {
              window.localStorage.removeItem(SESSION_KEY);
              setSignedIn(false);
            }}>
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="border-b border-border bg-background/85 px-6 py-4 backdrop-blur">
          <Link to="/subhub" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Back to parent parts
          </Link>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Parent part details</p>
              <h1 className="mt-1 text-2xl font-semibold">Float Parent</h1>
              <p className="mt-1 text-sm text-muted-foreground">One parent part manufactured for multiple companies with different BOM combinations</p>
            </div>
            <div className="rounded-md bg-primary/10 px-3 py-2 text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">Company variants</p>
              <p className="tabular mt-0.5 text-lg font-semibold text-primary">6</p>
            </div>
          </div>
        </header>

        <section className="space-y-6 p-6">
          <div className="panel overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border px-5 py-3.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Layers3 className="size-4" /></div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold">Company-specific BOM variants</h2>
                <p className="text-xs text-muted-foreground">Select a product to inspect its raw subpart combination</p>
              </div>
              <span className="rounded bg-success/10 px-2 py-1 text-[11px] font-medium text-success">Float configured</span>
            </div>
            <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
              {parentVariants.map((variant) => {
                const active = variant.code === selectedCode;
                return (
                  <button type="button" key={variant.code} onClick={() => setSelectedCode(variant.code)} className={`rounded-lg border p-4 text-left transition ${active ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:border-primary/40 hover:bg-muted/40"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="tabular text-xs font-semibold text-muted-foreground">{variant.code}</p>
                        <p className="mt-1 text-sm font-semibold">{variant.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{variant.company}</p>
                      </div>
                      <CheckCircle2 className={`size-4 ${active ? "text-success" : "text-muted-foreground/40"}`} />
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3 text-xs">
                      <span className="text-muted-foreground">{variant.parts.length} raw subparts</span>
                      <ChevronRight className={`size-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
            <div className="panel overflow-hidden">
              <header className="border-b border-border px-5 py-3.5">
                <h2 className="text-sm font-semibold">{selected.name} · raw subpart combination</h2>
                <p className="text-xs text-muted-foreground">{selected.company} · components required to manufacture {selected.code}</p>
              </header>
              <table className="w-full text-sm">
                <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr><th className="px-5 py-3 font-medium">Raw subpart</th><th className="px-5 py-3 font-medium">Material</th><th className="px-5 py-3 text-right font-medium">Qty / parent</th></tr>
                </thead>
                <tbody>
                  {selected.parts.map((part) => (
                    <tr key={part.code} className="border-b border-border/70 last:border-0">
                      <td className="px-5 py-3"><p className="font-medium">{part.name}</p><p className="tabular text-xs text-muted-foreground">{part.code}</p></td>
                      <td className="px-5 py-3 text-muted-foreground">{part.material}</td>
                      <td className="tabular px-5 py-3 text-right font-semibold">×{part.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="panel p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Architecture</p>
              <div className="mt-5 rounded-lg border-2 border-primary/30 bg-primary/5 p-4 text-center">
                <p className="tabular text-xs font-semibold text-primary">FLOAT</p>
                <p className="mt-1 text-sm font-semibold">Float Parent</p>
                <p className="mt-1 text-xs text-muted-foreground">Finished parent part</p>
              </div>
              <div className="my-3 text-center text-lg text-primary">↓</div>
              <div className="space-y-2">
                {selected.parts.map((part) => <div key={part.code} className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-xs"><span>{part.name}</span><span className="tabular text-muted-foreground">×{part.qty}</span></div>)}
              </div>
              <p className="mt-4 text-xs leading-5 text-muted-foreground">The parent stays the same while each company variant controls its own raw subpart combination.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}