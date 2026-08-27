import { createFileRoute, Link } from "@tanstack/react-router";
import { Boxes, Check, ClipboardCheck, Database, Factory, Layers3, LogOut, Minus, Plus, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { hubs, num } from "@/lib/erp-data";

const parentProducts = [
  { code: "P-FLT", name: "Float", target: 850 },
  { code: "P-ARM", name: "Float Arm", target: 620 },
  { code: "P-VAL", name: "Valve", target: 480 },
  { code: "P-CAP", name: "Cover", target: 390 },
];

export const Route = createFileRoute("/subhub/production")({
  head: () => ({ meta: [{ title: "Production — Hub Manager · SubHub" }] }),
  component: HubManagerProduction,
});

function HubManagerProduction() {
  const [activeHub, setActiveHub] = useState(hubs[0]?.code ?? "F8");
  const [production, setProduction] = useState<Record<string, number>>({ "P-FLT": 720, "P-ARM": 510, "P-VAL": 440, "P-CAP": 355 });
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const hub = hubs.find((item) => item.code === activeHub) ?? hubs[0];
  const totalProduced = Object.values(production).reduce((sum, value) => sum + value, 0);
  const totalTarget = parentProducts.reduce((sum, product) => sum + product.target, 0);
  const completion = Math.round((totalProduced / totalTarget) * 100);

  const updateQuantity = (code: string, value: number) => {
    setSaved(false);
    setProduction((current) => ({ ...current, [code]: Math.max(0, value) }));
  };

  return (
    <SubHubProductionShell>
      <header className="flex h-[65px] items-center justify-between border-b border-border bg-white px-6">
        <div className="flex items-center gap-3"><ClipboardCheck className="size-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">SubHub / Hub Manager</p><h1 className="text-lg font-semibold">Production</h1></div></div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><span>Production date</span><input type="date" defaultValue="2026-08-27" className="h-9 rounded-md border border-input bg-white px-3 text-sm text-foreground" /></div>
      </header>
      <section className="space-y-6 p-6">
        <div className="flex flex-wrap items-center gap-2"><p className="mr-2 text-sm font-medium">Select hub</p>{hubs.map((item) => <button key={item.code} type="button" onClick={() => { setActiveHub(item.code); setSaved(false); }} className={`rounded-md border px-3 py-1.5 text-xs font-medium ${activeHub === item.code ? "border-primary bg-primary/5 text-primary" : "border-input text-muted-foreground hover:bg-muted"}`}>{item.code}</button>)}<span className="ml-1 text-xs text-muted-foreground">· {hub?.name}</span></div>
        <div className="grid gap-4 sm:grid-cols-3"><Stat label="Produced today" value={num(totalProduced)} helper="parent units recorded" tone="text-primary" /><Stat label="Daily target" value={num(totalTarget)} helper="across all parent products" tone="text-success" /><Stat label="Completion" value={`${completion}%`} helper={completion >= 100 ? "target achieved" : `${num(totalTarget - totalProduced)} units remaining`} tone={completion >= 100 ? "text-success" : "text-warning"} /></div>
        <div className="rounded-xl border border-border bg-white shadow-sm"><div className="border-b border-border px-5 py-4"><h2 className="font-semibold">Parent products produced today</h2><p className="mt-1 text-sm text-muted-foreground">Enter the finished quantity for each parent product produced at {hub?.code}.</p></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-5 py-3 font-medium">Parent product</th><th className="px-5 py-3 text-right font-medium">Target</th><th className="px-5 py-3 text-center font-medium">Produced today</th><th className="px-5 py-3 text-right font-medium">Remaining</th><th className="px-5 py-3 text-right font-medium">Status</th></tr></thead><tbody>{parentProducts.map((product) => { const produced = production[product.code] ?? 0; const remaining = Math.max(0, product.target - produced); return <tr key={product.code} className="border-b border-border/70 last:border-0"><td className="px-5 py-4"><p className="font-medium">{product.name}</p><p className="text-xs text-muted-foreground">{product.code}</p></td><td className="tabular px-5 py-4 text-right">{num(product.target)}</td><td className="px-5 py-4"><div className="mx-auto flex w-36 items-center justify-center gap-1"><button type="button" aria-label={`Decrease ${product.name}`} onClick={() => updateQuantity(product.code, produced - 1)} className="flex size-8 items-center justify-center rounded-md border border-input text-muted-foreground hover:bg-muted"><Minus className="size-3.5" /></button><input type="number" min="0" value={produced} onChange={(event) => updateQuantity(product.code, Number(event.target.value))} className="h-8 w-20 rounded-md border border-input text-center text-sm font-semibold" /><button type="button" aria-label={`Increase ${product.name}`} onClick={() => updateQuantity(product.code, produced + 1)} className="flex size-8 items-center justify-center rounded-md border border-input text-muted-foreground hover:bg-muted"><Plus className="size-3.5" /></button></div></td><td className="tabular px-5 py-4 text-right text-muted-foreground">{remaining ? num(remaining) : "—"}</td><td className="px-5 py-4 text-right"><span className={`rounded-full px-2 py-1 text-[11px] font-medium ${produced >= product.target ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{produced >= product.target ? "Complete" : "In progress"}</span></td></tr>; })}</tbody></table></div></div>
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm"><label className="block text-sm font-medium">Production notes <span className="font-normal text-muted-foreground">(optional)</span><textarea value={notes} onChange={(event) => { setNotes(event.target.value); setSaved(false); }} rows={3} placeholder="Add shift notes, downtime, quality observations, or other details..." className="mt-2 w-full resize-none rounded-md border border-input px-3 py-2 text-sm outline-none focus:border-primary" /></label><div className="mt-4 flex items-center justify-end gap-3 border-t border-border pt-4">{saved ? <span className="inline-flex items-center gap-1.5 text-sm text-success"><Check className="size-4" /> Production saved</span> : null}<button type="button" onClick={() => setSaved(true)} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"><Save className="size-4" /> Save today’s production</button></div></div>
      </section>
    </SubHubProductionShell>
  );
}

function Stat({ label, value, helper, tone }: { label: string; value: string; helper: string; tone: string }) {
  return <div className="rounded-xl border border-border bg-white p-4 shadow-sm"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p><p className={`mt-2 text-2xl font-semibold ${tone}`}>{value}</p><p className="mt-1 text-xs text-muted-foreground">{helper}</p></div>;
}

function SubHubProductionShell({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen bg-white"><aside className="flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-white"><div className="flex h-[65px] shrink-0 items-center gap-3 border-b border-sidebar-border px-5"><div className="rule-header flex size-9 items-center justify-center rounded-md"><Boxes className="size-4" /></div><div className="leading-tight"><p className="text-sm font-semibold">SubHub</p><p className="text-xs text-muted-foreground">Float ERP workspace</p></div></div><nav className="flex-1 p-3"><p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Modules</p><Link to="/subhub" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-primary"><Layers3 className="size-4" /> Bills of Materials</Link><Link to="/subhub/raw-materials" className="mt-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-primary"><Database className="size-4" /> Raw Materials</Link><Link to="/inventory" className="mt-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-primary"><Factory className="size-4" /> Inventory Management</Link><div className="group"><Link to="/subhub/production" className="mt-1 flex items-center gap-3 rounded-md bg-sidebar-accent px-3 py-2 text-sm font-medium text-sidebar-primary"><ClipboardCheck className="size-4" /> Hub Manager</Link><div className="hidden pl-9 group-hover:block"><Link to="/subhub/production" className="block py-1.5 text-xs text-muted-foreground hover:text-sidebar-primary">Production</Link></div></div></nav><div className="border-t border-sidebar-border p-3"><div className="flex items-center gap-3 rounded-md px-2 py-2"><div className="flex size-8 items-center justify-center rounded-full bg-secondary font-mono text-xs font-semibold">AD</div><div className="min-w-0 flex-1 leading-tight"><p className="text-sm font-medium">Admin</p><p className="text-xs text-muted-foreground">SubHub owner</p></div><LogOut className="size-4 text-muted-foreground" /></div></div></aside><main className="min-w-0 flex-1">{children}</main></div>;
}