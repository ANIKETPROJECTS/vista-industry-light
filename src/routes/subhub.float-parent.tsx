import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Boxes, CheckCircle2, ChevronRight, Layers3, LogOut, Plus } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
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
  const [variants, setVariants] = useState(parentVariants);
  const [selectedCode, setSelectedCode] = useState("FL-RVN");
  const [showVariantCreator, setShowVariantCreator] = useState(false);

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

  const selected = variants.find((variant) => variant.code === selectedCode) ?? variants[0];

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
            <Layers3 className="size-4" /> Bills of Materials
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
           <h1 className="mt-5 text-2xl font-semibold">Float</h1>
        </header>

         <section className="grid gap-6 p-6 lg:grid-cols-[300px_minmax(0,1fr)]">
           <aside className="panel h-fit overflow-hidden">
             <div className="flex items-center gap-3 border-b border-border px-4 py-4">
               <div className="min-w-0 flex-1"><h2 className="text-sm font-semibold">Company BOM variants</h2><p className="mt-1 text-xs text-muted-foreground">{variants.length} variants</p></div>
               <button type="button" onClick={() => setShowVariantCreator(true)} aria-label="Create variant" className="rounded-md border border-input bg-white p-2 text-foreground hover:bg-muted"><Plus className="size-4" /></button>
             </div>
             <div className="space-y-1 p-2">
               {variants.map((variant) => {
                 const active = variant.code === selected.code;
                 return <button type="button" key={variant.code} onClick={() => setSelectedCode(variant.code)} className={`w-full rounded-md border p-3 text-left transition ${active ? "border-primary bg-primary/5" : "border-transparent hover:border-border hover:bg-muted/40"}`}><div className="flex items-center justify-between gap-2"><p className="tabular text-xs font-semibold text-muted-foreground">{variant.code}</p><CheckCircle2 className={`size-4 ${active ? "text-success" : "text-muted-foreground/30"}`} /></div><p className="mt-1 text-sm font-semibold">{variant.name}</p><p className="mt-1 text-xs text-muted-foreground">{variant.company}</p><p className="mt-3 border-t border-border/70 pt-2 text-xs text-muted-foreground">{variant.parts.length} raw subparts</p></button>;
               })}
             </div>
           </aside>
           <div className="panel h-fit overflow-hidden">
             <header className="border-b border-border px-5 py-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Raw subparts</p><h2 className="mt-1 text-lg font-semibold">{selected.name}</h2><p className="mt-1 text-sm text-muted-foreground">{selected.company} · components required to manufacture {selected.code}</p></header>
             <table className="w-full text-sm"><thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-5 py-3 font-medium">Raw subpart</th><th className="px-5 py-3 font-medium">Material</th><th className="px-5 py-3 text-right font-medium">Qty / parent</th></tr></thead><tbody>{selected.parts.map((part) => <tr key={part.code} className="border-b border-border/70 last:border-0"><td className="px-5 py-4"><p className="font-medium">{part.name}</p><p className="tabular text-xs text-muted-foreground">{part.code}</p></td><td className="px-5 py-4 text-muted-foreground">{part.material}</td><td className="tabular px-5 py-4 text-right font-semibold">×{part.qty}</td></tr>)}</tbody></table>
           </div>
         </section>
         {showVariantCreator ? <VariantCreatorModal onClose={() => setShowVariantCreator(false)} onCreate={(variant) => { setVariants((current) => [...current, variant]); setSelectedCode(variant.code); setShowVariantCreator(false); }} /> : null}
      </main>
    </div>
  );
}

type Variant = (typeof parentVariants)[number];

function VariantCreatorModal({ onClose, onCreate }: { onClose: () => void; onCreate: (variant: Variant) => void }) {
  const [company, setCompany] = useState("");
  const [product, setProduct] = useState("");
  const [code, setCode] = useState("");
  const [partQuantities, setPartQuantities] = useState<Record<string, number>>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedCode = code.trim().toUpperCase();
    const selectedParts = subparts
      .filter((part) => partQuantities[part.code])
      .map((part) => ({
        code: part.code,
        name: part.name,
        material: part.material,
        qty: partQuantities[part.code],
      }));
    onCreate({
      code: normalizedCode,
      name: product.trim(),
      company: company.trim(),
      parts: selectedParts,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4" role="dialog" aria-modal="true" aria-labelledby="create-variant-title">
      <form onSubmit={handleSubmit} className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="create-variant-title" className="text-lg font-semibold">Create variant</h2>
            <p className="mt-1 text-sm text-muted-foreground">Add a company-specific BOM variant.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md px-2 py-1 text-xl leading-none text-muted-foreground hover:bg-muted hover:text-foreground">×</button>
        </div>
        <label className="mt-6 block text-sm">
          <span className="mb-1.5 block font-medium">Company <span className="text-destructive">*</span></span>
          <input value={company} onChange={(event) => setCompany(event.target.value)} required placeholder="Eureka Forbes" className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </label>
        <label className="mt-4 block text-sm">
          <span className="mb-1.5 block font-medium">Variant name <span className="text-destructive">*</span></span>
          <input value={product} onChange={(event) => setProduct(event.target.value)} required placeholder="Eureka Pro" className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </label>
        <label className="mt-4 block text-sm">
          <span className="mb-1.5 block font-medium">Variant code <span className="text-destructive">*</span></span>
          <input value={code} onChange={(event) => setCode(event.target.value)} required placeholder="FL-NEW" className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </label>
        <div className="mt-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Raw parts and quantities <span className="text-destructive">*</span></p>
              <p className="mt-1 text-xs text-muted-foreground">Select the components required for this variant.</p>
            </div>
            <span className="text-xs text-muted-foreground">{Object.keys(partQuantities).length} selected</span>
          </div>
          <div className="mt-3 max-h-56 space-y-2 overflow-y-auto rounded-md border border-border p-2">
            {subparts.map((part) => {
              const selected = Boolean(partQuantities[part.code]);
              return (
                <div key={part.code} className={`flex items-center gap-3 rounded-md border px-3 py-2 ${selected ? "border-primary/40 bg-primary/5" : "border-transparent"}`}>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(event) => setPartQuantities((current) => {
                      const next = { ...current };
                      if (event.target.checked) next[part.code] = 1;
                      else delete next[part.code];
                      return next;
                    })}
                    className="size-4 accent-primary"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{part.name}</p>
                    <p className="tabular text-xs text-muted-foreground">{part.code} · {part.material}</p>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    Qty
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={partQuantities[part.code] ?? 1}
                      disabled={!selected}
                      onChange={(event) => setPartQuantities((current) => ({ ...current, [part.code]: Math.max(1, Number(event.target.value) || 1) }))}
                      className="h-8 w-16 rounded-md border border-input bg-white px-2 text-center text-sm text-foreground outline-none focus:border-primary disabled:opacity-40"
                    />
                  </label>
                </div>
              );
            })}
          </div>
          {!Object.keys(partQuantities).length ? <p className="mt-1 text-xs text-destructive">Select at least one raw part.</p> : null}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-md border border-input bg-white px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
          <button type="submit" disabled={!company.trim() || !product.trim() || !code.trim() || !Object.keys(partQuantities).length} className="rounded-md border border-input bg-white px-4 py-2 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50">Create variant</button>
        </div>
      </form>
    </div>
  );
}