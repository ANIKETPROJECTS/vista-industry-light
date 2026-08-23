import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Boxes, Layers3, LogOut, Plus, Search } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

const SESSION_KEY = "float-subhub-demo-session";

type Part = { code: string; name: string; material: string; qty: number };
type Variant = { code: string; name: string; company: string; parts: Part[] };
type Parent = { name: string; variants: Variant[] };

const parentData: Record<string, Parent> = {
  "P-ARM": {
    name: "Float Arm",
    variants: [
      { code: "ARM-STD", name: "Standard Arm", company: "Airavata Components", parts: [{ code: "ARM-Y01", name: "POM arm body", material: "POM", qty: 1 }, { code: "ARM-Y02", name: "Pivot pin", material: "SS 304", qty: 1 }, { code: "ARM-Y03", name: "Washer", material: "Nylon 66", qty: 2 }] },
      { code: "ARM-HD", name: "Heavy Duty Arm", company: "Industrial Floats", parts: [{ code: "ARM-Y01", name: "POM arm body", material: "POM", qty: 1 }, { code: "ARM-Y04", name: "Reinforced pivot", material: "SS 316", qty: 1 }, { code: "ARM-Y05", name: "Locking clip", material: "PP", qty: 2 }] },
      { code: "ARM-CMP", name: "Compact Arm", company: "Eureka Parts", parts: [{ code: "ARM-Y06", name: "Compact arm body", material: "POM", qty: 1 }, { code: "ARM-Y02", name: "Pivot pin", material: "SS 304", qty: 1 }] },
    ],
  },
  "P-VAL": {
    name: "Valve",
    variants: [
      { code: "VAL-STD", name: "Standard Valve", company: "Aqua Systems", parts: [{ code: "VAL-Y01", name: "Brass valve seat", material: "Brass", qty: 1 }, { code: "VAL-Y02", name: "Seal ring", material: "Silicone", qty: 1 }, { code: "VAL-Y03", name: "Retainer", material: "PP", qty: 1 }] },
      { code: "VAL-HI", name: "High Pressure Valve", company: "Industrial Floats", parts: [{ code: "VAL-Y04", name: "Steel valve seat", material: "SS 304", qty: 1 }, { code: "VAL-Y02", name: "Seal ring", material: "Silicone", qty: 2 }, { code: "VAL-Y05", name: "Spring retainer", material: "POM", qty: 1 }] },
      { code: "VAL-ECO", name: "Economy Valve", company: "Eureka Parts", parts: [{ code: "VAL-Y01", name: "Brass valve seat", material: "Brass", qty: 1 }, { code: "VAL-Y06", name: "Flat gasket", material: "EPDM", qty: 1 }] },
      { code: "VAL-MINI", name: "Mini Valve", company: "AO Smith", parts: [{ code: "VAL-Y07", name: "Mini valve seat", material: "Brass", qty: 1 }, { code: "VAL-Y02", name: "Seal ring", material: "Silicone", qty: 1 }] },
    ],
  },
  "P-CAP": {
    name: "Cover",
    variants: [
      { code: "CAP-STD", name: "Standard Cover", company: "Eureka Forbes", parts: [{ code: "CAP-Y01", name: "ABS cover cap", material: "ABS", qty: 1 }, { code: "CAP-Y02", name: "Retainer clip", material: "PP", qty: 2 }] },
      { code: "CAP-CLR", name: "Clear Cover", company: "V-Guard", parts: [{ code: "CAP-Y03", name: "Clear cover cap", material: "PC", qty: 1 }, { code: "CAP-Y02", name: "Retainer clip", material: "PP", qty: 2 }, { code: "CAP-Y04", name: "Label sticker", material: "Vinyl", qty: 1 }] },
    ],
  },
};

export const Route = createFileRoute("/subhub/parent/$code")({
  head: () => ({ meta: [{ title: "Parent BOM Details — SubHub" }] }),
  component: ParentDetails,
});

