import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Layers,
  ClipboardList,
  Factory,
  AlertTriangle,
  Truck,
  Users,
  Bell,
  Search,
  Settings,
} from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/bom", label: "Bill of Materials", icon: Layers },
  { to: "/orders", label: "Orders & Targets", icon: ClipboardList },
  { to: "/hubs", label: "Hubs & Stock", icon: Factory },
  { to: "/shortages", label: "Shortages", icon: AlertTriangle },
  { to: "/procurement", label: "Procurement", icon: Truck },
  { to: "/production", label: "Production & Workforce", icon: Users },
] as const;

export function Shell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
          <div className="rule-header flex size-9 items-center justify-center rounded-md font-mono text-sm font-bold">
            FA
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Float ERP</p>
            <p className="text-xs text-muted-foreground">Airavata Technologies</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Modules
          </p>
          {nav.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent font-medium text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                }`}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-md px-2 py-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-secondary font-mono text-xs font-semibold">
              AR
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium">Aniket Rane</p>
              <p className="text-xs text-muted-foreground">Admin · All hubs</p>
            </div>
            <Settings className="ml-auto size-4 text-muted-foreground" />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
          <div className="flex flex-wrap items-center gap-4 px-6 py-4">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-semibold">{title}</h1>
              {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
            </div>
            <div className="hidden items-center gap-2 rounded-md border border-input bg-card px-3 py-2 text-sm text-muted-foreground md:flex">
              <Search className="size-4" />
              <span className="w-40">Search parts, hubs…</span>
              <kbd className="tabular rounded border border-border px-1.5 text-[10px]">⌘K</kbd>
            </div>
            <button className="relative rounded-md border border-input bg-card p-2 text-muted-foreground">
              <Bell className="size-4" />
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-destructive" />
            </button>
            {actions}
          </div>
          <nav className="flex gap-1 overflow-x-auto border-t border-border px-4 py-2 lg:hidden">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs text-muted-foreground"
                activeProps={{ className: "bg-secondary text-foreground font-medium" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="flex-1 space-y-6 p-6">{children}</main>

        <footer className="border-t border-border px-6 py-4 text-xs text-muted-foreground">
          Prototype UI · seeded sample data · Stage 1 scope: Float product line
        </footer>
      </div>
    </div>
  );
}
