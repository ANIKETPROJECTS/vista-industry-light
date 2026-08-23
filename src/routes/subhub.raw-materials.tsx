import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Boxes, Database, Layers3, LogOut, PackageOpen, Plus, Search, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { subparts } from "@/lib/erp-data";

const SESSION_KEY = "float-subhub-demo-session";

type RawMaterial = {
  code: string;
  name: string;
  description: string;
  material: string;
};

const seededMaterials: RawMaterial[] = subparts.map((part) => ({
  code: part.code,
  name: part.name,
  description: `${part.source} raw part used in parent-product BOM assemblies.`,
  material: part.material,
}));

export const Route = createFileRoute("/subhub/raw-materials")({
  head: () => ({ meta: [{ title: "Raw Materials — SubHub" }] }),
  component: RawMaterials,
});

function RawMaterials() {
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [materials, setMaterials] = useState<RawMaterial[]>(seededMaterials);
  const [query, setQuery] = useState("");
  const [showCreator, setShowCreator] = useState(false);

  useEffect(() => {
    setSignedIn(window.localStorage.getItem(SESSION_KEY) === "true");
    setReady(true);
  }, []);

  const filteredMaterials = useMemo(
    () => materials.filter((item) => `${item.code} ${item.name} ${item.description} ${item.material}`.toLowerCase().includes(query.toLowerCase())),
    [materials, query],
  );

  if (!ready) return <div className="min-h-screen bg-white" />;
  if (!signedIn) {
    return <main className="flex min-h-screen items-center justify-center bg-white text-center"><div><p className="text-sm text-muted-foreground">Sign in to view raw materials.</p><Link to="/subhub" className="mt-4 inline-flex items-center gap-2 rounded-md border border-input bg-white px-4 py-2 text-sm font-medium"><ArrowLeft className="size-4" /> Go to SubHub</Link></div></main>;
  }

  return (
    <div className="flex min-h-screen bg-white">
      <aside className="flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-white">
        <div className="flex h-[65px] shrink-0 items-center gap-3 border-b border-sidebar-border px-5"><div className="rule-header flex size-9 items-center justify-center rounded-md"><Boxes className="size-4" /></div><div className="leading-tight"><p className="text-sm font-semibold">SubHub</p><p className="text-xs text-muted-foreground">Float ERP workspace</p></div></div>
        <nav className="flex-1 p-3" aria-label="SubHub navigation"><p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Modules</p><Link to="/subhub" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-primary"><Layers3 className="size-4" /> Bills of Materials</Link><Link to="/subhub/raw-materials" className="mt-1 flex items-center gap-3 rounded-md bg-sidebar-accent px-3 py-2 text-sm font-medium text-sidebar-primary"><Database className="size-4" /> Raw Materials</Link><Link to="/inventory" className="mt-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-primary"><PackageOpen className="size-4" /> Inventory Management</Link></nav>
        <div className="border-t border-sidebar-border p-3"><div className="flex items-center gap-3 rounded-md px-2 py-2"><div className="flex size-8 items-center justify-center rounded-full bg-secondary font-mono text-xs font-semibold">AD</div><div className="min-w-0 flex-1 leading-tight"><p className="text-sm font-medium">Admin</p><p className="text-xs text-muted-foreground">SubHub owner</p></div><button type="button" aria-label="Sign out" onClick={() => { window.localStorage.removeItem(SESSION_KEY); setSignedIn(false); }}><LogOut className="size-4 text-muted-foreground" /></button></div></div>
      </aside>
      <main className="min-w-0 flex-1">
        <header className="flex h-[65px] items-center justify-between border-b border-border bg-white px-6"><div className="flex items-center gap-3"><Database className="size-5 text-muted-foreground" /><h1 className="text-lg font-semibold">Raw Materials</h1></div><button type="button" onClick={() => setShowCreator(true)} className="inline-flex items-center gap-2 rounded-md border border-input bg-white px-3 py-2 text-sm font-medium hover:bg-muted"><Plus className="size-4" /> New raw material</button></header>
        <section className="p-6"><div className="mb-5 flex items-center justify-between gap-4"><div><p className="text-sm text-muted-foreground">{materials.length} raw materials</p></div><label className="relative block w-full max-w-xs"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search raw materials" className="h-9 w-full rounded-md border border-input bg-white pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" /></label></div><div className="panel overflow-hidden"><table className="w-full text-sm"><thead className="border-b border-border bg-muted/20 text-left text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-5 py-3 font-medium">Code</th><th className="px-5 py-3 font-medium">Name</th><th className="px-5 py-3 font-medium">Description</th><th className="px-5 py-3 font-medium">Material</th></tr></thead><tbody>{filteredMaterials.map((item) => <tr key={item.code} className="border-b border-border/70 last:border-0"><td className="tabular px-5 py-4 font-medium">{item.code}</td><td className="px-5 py-4 font-medium">{item.name}</td><td className="px-5 py-4 text-muted-foreground">{item.description}</td><td className="px-5 py-4 text-muted-foreground">{item.material}</td></tr>)}{!filteredMaterials.length ? <tr><td colSpan={4} className="px-5 py-12 text-center text-sm text-muted-foreground">No raw materials found.</td></tr> : null}</tbody></table></div></section>
        {showCreator ? <RawMaterialDrawer onClose={() => setShowCreator(false)} onCreate={(item) => { setMaterials((current) => [...current, item]); setShowCreator(false); }} /> : null}
      </main>
    </div>
  );
}

function RawMaterialDrawer({ onClose, onCreate }: { onClose: () => void; onCreate: (item: RawMaterial) => void }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [material, setMaterial] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreate({ code: code.trim().toUpperCase(), name: name.trim(), description: description.trim(), material: material.trim() });
  }
  return <div className="fixed inset-0 z-50 flex justify-end bg-black/20" role="dialog" aria-modal="true" aria-labelledby="new-raw-material-title"><form onSubmit={submit} className="flex h-full w-full max-w-md flex-col border-y border-l border-border bg-white p-6 shadow-xl"><div className="flex items-start justify-between"><div><h2 id="new-raw-material-title" className="text-lg font-semibold">New raw material</h2><p className="mt-1 text-sm text-muted-foreground">Add a material to the shared raw-material catalog.</p></div><button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-muted-foreground hover:bg-muted"><X className="size-5" /></button></div><label className="mt-6 block text-sm font-medium">Code<input required value={code} onChange={(event) => setCode(event.target.value)} placeholder="GP006-050" className="mt-1 h-10 w-full rounded-md border border-input px-3 font-normal outline-none focus:border-primary" /></label><label className="mt-4 block text-sm font-medium">Name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Raw part name" className="mt-1 h-10 w-full rounded-md border border-input px-3 font-normal outline-none focus:border-primary" /></label><label className="mt-4 block text-sm font-medium">Description<textarea required value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the raw material or part" rows={4} className="mt-1 w-full resize-none rounded-md border border-input px-3 py-2 font-normal outline-none focus:border-primary" /></label><label className="mt-4 block text-sm font-medium">Material<input required value={material} onChange={(event) => setMaterial(event.target.value)} placeholder="Nylon 66" className="mt-1 h-10 w-full rounded-md border border-input px-3 font-normal outline-none focus:border-primary" /></label><div className="mt-auto flex justify-end gap-3 pt-8"><button type="button" onClick={onClose} className="rounded-md border border-input px-4 py-2 text-sm font-medium">Cancel</button><button type="submit" disabled={!code.trim() || !name.trim() || !description.trim() || !material.trim()} className="rounded-md border border-input px-4 py-2 text-sm font-medium disabled:opacity-50">Add raw material</button></div></form></div>;
}