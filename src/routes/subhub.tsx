import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, Boxes, ChevronRight, CircleDot, Layers3, LogOut, Plus, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { skus, subparts } from "@/lib/erp-data";

const DEMO_EMAIL = "admin";
const DEMO_PASSWORD = "admin123";
const SESSION_KEY = "float-subhub-demo-session";

type RawPart = {
  code: string;
  name: string;
  material: string;
  qty: number;
};

type ParentPart = {
  code: string;
  name: string;
  description: string;
  status: "Active" | "Draft";
  parts: RawPart[];
};

const floatParents: ParentPart[] = skus.map((sku) => ({
  code: sku.code,
  name: sku.name,
  description: `${sku.company} · Float parent variant`,
  status: "Active",
  parts: subparts
    .filter((part) => part.bom[sku.id])
    .map((part) => ({
      code: part.code,
      name: part.name,
      material: part.material,
      qty: part.bom[sku.id] ?? 1,
    })),
}));

const families = [
  {
    code: "FLOAT",
    name: "Float Parent",
    description: "One parent part manufactured for multiple companies with different BOM combinations",
    parents: floatParents,
  },
];

const parentCards = [
  {
    code: "P-FLT",
    name: "Float Parent",
    image: "/float-parent-parts.png",
    description: "Main parent assembly manufactured for multiple company variants",
    family: "FLOAT",
    status: "Configured",
    enabled: true,
    variants: 6,
    subparts: 11,
    owner: "Production engineering",
    updated: "23 Aug 2026",
  },
  {
    code: "P-ARM",
    name: "Float Arm Parent",
    image: "/float-arm-parent-parts.png",
    description: "Parent definition for arm and pivot assemblies",
    family: "ARM",
    status: "Configured",
    enabled: true,
    variants: 3,
    subparts: 7,
    owner: "Assembly engineering",
    updated: "20 Aug 2026",
  },
  {
    code: "P-VAL",
    name: "Valve Parent",
    image: "/valve-parent-parts.png",
    description: "Parent definition for valve seat and seal assemblies",
    family: "VALVE",
    status: "Configured",
    enabled: true,
    variants: 4,
    subparts: 9,
    owner: "Molding engineering",
    updated: "18 Aug 2026",
  },
  {
    code: "P-CAP",
    name: "Cover Parent",
    image: "/cover-parent-parts.png",
    description: "Parent definition for cover and retainer assemblies",
    family: "COVER",
    status: "Configured",
    enabled: true,
    variants: 2,
    subparts: 5,
    owner: "Tooling engineering",
    updated: "15 Aug 2026",
  },
];
type ParentCard = (typeof parentCards)[number];

export const Route = createFileRoute("/subhub")({
  head: () => ({
    meta: [
      { title: "SubHub — Float ERP" },
      { name: "description", content: "SubHub workspace for the Float ERP prototype." },
    ],
  }),
  component: SubHub,
});

