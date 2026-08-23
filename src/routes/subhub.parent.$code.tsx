import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Boxes, ChevronRight, Layers3, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

const SESSION_KEY = "float-subhub-demo-session";

const parentData = {
  "P-ARM": {
    name: "Float Arm Parent",
    description: "Arm and pivot parent assembly for multiple production variants",
    variants: [
      { code: "ARM-STD", name: "Standard Arm", company: "Airavata Components", parts: [["ARM-Y01", "POM arm body", "POM", 1], ["ARM-Y02", "Pivot pin", "SS 304", 1], ["ARM-Y03", "Washer", "Nylon 66", 2]] },
      { code: "ARM-HD", name: "Heavy Duty Arm", company: "Industrial Floats", parts: [["ARM-Y01", "POM arm body", "POM", 1], ["ARM-Y04", "Reinforced pivot", "SS 316", 1], ["ARM-Y05", "Locking clip", "PP", 2]] },
      { code: "ARM-CMP", name: "Compact Arm", company: "Eureka Parts", parts: [["ARM-Y06", "Compact arm body", "POM", 1], ["ARM-Y02", "Pivot pin", "SS 304", 1]] },
    ],
  },
  "P-VAL": {
    name: "Valve Parent",
    description: "Valve seat and seal parent assembly for fluid-control products",
    variants: [
      { code: "VAL-STD", name: "Standard Valve", company: "Aqua Systems", parts: [["VAL-Y01", "Brass valve seat", "Brass", 1], ["VAL-Y02", "Seal ring", "Silicone", 1], ["VAL-Y03", "Retainer", "PP", 1]] },
      { code: "VAL-HI", name: "High Pressure Valve", company: "Industrial Floats", parts: [["VAL-Y04", "Steel valve seat", "SS 304", 1], ["VAL-Y02", "Seal ring", "Silicone", 2], ["VAL-Y05", "Spring retainer", "POM", 1]] },
      { code: "VAL-ECO", name: "Economy Valve", company: "Eureka Parts", parts: [["VAL-Y01", "Brass valve seat", "Brass", 1], ["VAL-Y06", "Flat gasket", "EPDM", 1]] },
      { code: "VAL-MINI", name: "Mini Valve", company: "AO Smith", parts: [["VAL-Y07", "Mini valve seat", "Brass", 1], ["VAL-Y02", "Seal ring", "Silicone", 1]] },
    ],
  },
  "P-CAP": {
    name: "Cover Parent",
    description: "Cover and retainer parent assembly for finished Float products",
    variants: [
      { code: "CAP-STD", name: "Standard Cover", company: "Eureka Forbes", parts: [["CAP-Y01", "ABS cover cap", "ABS", 1], ["CAP-Y02", "Retainer clip", "PP", 2]] },
      { code: "CAP-CLR", name: "Clear Cover", company: "V-Guard", parts: [["CAP-Y03", "Clear cover cap", "PC", 1], ["CAP-Y02", "Retainer clip", "PP", 2], ["CAP-Y04", "Label sticker", "Vinyl", 1]] },
    ],
  },
} as const;

export const Route = createFileRoute("/subhub/parent/$code")({
  head: () => ({ meta: [{ title: "Parent BOM Details — SubHub" }] }),
  component: ParentDetails,
});

function ParentDetails() {
  const { code } = Route.useParams();
  const parent = parentData[code as keyof typeof parentData];
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [selectedCode, setSelectedCode] = useState("");

  useEffect(() => {
    setSignedIn(window.localStorage.getItem(SESSION_KEY) === "true");
    setReady(true);
  }, []);

  if (!parent) throw notFound();
  if (!ready) return <div className="min-h-screen bg-background" />;
  if (!signedIn) return <main className="flex min-h-screen items-center justify-center text-center"><div><p className="text-sm text-muted-foreground">Sign in to view this parent structure.</p><Link to="/subhub" className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><ArrowLeft className="size-4" /> Go to SubHub</Link></div></main>;

  const selected = parent.variants.find((variant) => variant.code === (selectedCode || parent.variants[0].code)) ?? parent.variants[0];
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4"><div className="rule-header flex size-9 items-center justify-center rounded-md"><Boxes className="size-4" /></div><div><p className="text-sm font-semibold">SubHub</p><p className="text-xs text-muted-foreground">Float ERP workspace</p></div></div>
        <nav className="flex-1 p-3"><p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Modules</p><Link to="/subhub" className="flex items-center gap-3 rounded-md bg-sidebar-accent px-3 py-2 text-sm font-medium text-sidebar-primary"><Layers3 className="size-4" /> Bills of Materials</Link></nav>
        <div className="border-t border-sidebar-border p-3"><div className="flex items-center gap-3 rounded-md px-2 py-2"><div className="flex size-8 items-center justify-center rounded-full bg-secondary font-mono text-xs font-semibold">AD</div><div className="min-w-0 flex-1"><p className="text-sm font-medium">Admin</p><p className="text-xs text-muted-foreground">SubHub owner</p></div><LogOut className="size-4 text-muted-foreground" /></div></div>
      </aside>
      <main className="min-w-0 flex-1">
         <header className="border-b border-border bg-background/85 px-6 py-4 backdrop-blur"><Link to="/subhub" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary"><ArrowLeft className="size-4" /> {parent.name}</Link></header>
        <section className="space-y-6 p-6"><div className="panel overflow-hidden"><div className="flex items-center gap-3 border-b border-border px-5 py-3.5"><Layers3 className="size-4 text-primary" /><div className="min-w-0 flex-1"><h2 className="text-sm font-semibold">Company-specific BOM variants</h2><p className="text-xs text-muted-foreground">Select a variant to inspect its raw subpart combination</p></div><span className="rounded bg-success/10 px-2 py-1 text-[11px] font-medium text-success">Seeded data</span></div><div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">{parent.variants.map((variant) => <button type="button" key={variant.code} onClick={() => setSelectedCode(variant.code)} className={`rounded-lg border p-4 text-left transition ${selected.code === variant.code ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:border-primary/40"}`}><p className="tabular text-xs font-semibold text-muted-foreground">{variant.code}</p><p className="mt-1 text-sm font-semibold">{variant.name}</p><p className="mt-1 text-xs text-muted-foreground">{variant.company}</p><div className="mt-3 flex items-center justify-between border-t border-border/70 pt-3 text-xs"><span className="text-muted-foreground">{variant.parts.length} raw subparts</span><ChevronRight className="size-4 text-primary" /></div></button>)}</div></div><div className="panel overflow-hidden"><header className="border-b border-border px-5 py-3.5"><h2 className="text-sm font-semibold">{selected.name} · raw subpart combination</h2><p className="text-xs text-muted-foreground">{selected.company} · components required to manufacture {selected.code}</p></header><table className="w-full text-sm"><thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-5 py-3 font-medium">Raw subpart</th><th className="px-5 py-3 font-medium">Material</th><th className="px-5 py-3 text-right font-medium">Qty / parent</th></tr></thead><tbody>{selected.parts.map(([partCode, partName, material, qty]) => <tr key={partCode} className="border-b border-border/70 last:border-0"><td className="px-5 py-3"><p className="font-medium">{partName}</p><p className="tabular text-xs text-muted-foreground">{partCode}</p></td><td className="px-5 py-3 text-muted-foreground">{material}</td><td className="tabular px-5 py-3 text-right font-semibold">×{qty}</td></tr>)}</tbody></table></div></section>
      </main>
    </div>
  );
}