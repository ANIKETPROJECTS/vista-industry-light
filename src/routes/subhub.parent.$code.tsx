import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Boxes, CheckCircle2, Layers3, LogOut, Plus } from "lucide-react";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    setSignedIn(window.localStorage.getItem(SESSION_KEY) === "true");
    setReady(true);
  }, []);

  if (!parent) throw notFound();
  if (!ready) return <div className="min-h-screen bg-white" />;
  if (!signedIn) return <main className="flex min-h-screen items-center justify-center bg-white text-center"><div><p className="text-sm text-muted-foreground">Sign in to view this product structure.</p><Link to="/subhub" className="mt-4 inline-flex items-center gap-2 rounded-md border border-input bg-white px-4 py-2 text-sm font-medium"><ArrowLeft className="size-4" /> Go to SubHub</Link></div></main>;

  const selected = variants.find((variant) => variant.code === selectedCode) ?? variants[0];
  function createVariant() {
    const next = variants.length + 1;
    const variant = { code: `${code.replace("P-", "")}-NEW${next}`, name: `New ${parent.name} variant`, company: "New company", parts: [{ code: `${code}-001`, name: `${parent.name} body`, material: "POM", qty: 1 }] };
    setVariants((current) => [...current, variant]);
    setSelectedCode(variant.code);
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
          <aside className="panel h-fit overflow-hidden"><div className="flex items-center gap-3 border-b border-border px-4 py-4"><div className="min-w-0 flex-1"><h2 className="text-sm font-semibold">Company BOM variants</h2><p className="mt-1 text-xs text-muted-foreground">{variants.length} variants</p></div><button type="button" onClick={createVariant} aria-label="Create variant" className="rounded-md border border-input bg-white p-2 hover:bg-muted"><Plus className="size-4" /></button></div><div className="space-y-1 p-2">{variants.map((variant) => <button type="button" key={variant.code} onClick={() => setSelectedCode(variant.code)} className={`w-full rounded-md border p-3 text-left transition ${selected.code === variant.code ? "border-primary bg-primary/5" : "border-transparent hover:border-border hover:bg-muted/40"}`}><div className="flex items-center justify-between gap-2"><p className="tabular text-xs font-semibold text-muted-foreground">{variant.code}</p><CheckCircle2 className={`size-4 ${selected.code === variant.code ? "text-success" : "text-muted-foreground/30"}`} /></div><p className="mt-1 text-sm font-semibold">{variant.name}</p><p className="mt-1 text-xs text-muted-foreground">{variant.company}</p><p className="mt-3 border-t border-border/70 pt-2 text-xs text-muted-foreground">{variant.parts.length} raw subparts</p></button>)}</div></aside>
          <div className="panel h-fit overflow-hidden"><header className="border-b border-border px-5 py-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Raw subparts</p><h2 className="mt-1 text-lg font-semibold">{selected.name}</h2><p className="mt-1 text-sm text-muted-foreground">{selected.company} · {selected.code}</p></header><table className="w-full text-sm"><thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-5 py-3 font-medium">Raw subpart</th><th className="px-5 py-3 font-medium">Material</th><th className="px-5 py-3 text-right font-medium">Qty / parent</th></tr></thead><tbody>{selected.parts.map((part) => <tr key={part.code} className="border-b border-border/70 last:border-0"><td className="px-5 py-4"><p className="font-medium">{part.name}</p><p className="tabular text-xs text-muted-foreground">{part.code}</p></td><td className="px-5 py-4 text-muted-foreground">{part.material}</td><td className="tabular px-5 py-4 text-right font-semibold">×{part.qty}</td></tr>)}</tbody></table></div>
        </section>
      </main>
    </div>
  );
}