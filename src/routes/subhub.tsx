import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Boxes, LogOut, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

const DEMO_EMAIL = "admin";
const DEMO_PASSWORD = "admin123";
const SESSION_KEY = "float-subhub-demo-session";

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
        <div className="flex-1" aria-label="SubHub navigation" />
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
              <h1 className="mt-1 text-xl font-semibold">Workspace</h1>
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
        <section className="flex flex-1 items-center justify-center p-6">
          <div className="max-w-md text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Boxes className="size-7" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold">Your SubHub starts here</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The sidebar is intentionally blank for now. Tell me what modules and navigation you want to add next.
            </p>
          </div>
        </section>
      </main>
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