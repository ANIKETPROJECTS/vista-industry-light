import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Shell } from "@/components/erp/Shell";
import { Kpi, Panel, Tag } from "@/components/erp/bits";
import { hubs, inr, num, skus, subparts, weeklyTargets } from "@/lib/erp-data";

export const Route = createFileRoute("/sku/$code")({
  loader: ({ params }) => {
    const sku = skus.find((s) => s.code === params.code);
    if (!sku) throw notFound();
    return { sku };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "SKU unavailable — Float ERP" }, { name: "robots", content: "noindex" }] };
    const t = `${loaderData.sku.name} — Float ERP`;
    const d = `Bill of materials, unit cost and hub-wise weekly target allocation for ${loaderData.sku.name}.`;
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
      ],
    };
  },
  notFoundComponent: SkuMissing,
  component: SkuDetail,
});

function SkuMissing() {
  return (
    <Shell title="SKU not found" subtitle="No such product code">
      <Panel title="Nothing here">
        <p className="p-5 text-sm text-muted-foreground">
          Back to{" "}
          <Link to="/orders" className="text-primary underline">
            Orders &amp; Targets
          </Link>
          .
        </p>
      </Panel>
    </Shell>
  );
}

function SkuDetail() {
  const { sku } = Route.useLoaderData();
  const bom = subparts
    .filter((s) => s.bom[sku.id])
    .map((s) => ({ ...s, qty: s.bom[sku.id]!, cost: Math.round(s.weight * s.rate * s.bom[sku.id]! * 100) / 100 }));
  const unitCost = Math.round(bom.reduce((a, b) => a + b.cost, 0) * 100) / 100;
  const idx = skus.findIndex((s) => s.id === sku.id);
  const alloc = weeklyTargets.map((t) => ({ hub: t.hub, qty: t.cells[idx] ?? 0 }));
  const allocated = alloc.reduce((a, b) => a + b.qty, 0);

  return (
    <Shell
      title={sku.name}
      subtitle={`${sku.code} · ${sku.company} · monthly order ${num(sku.order)} units`}
      actions={
        <Link to="/orders" className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-3 py-2 text-sm">
          <ArrowLeft className="size-4" /> Orders
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Monthly order" value={num(sku.order)} hint="units committed" />
        <Kpi label="Weekly allocation" value={num(allocated)} tone="good" hint="across 6 hubs" />
        <Kpi label="Unit material cost" value={inr(unitCost)} hint={`${bom.length} subparts`} />
        <Kpi label="Order value" value={inr(Math.round(unitCost * sku.order))} tone="neutral" />
      </div>

      <Panel title="Bill of materials" description={`Subparts consumed per finished ${sku.code}`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-2.5 text-left font-medium">Subpart</th>
              <th className="px-5 py-2.5 text-left font-medium">Material</th>
              <th className="px-5 py-2.5 text-left font-medium">Source</th>
              <th className="px-5 py-2.5 text-right font-medium">Qty / unit</th>
              <th className="px-5 py-2.5 text-right font-medium">Cost / unit</th>
              <th className="px-5 py-2.5 text-right font-medium">For full order</th>
            </tr>
          </thead>
          <tbody>
            {bom.map((b) => (
              <tr key={b.code} className="border-b border-border/70 last:border-0 hover:bg-muted/40">
                <td className="px-5 py-3">
                  <Link to="/part/$code" params={{ code: b.code }} className="font-medium hover:text-primary">
                    {b.name}
                  </Link>
                  <p className="tabular text-xs text-muted-foreground">{b.code}</p>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{b.material}</td>
                <td className="px-5 py-3">
                  <Tag tone={b.source === "Molded" ? "info" : "neutral"}>{b.source}</Tag>
                </td>
                <td className="tabular px-5 py-3 text-right">{b.qty}</td>
                <td className="tabular px-5 py-3 text-right">{inr(b.cost)}</td>
                <td className="tabular px-5 py-3 text-right font-semibold">{num(b.qty * sku.order)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-muted/40 text-sm font-semibold">
              <td className="px-5 py-3" colSpan={4}>
                Total material cost per unit
              </td>
              <td className="tabular px-5 py-3 text-right">{inr(unitCost)}</td>
              <td className="tabular px-5 py-3 text-right">{inr(Math.round(unitCost * sku.order))}</td>
            </tr>
          </tfoot>
        </table>
      </Panel>

      <Panel title="Hub allocation" description="Weekly target split for this SKU">
        <ul className="divide-y divide-border">
          {alloc.map((a) => {
            const hub = hubs.find((h) => h.code === a.hub)!;
            const pct = Math.min(100, Math.round((a.qty / Math.max(1, hub.weekly)) * 100));
            return (
              <li key={a.hub} className="flex items-center gap-4 px-5 py-3 text-sm">
                <Link to="/hub/$code" params={{ code: a.hub }} className="w-12 font-medium hover:text-primary">
                  {a.hub}
                </Link>
                <span className="text-xs text-muted-foreground">{hub.name.replace(/^Unit \w+ — /, "")}</span>
                <div className="ml-auto h-1.5 w-40 rounded-full bg-muted">
                  <div className="h-1.5 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <span className="tabular w-20 text-right font-semibold">{num(a.qty)}</span>
              </li>
            );
          })}
        </ul>
      </Panel>
    </Shell>
  );
}