function ParentDetails() {
  const { code } = Route.useParams();
  const parent = parentData[code];
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [variants, setVariants] = useState<Variant[]>(parent?.variants ?? []);
  const [selectedCode, setSelectedCode] = useState(parent?.variants[0]?.code ?? "");
  const [variantSearch, setVariantSearch] = useState("");
  const [showVariantCreator, setShowVariantCreator] = useState(false);

  useEffect(() => {
    setSignedIn(window.localStorage.getItem(SESSION_KEY) === "true");
    setReady(true);
  }, []);

  if (!parent) throw notFound();
  if (!ready) return <div className="min-h-screen bg-white" />;
  if (!signedIn) return <main className="flex min-h-screen items-center justify-center bg-white text-center"><div><p className="text-sm text-muted-foreground">Sign in to view this product structure.</p><Link to="/subhub" className="mt-4 inline-flex items-center gap-2 rounded-md border border-input bg-white px-4 py-2 text-sm font-medium"><ArrowLeft className="size-4" /> Go to SubHub</Link></div></main>;

  const selected = variants.find((variant) => variant.code === selectedCode) ?? variants[0];
  const filteredVariants = variants.filter((variant) => `${variant.code} ${variant.name} ${variant.company}`.toLowerCase().includes(variantSearch.toLowerCase()));
  const availableParts = Array.from(new Map(parent.variants.flatMap((variant) => variant.parts).map((part) => [part.code, part])).values());
  function createVariant(variant: Variant) {
    setVariants((current) => [...current, variant]);
    setSelectedCode(variant.code);
    setShowVariantCreator(false);
  }

  return (
    <div className="flex min-h-screen bg-white">
      <aside className="flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-white">
        <div className="flex h-[65px] shrink-0 items-center gap-3 border-b border-sidebar-border px-5"><div className="rule-header flex size-9 items-center justify-center rounded-md"><Boxes className="size-4" /></div><div className="leading-tight"><p className="text-sm font-semibold">SubHub</p><p className="text-xs text-muted-foreground">Float ERP workspace</p></div></div>
        <nav className="flex-1 p-3"><p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Modules</p><Link to="/subhub" className="flex items-center gap-3 rounded-md bg-sidebar-accent px-3 py-2 text-sm font-medium text-sidebar-primary"><Layers3 className="size-4" /> Bills of Materials</Link></nav>
        <div className="border-t border-sidebar-border p-3"><div className="flex items-center gap-3 rounded-md px-2 py-2"><div className="flex size-8 items-center justify-center rounded-full bg-secondary font-mono text-xs font-semibold">AD</div><div className="min-w-0 flex-1 leading-tight"><p className="text-sm font-medium">Admin</p><p className="text-xs text-muted-foreground">SubHub owner</p></div><LogOut className="size-4 text-muted-foreground" /></div></div>
      </aside>
      <main className="min-w-0 flex-1">
        <header className="h-[65px] border-b border-border bg-white px-6"><Link to="/subhub" className="inline-flex h-full items-center gap-2 text-lg font-semibold text-foreground hover:text-primary"><ArrowLeft className="size-4" /> {parent.name}</Link></header>
        <section className="grid gap-6 bg-white p-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="panel h-fit overflow-hidden"><div className="border-b border-border px-4 py-4"><div className="flex items-center gap-3"><div className="min-w-0 flex-1"><h2 className="text-sm font-semibold">Company BOM variants</h2><p className="mt-1 text-xs text-muted-foreground">{variants.length} variants</p></div><button type="button" onClick={() => setShowVariantCreator(true)} aria-label="Create variant" className="rounded-md border border-input bg-white p-2 hover:bg-muted"><Plus className="size-4" /></button></div><label className="relative mt-3 block"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={variantSearch} onChange={(event) => setVariantSearch(event.target.value)} placeholder="Search variants" className="h-9 w-full rounded-md border border-input bg-white pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /></label></div><div className="space-y-1 p-2">{filteredVariants.map((variant) => <button type="button" key={variant.code} onClick={() => setSelectedCode(variant.code)} className={`w-full rounded-md border p-3 text-left transition ${selected.code === variant.code ? "border-primary bg-primary/5" : "border-transparent hover:border-border hover:bg-muted/40"}`}><p className="tabular text-xs font-semibold text-muted-foreground">{variant.code}</p><p className="mt-1 text-sm font-semibold">{variant.name}</p><p className="mt-1 text-xs text-muted-foreground">{variant.company}</p></button>)}</div></aside>
          <div className="panel h-fit overflow-hidden"><header className="border-b border-border px-5 py-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Raw subparts</p><h2 className="mt-1 text-lg font-semibold">{selected.name}</h2><p className="mt-1 text-sm text-muted-foreground">{selected.company} · {selected.code}</p></header><table className="w-full text-sm"><thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-5 py-3 font-medium">Raw subpart</th><th className="px-5 py-3 font-medium">Material</th><th className="px-5 py-3 text-right font-medium">Qty / parent</th></tr></thead><tbody>{selected.parts.map((part) => <tr key={part.code} className="border-b border-border/70 last:border-0"><td className="px-5 py-4"><p className="font-medium">{part.name}</p><p className="tabular text-xs text-muted-foreground">{part.code}</p></td><td className="px-5 py-4 text-muted-foreground">{part.material}</td><td className="tabular px-5 py-4 text-right font-semibold">×{part.qty}</td></tr>)}</tbody></table></div>
        </section>
        {showVariantCreator ? <VariantDrawer parentName={parent.name} prefix={code} availableParts={availableParts} onClose={() => setShowVariantCreator(false)} onCreate={createVariant} /> : null}
       </main>
    </div>
  );
}

