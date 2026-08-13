import { createFileRoute } from "@tanstack/react-router";
import { CalendarRange, Plus } from "lucide-react";
import { Shell } from "@/components/erp/Shell";
import { Kpi, Panel, Tag } from "@/components/erp/bits";
import { hubs, num, skus, weeklyTargets } from "@/lib/erp-data";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Orders & Weekly Targets — Float ERP" },
      {
        name: "description",
        content: "Monthly customer orders per Float SKU, split into weekly production targets across six hubs.",
      },
      { property: "og:title", content: "Orders & Weekly Targets — Float ERP" },
      { property: "og:description", content: "Allocate monthly demand into hub-level weekly production targets." },
    ],
  }),
  component: Orders,
});

function Orders() {
  const totalOrder = skus.reduce((a, s) => a + s.order, 0);
  const allocated = weeklyTargets.reduce((a, r) => a + r.cells.reduce((x, y) => x + y, 0), 0);

  return (
    <Shell
      title="Orders & Weekly Targets"
      subtitle="Order month Aug 2026 · allocation week 33"
      actions={
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-3 py-2 text-sm">
            <CalendarRange className="size-4" /> Aug 2026
          </button>
          <button className="rule-header inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium">
            <Plus className="size-4" /> New order
          </button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total order" value={num(totalOrder)} hint="units, all SKUs" />
        <Kpi label="Allocated this week" value={num(allocated)} tone="good" hint="across 6 hubs" />
        <Kpi label="Unallocated" value={num(totalOrder - allocated)} tone="warn" hint="pending assignment" />
        <Kpi label="Active SKUs" value="6" hint="3 brands" />
      </div>

      <Panel title="Order book" description="Monthly demand by brand and SKU">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-2.5 text-left font-medium">SKU</th>
              <th className="px-5 py-2.5 text-left font-medium">Brand</th>
              <th className="px-5 py-2.5 text-left font-medium">Code</th>
              <th className="px-5 py-2.5 text-right font-medium">Order qty</th>
              <th className="px-5 py-2.5 text-right font-medium">Share</th>
              <th className="px-5 py-2.5 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {skus.map((s) => (
              <tr key={s.id} className="border-b border-border/70 last:border-0 hover:bg-muted/40">
                <td className="px-5 py-3 font-medium">{s.name}</td>
                <td className="px-5 py-3 text-muted-foreground">{s.company}</td>
                <td className="tabular px-5 py-3 text-muted-foreground">{s.code}</td>
                <td className="tabular px-5 py-3 text-right font-semibold">{num(s.order)}</td>
                <td className="px-5 py-3">
                  <div className="ml-auto h-1.5 w-32 rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-accent"
                      style={{ width: `${Math.round((s.order / totalOrder) * 100)}%` }}
                    />
                  </div>
                </td>
                <td className="px-5 py-3 text-right">
                  <Tag tone={s.order > 20000 ? "bad" : s.order > 2000 ? "warn" : "good"}>
                    {s.order > 20000 ? "High load" : s.order > 2000 ? "In progress" : "On track"}
                  </Tag>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel title="Weekly target allocation" description="Units assigned per hub per SKU for week 33">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3 text-left font-medium">Hub</th>
                {skus.map((s) => (
                  <th key={s.id} className="px-3 py-3 text-center font-medium">
                    {s.code}
                  </th>
                ))}
                <th className="px-5 py-3 text-right font-medium">Capacity</th>
              </tr>
            </thead>
            <tbody>
              {weeklyTargets.map((row) => {
                const hub = hubs.find((h) => h.code === row.hub)!;
                const sum = row.cells.reduce((a, b) => a + b, 0);
                const load = Math.round((sum / hub.weekly) * 100);
                return (
                  <tr key={row.hub} className="border-b border-border/70 last:border-0 hover:bg-muted/40">
                    <td className="px-5 py-3">
                      <p className="font-medium">{hub.code}</p>
                      <p className="text-xs text-muted-foreground">{hub.daily}/day</p>
                    </td>
                    {row.cells.map((c, i) => (
                      <td key={i} className="tabular px-3 py-3 text-center">
                        {c ? num(c) : <span className="text-muted-foreground/40">—</span>}
                      </td>
                    ))}
                    <td className="px-5 py-3 text-right">
                      <Tag tone={load > 100 ? "bad" : load > 85 ? "warn" : "good"}>{load}% loaded</Tag>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </Shell>
  );
}
