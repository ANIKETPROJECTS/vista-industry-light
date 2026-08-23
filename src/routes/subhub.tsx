import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Boxes, ChevronRight, CircleDot, Layers3, LogOut, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

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

const families = [
  {
    code: "K",
    name: "K Family",
    description: "Float control assemblies with shared parent-part architecture",
    parents: [
      {
        code: "K-X-001",
        name: "X Parent — Standard",
        description: "Base K-family parent part for standard assemblies",
        status: "Active" as const,
        parts: [
          { code: "Y-101", name: "Raw shell", material: "PP Copo", qty: 1 },
          { code: "Y-102", name: "Pivot pin", material: "SS 304", qty: 1 },
          { code: "Y-103", name: "Seal gasket", material: "Silicone", qty: 1 },
          { code: "Y-104", name: "Retainer clip", material: "PP", qty: 2 },
        ],
      },
      {
        code: "K-X-002",
        name: "X Parent — Heavy Duty",
        description: "Reinforced version for high-cycle production",
        status: "Active" as const,
        parts: [
          { code: "Y-101", name: "Raw shell", material: "PP Copo", qty: 1 },
          { code: "Y-102", name: "Pivot pin", material: "SS 304", qty: 1 },
          { code: "Y-105", name: "Brass valve seat", material: "Brass", qty: 1 },
          { code: "Y-106", name: "Locking screw", material: "MS Zinc", qty: 2 },
        ],
      },
      {
        code: "K-X-003",
        name: "X Parent — Compact",
        description: "Compact variant with a reduced subpart combination",
        status: "Draft" as const,
        parts: [
          { code: "Y-101", name: "Raw shell", material: "PP Copo", qty: 1 },
          { code: "Y-107", name: "Compact arm", material: "POM", qty: 1 },
          { code: "Y-103", name: "Seal gasket", material: "Silicone", qty: 1 },
        ],
      },
    ],
  },
];

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
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [selectedParentCode, setSelectedParentCode] = useState("K-X-001");

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
            Part Families
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
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">SubHub panel</p>
              <h1 className="mt-1 text-xl font-semibold">Part Families</h1>
              <p className="mt-1 text-sm text-muted-foreground">Parent parts, raw subparts, and family variants</p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              <ArrowLeft className="size-4" />
              Back to ERP
            </Link>
          </div>
        </header>
        <section className="flex-1 space-y-6 p-6">
          <div className="panel overflow-hidden">
            <div className="flex flex-wrap items-start gap-4 border-b border-border px-5 py-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Layers3 className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold">K Family</h2>
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">3 parent variants</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{families[0].description}</p>
              </div>
              <div className="rounded-md bg-muted/60 px-3 py-2 text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Relationship</p>
                <p className="mt-0.5 text-xs font-medium">1 parent → many raw parts</p>
              </div>
            </div>
            <div className="grid gap-3 p-4 lg:grid-cols-3">
              {families[0].parents.map((parent) => {
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

          <PartRecipe parent={families[0].parents.find((parent) => parent.code === selectedParentCode) ?? families[0].parents[0]} />
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
          <p className="mt-4 text-center text-xs text-muted-foreground">Each variant in K Family can use a different Y-part combination.</p>
        </div>
      </div>
    </div>
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