function SubHub() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [parentVariants, setParentVariants] = useState(floatParents);
  const [selectedParentCode, setSelectedParentCode] = useState("FL-RVN");
  const [showCreator, setShowCreator] = useState(false);
  const [selectedParent, setSelectedParent] = useState("");
  const [parentDefinitions, setParentDefinitions] = useState<ParentCard[]>(parentCards);
  const [showParentCreator, setShowParentCreator] = useState(false);

  useEffect(() => {
    setSignedIn(window.localStorage.getItem(SESSION_KEY) === "true");
    setReady(true);
  }, []);

  if (!ready) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!signedIn) {
    return <SubHubLogin onSuccess={() => setSignedIn(true)} />;
  }

  if (pathname.startsWith("/subhub/") && pathname !== "/subhub") {
    return <Outlet />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
          <div className="rule-header flex size-9 items-center justify-center rounded-md">
            <Boxes className="size-4" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">SubHub</p>
            <p className="text-xs text-muted-foreground">Float ERP workspace</p>
          </div>
        </div>
        <nav className="flex-1 p-3" aria-label="SubHub navigation">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Modules</p>
          <div className="flex items-center gap-3 rounded-md bg-sidebar-accent px-3 py-2 text-sm font-medium text-sidebar-primary">
            <Layers3 className="size-4" />
            Bills of Materials
          </div>
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-md px-2 py-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-secondary font-mono text-xs font-semibold">
              AD
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-medium">Admin</p>
              <p className="text-xs text-muted-foreground">SubHub owner</p>
            </div>
            <button
              type="button"
              aria-label="Sign out"
              title="Sign out"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
              onClick={() => {
                window.localStorage.removeItem(SESSION_KEY);
                setSignedIn(false);
              }}
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-border bg-background/85 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold">Bills of Materials</h1>
            </div>
          </div>
        </header>
        <section className="flex-1 space-y-6 p-6">
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setShowParentCreator((current) => !current)} className="rule-header inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium">
                  <Plus className="size-4" />
                  {showParentCreator ? "Close" : "Add parent product"}
                </button>
              </div>
            </div>
            {showParentCreator ? (
              <ParentProductCreator
                onCreate={(parent) => {
                  setParentDefinitions((current) => [...current, parent]);
                  setShowParentCreator(false);
                }}
              />
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {parentDefinitions.map((parent) => {
                const selected = selectedParent === parent.code;
                return (
                  <a
                    key={parent.code}
                    href={parent.code === "P-FLT" ? "/subhub/float-parent" : `/subhub/parent/${parent.code}`}
                    className={`panel group relative p-5 text-left transition ${
                      selected ? "border-primary bg-primary/[0.04] ring-1 ring-primary/20" : parent.enabled ? "hover:-translate-y-0.5 hover:border-primary/40" : "cursor-not-allowed opacity-65"
                    }`}
                  >
                    <div className="flex h-32 items-center justify-center">
                      <img src={parent.image} alt={`${parent.name} component parts`} className="size-full object-contain" />
                    </div>
                    <p className="tabular mt-2 text-xs font-semibold text-muted-foreground">{parent.code}</p>
                    <p className="mt-1 text-base font-semibold">{parent.name}</p>
                    <p className="mt-1 min-h-10 text-sm leading-5 text-muted-foreground">{parent.description}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/70 pt-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Variants</p>
                        <p className="tabular mt-0.5 text-sm font-semibold">{parent.variants}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Raw parts</p>
                        <p className="tabular mt-0.5 text-sm font-semibold">{parent.subparts}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-sm font-medium text-primary">
                      Open structure <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {selectedParent && selectedParent !== "P-FLT" ? (
            <div className="panel flex min-h-40 items-center justify-center p-6 text-center">
              <div>
                <Boxes className="mx-auto size-8 text-muted-foreground/60" />
                <p className="mt-3 text-sm font-medium">This parent structure is ready to be configured</p>
                <p className="mt-1 text-xs text-muted-foreground">Select Float Parent to open the existing company BOM architecture.</p>
              </div>
            </div>
          ) : null}

          {selectedParent !== "P-FLT" ? null : (
          <div className="panel overflow-hidden">
            <div className="flex flex-wrap items-start gap-4 border-b border-border px-5 py-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Layers3 className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold">Float Parent</h2>
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">{parentVariants.length} company variants</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{families[0].description}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreator((current) => !current)}
                className="rule-header inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
              >
                <Plus className="size-4" />
                {showCreator ? "Close creator" : "Create variant"}
              </button>
            </div>
            <div className="grid gap-3 p-4 lg:grid-cols-3">
              {parentVariants.map((parent) => {
                const selected = parent.code === selectedParentCode;
                return (
                  <button
                    type="button"
                    key={parent.code}
                    onClick={() => setSelectedParentCode(parent.code)}
                    className={`rounded-lg border p-4 text-left transition ${
                      selected ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <CircleDot className={`mt-0.5 size-4 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="min-w-0 flex-1">
                        <p className="tabular text-xs font-semibold text-muted-foreground">{parent.code}</p>
                        <p className="mt-1 text-sm font-semibold">{parent.name}</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">{parent.description}</p>
                      </div>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${parent.status === "Active" ? "bg-success/10 text-success" : "bg-warning/20 text-warning-foreground"}`}>
                        {parent.status}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3 text-xs">
                      <span className="text-muted-foreground">{parent.parts.length} raw subparts</span>
                      <ChevronRight className={`size-4 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          )}

          {selectedParent === "P-FLT" && showCreator ? (
            <VariantCreator
              onCreate={(parent) => {
                setParentVariants((current) => [...current, parent]);
                setSelectedParentCode(parent.code);
                setShowCreator(false);
              }}
            />
          ) : null}
          {selectedParent === "P-FLT" ? <PartRecipe parent={parentVariants.find((parent) => parent.code === selectedParentCode) ?? parentVariants[0]} /> : null}
        </section>
      </main>
    </div>
  );
}

function PartRecipe({ parent }: { parent: ParentPart }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
      <div className="panel overflow-hidden">
        <header className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3.5">
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold">Subpart combination</h2>
            <p className="text-xs text-muted-foreground">Raw Y parts required to manufacture {parent.code}</p>
          </div>
          <span className="tabular rounded bg-secondary px-2 py-1 text-xs font-medium">{parent.parts.length} components</span>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Raw subpart</th>
                <th className="px-5 py-3 font-medium">Material</th>
                <th className="px-5 py-3 text-right font-medium">Qty / parent</th>
              </tr>
            </thead>
            <tbody>
              {parent.parts.map((part) => (
                <tr key={part.code} className="border-b border-border/70 last:border-0 hover:bg-muted/40">
                  <td className="px-5 py-3">
                    <p className="font-medium">{part.name}</p>
                    <p className="tabular text-xs text-muted-foreground">{part.code}</p>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{part.material}</td>
                  <td className="tabular px-5 py-3 text-right font-semibold">×{part.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Assembly relationship</p>
        <div className="mt-5 flex flex-col items-center">
          <div className="w-full rounded-lg border-2 border-primary/30 bg-primary/5 p-4 text-center">
            <p className="tabular text-xs font-semibold text-primary">{parent.code}</p>
            <p className="mt-1 text-sm font-semibold">{parent.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">Finished parent part X</p>
          </div>
          <div className="h-8 border-l border-dashed border-primary/40" />
          <div className="relative w-full">
            <div className="absolute left-1/2 top-0 h-3 w-[calc(100%-64px)] -translate-x-1/2 border-l border-r border-t border-dashed border-primary/40" />
            <div className="grid gap-2 pt-3 sm:grid-cols-2">
              {parent.parts.map((part) => (
                <div key={part.code} className="rounded-md border border-border bg-card px-3 py-2 text-center">
                  <p className="tabular text-[11px] font-semibold">{part.code}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{part.name}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">Each company variant can use a different raw subpart combination.</p>
        </div>
      </div>
    </div>
  );
}

function ParentProductCreator({ onCreate }: { onCreate: (parent: ParentCard) => void }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreate({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim() || "New parent product definition",
      family: code.trim().toUpperCase(),
      status: "Not configured",
      enabled: false,
      image: "/parent-part-placeholder.svg",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="panel mb-4 border-primary/30 bg-primary/[0.02] p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">Add parent product</h3>
          <p className="mt-1 text-xs text-muted-foreground">Create the parent definition first, then configure its variants and BOM structure.</p>
        </div>
        <button type="submit" disabled={!name.trim() || !code.trim()} className="rule-header inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50">
          <Plus className="size-4" />
          Add product
        </button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1.5 block font-medium">Product name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Pump Parent" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block font-medium">Parent code</span>
          <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="P-PMP" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block font-medium">Short description</span>
          <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Pump assembly definition" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </label>
      </div>
    </form>
  );
}

function PartPlaceholderImage() {
  return (
    <svg viewBox="0 0 160 120" role="img" aria-label="Illustration of an industrial parent part" className="size-full">
      <rect width="160" height="120" rx="14" fill="#EAF2F7" />
      <path d="M25 82.5 58 62l33 20.5L58 103 25 82.5Z" fill="#79A8BF" />
      <path d="M58 62V23l33 19.5v40L58 62Z" fill="#3C7694" />
      <path d="M25 82.5v-39L58 23v39L25 82.5Z" fill="#A7C6D4" />
      <path d="m75 72 33-20.5L141 72l-33 20.5L75 72Z" fill="#D99A45" />
      <path d="M108 51.5v-19L141 52v20l-33-20.5Z" fill="#B97829" />
      <path d="M75 72V53l33-21v19.5L75 72Z" fill="#F0BD70" />
      <circle cx="57.5" cy="42.5" r="8" fill="#EAF2F7" fillOpacity=".85" />
      <circle cx="108" cy="51.5" r="5" fill="#FFF4DF" />
    </svg>
  );
}

function VariantCreator({ onCreate }: { onCreate: (parent: ParentPart) => void }) {
  const [company, setCompany] = useState("");
  const [product, setProduct] = useState("");
  const [code, setCode] = useState("");
  const [selectedParts, setSelectedParts] = useState<string[]>([]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parts = subparts
      .filter((part) => selectedParts.includes(part.code))
      .map((part) => ({ code: part.code, name: part.name, material: part.material, qty: 1 }));
    if (!parts.length) return;

    onCreate({
      code: code.trim().toUpperCase(),
      name: product.trim(),
      description: `${company.trim()} · Float parent variant`,
      status: "Draft",
      parts,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="panel border-primary/30 bg-primary/[0.02] p-5">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold">Create a company BOM variant</h2>
          <p className="mt-1 text-xs text-muted-foreground">Start with the Float parent, then choose the raw parts needed for this company model.</p>
        </div>
        <span className="rounded bg-warning/20 px-2 py-1 text-[11px] font-medium text-warning-foreground">Draft until approved</span>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <label className="text-sm">
          <span className="mb-2 block font-medium">Company</span>
          <input value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Eureka Forbes" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </label>
        <label className="text-sm">
          <span className="mb-2 block font-medium">Product name</span>
          <input value={product} onChange={(event) => setProduct(event.target.value)} placeholder="Eureka Reviva Pro" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </label>
        <label className="text-sm">
          <span className="mb-2 block font-medium">Variant code</span>
          <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="FL-RVP" required className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </label>
      </div>
      <fieldset className="mt-5">
        <legend className="text-sm font-medium">Select raw subparts</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {subparts.map((part) => {
            const checked = selectedParts.includes(part.code);
            return (
              <label key={part.code} className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition ${checked ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    setSelectedParts((current) =>
                      checked ? current.filter((code) => code !== part.code) : [...current, part.code],
                    )
                  }
                  className="size-4 accent-primary"
                />
                <span className="min-w-0">
                  <span className="block font-medium">{part.name}</span>
                  <span className="tabular block text-[11px] text-muted-foreground">{part.code}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">{selectedParts.length} raw parts selected · quantities can be refined later</p>
        <button type="submit" disabled={!selectedParts.length} className="rule-header inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50">
          <Plus className="size-4" />
          Add BOM variant
        </button>
      </div>
    </form>
  );
}

function SubHubLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      setError("That demo email or password is incorrect.");
      return;
    }

    window.localStorage.setItem(SESSION_KEY, "true");
    setError("");
    onSuccess();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
          Back to Float ERP
        </Link>
        <div className="panel overflow-hidden">
          <div className="rule-header px-7 py-8">
            <div className="flex size-11 items-center justify-center rounded-xl bg-white/15">
              <ShieldCheck className="size-6" />
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Float ERP</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Sign in to SubHub</h1>
            <p className="mt-2 text-sm text-white/75">Enter the demo credentials to open your new workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-7">
            <div>
              <label htmlFor="subhub-email" className="mb-2 block text-sm font-medium">
                Email
              </label>
              <input
                id="subhub-email"
                type="text"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin"
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <div>
              <label htmlFor="subhub-password" className="mb-2 block text-sm font-medium">
                Password
              </label>
              <input
                id="subhub-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="admin123"
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div className="rounded-md border border-border bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
              Demo access: <span className="font-mono font-semibold text-foreground">admin</span> /{" "}
              <span className="font-mono font-semibold text-foreground">admin123</span>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <button
              type="submit"
              className="rule-header inline-flex h-11 w-full items-center justify-center rounded-md px-4 text-sm font-semibold transition-opacity hover:opacity-90"
            >
              Open SubHub
            </button>
          </form>
        </div>
        <p className="mt-5 text-center text-xs text-muted-foreground">Demo login · no real account or data is created</p>
      </div>
    </main>
  );
}