function VariantDrawer({ parentName, prefix, availableParts, onClose, onCreate }: { parentName: string; prefix: string; availableParts: Part[]; onClose: () => void; onCreate: (variant: Variant) => void }) {
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [variantCode, setVariantCode] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [partSearch, setPartSearch] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreate({ code: variantCode.trim().toUpperCase(), name: name.trim(), company: company.trim(), parts: availableParts.filter((part) => quantities[part.code]).map((part) => ({ ...part, qty: quantities[part.code] })) });
  }
  const filteredParts = availableParts.filter((part) => `${part.code} ${part.name} ${part.material}`.toLowerCase().includes(partSearch.toLowerCase()));
  return <div className="fixed inset-0 z-50 flex justify-end bg-black/20" role="dialog" aria-modal="true"><form onSubmit={submit} className="flex h-full w-full max-w-md flex-col overflow-y-auto rounded-l-xl border-y border-l border-border bg-white p-6 shadow-xl"><div className="flex items-start justify-between"><div><h2 className="text-lg font-semibold">Create variant</h2><p className="mt-1 text-sm text-muted-foreground">Add a {parentName} company-specific BOM.</p></div><button type="button" onClick={onClose} className="text-xl text-muted-foreground">×</button></div><label className="mt-6 block text-sm font-medium">Company<input required value={company} onChange={(event) => setCompany(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-input px-3 font-normal" /></label><label className="mt-4 block text-sm font-medium">Variant name<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-input px-3 font-normal" /></label><label className="mt-4 block text-sm font-medium">Variant code<input required placeholder={`${prefix}-NEW`} value={variantCode} onChange={(event) => setVariantCode(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-input px-3 font-normal" /></label><div className="mt-6 flex min-h-0 flex-1 flex-col"><p className="text-sm font-medium">Raw parts and quantities <span className="text-destructive">*</span></p><label className="relative mt-3 block"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={partSearch} onChange={(event) => setPartSearch(event.target.value)} placeholder="Search raw parts" className="h-9 w-full rounded-md border border-input pl-9 pr-3 text-sm outline-none focus:border-primary" /></label><div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto rounded-md border border-border p-2">{filteredParts.map((part) => { const checked = Boolean(quantities[part.code]); return <div key={part.code} className="flex items-center gap-3 rounded-md border border-border p-3"><input type="checkbox" checked={checked} onChange={(event) => setQuantities((current) => event.target.checked ? { ...current, [part.code]: 1 } : Object.fromEntries(Object.entries(current).filter(([key]) => key !== part.code)))} /><span className="min-w-0 flex-1 text-sm">{part.name}<small className="block text-xs text-muted-foreground">{part.code} · {part.material}</small></span><input type="number" min="1" disabled={!checked} value={quantities[part.code] ?? 1} onChange={(event) => setQuantities((current) => ({ ...current, [part.code]: Math.max(1, Number(event.target.value) || 1) }))} className="h-8 w-16 rounded-md border border-input text-center disabled:opacity-40" /></div>; })}</div></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-md border border-input px-4 py-2 text-sm">Cancel</button><button type="submit" disabled={!Object.keys(quantities).length} className="rounded-md border border-input px-4 py-2 text-sm disabled:opacity-50">Create variant</button></div></form></div>;
}