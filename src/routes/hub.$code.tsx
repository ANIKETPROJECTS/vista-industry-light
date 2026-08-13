import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Phone, Wrench } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Shell } from "@/components/erp/Shell";
import { Kpi, Panel, Tag } from "@/components/erp/bits";
import { hubStock, hubs, num, procurement, productionTrend, subparts, workers } from "@/lib/erp-data";

export const Route = createFileRoute("/hub/$code")({
  loader: ({ params }) => {
    const hub = hubs.find((h) => h.code === params.code);
    if (!hub) throw notFound();
    return { hub };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Hub unavailable — Float ERP" }, { name: "robots", content: "noindex" }] };
    const t = `${loaderData.hub.code} — ${loaderData.hub.name} · Float ERP`;
    const d = `Stock sheet, crew, shortages and procurement activity for ${loaderData.hub.name}.`;
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
      ],
    };
  },
  notFoundComponent: HubMissing,
  component: HubDetail,
});

function HubMissing() {
  return (
    <Shell title="Hub not found" subtitle="This unit code does not exist in the register">
      <Panel title="Nothing here">
        <p className="p-5 text-sm text-muted-foreground">
          Go back to{" "}
          <Link to="/hubs" className="text-primary underline">
            Hubs &amp; Stock
          </Link>
          .
        </p>
      </Panel>
    </Shell>
  );
}

function HubDetail() {
  const { hub } = Route.useLoaderData();
  const rows = subparts.map((s) => {
    const r = hubStock[hub.code]![s.code]!;
    return { ...s, ...r, gap: r.required - r.stock };
  });
  const crew = workers.filter((w) => w.hub === hub.code);
  const pos = procurement.filter((p) => p.hub === hub.code);
  const deficit = rows.reduce((a, r) => a + Math.max(0, r.gap), 0);
  const trend = productionTrend.map((d) => ({
    day: d.day,
    output: Math.round((d.produced * hub.daily) / 5000),
  }));

  return (
    <Shell
      title={`${hub.code} · ${hub.name.replace(/^Unit \w+ — /, "")}`}
      subtitle={`Manager ${hub.manager} · last stock update ${hub.updated}`}
      actions={
        <Link
          to="/hubs"
          className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-3 py-2 text-sm"
        >
          <ArrowLeft className="size-4" /> All hubs
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Daily capacity" value={num(hub.daily)} hint="units / day" />
        <Kpi label="Weekly capacity" value={num(hub.weekly)} hint="6-day week" />
        <Kpi label="Open deficit" value={num(deficit)} tone={deficit > 0 ? "bad" : "good"} hint="units short" />
        <Kpi
          label="Health index"
          value={`${hub.health}%`}
          tone={hub.health > 80 ? "good" : hub.health > 60 ? "warn" : "bad"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Unit profile" description="Static master data" className="xl:col-span-1">
          <dl className="divide-y divide-border text-sm">
            {[
              { k: "Location", v: hub.name.replace(/^Unit \w+ — /, ""), icon: MapPin },
              { k: "Manager", v: hub.manager, icon: Wrench },
              { k: "Contact", v: "+91 98•••• ••21", icon: Phone },
            ].map((r) => (
              <div key={r.k} className="flex items-center gap-3 px-5 py-3">
                <r.icon className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">{r.k}</span>
                <span className="ml-auto font-medium">{r.v}</span>
              </div>
            ))}
            <div className="flex items-center gap-3 px-5 py-3">
              <span className="text-muted-foreground">Shift pattern</span>
              <span className="ml-auto font-medium">2 shifts · 08:00–00:00</span>
            </div>
            <div className="flex items-center gap-3 px-5 py-3">
              <span className="text-muted-foreground">Operators</span>
              <span className="tabular ml-auto font-medium">{crew.length}</span>
            </div>
          </dl>
        </Panel>

        <Panel title="Output this week" description="Estimated from hub capacity share" className="xl:col-span-2">
          <div className="h-56 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                    fontSize: 12,
                  }}
                />
                <Area
                  dataKey="output"
                  stroke="var(--color-chart-1)"
                  fill="var(--color-chart-1)"
                  fillOpacity={0.14}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="Stock sheet" description="On-hand vs next-week requirement">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-2.5 text-left font-medium">Subpart</th>
              <th className="px-5 py-2.5 text-left font-medium">Source</th>
              <th className="px-5 py-2.5 text-right font-medium">Stock</th>
              <th className="px-5 py-2.5 text-right font-medium">Required</th>
              <th className="px-5 py-2.5 text-right font-medium">Gap</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.code} className="border-b border-border/70 last:border-0 hover:bg-muted/40">
                <td className="px-5 py-3">
                  <Link to="/part/$code" params={{ code: r.code }} className="font-medium hover:text-primary">
                    {r.name}
                  </Link>
                  <p className="tabular text-xs text-muted-foreground">{r.code}</p>
                </td>
                <td className="px-5 py-3">
                  <Tag tone={r.source === "Molded" ? "info" : "neutral"}>{r.source}</Tag>
                </td>
                <td className="tabular px-5 py-3 text-right">{num(r.stock)}</td>
                <td className="tabular px-5 py-3 text-right">{num(r.required)}</td>
                <td
                  className={`tabular px-5 py-3 text-right font-semibold ${r.gap > 0 ? "text-destructive" : "text-success"}`}
                >
                  {r.gap > 0 ? num(r.gap) : `+${num(-r.gap)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Crew" description="Operators mapped to this unit">
          <ul className="divide-y divide-border">
            {crew.length === 0 ? (
              <li className="px-5 py-4 text-sm text-muted-foreground">No operators mapped yet.</li>
            ) : (
              crew.map((w) => (
                <li key={w.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                  <Link to="/worker/$id" params={{ id: w.id }} className="font-medium hover:text-primary">
                    {w.name}
                  </Link>
                  <span className="text-xs text-muted-foreground">{w.role}</span>
                  <span className="tabular ml-auto">{num(w.output)} units</span>
                  <Tag tone={w.avg > 240 ? "good" : w.avg > 180 ? "warn" : "bad"}>{w.avg}/day</Tag>
                </li>
              ))
            )}
          </ul>
        </Panel>

        <Panel title="Procurement activity" description="Purchases raised for this unit">
          <ul className="divide-y divide-border">
            {pos.length === 0 ? (
              <li className="px-5 py-4 text-sm text-muted-foreground">No open purchases.</li>
            ) : (
              pos.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                  <Link to="/po/$id" params={{ id: p.id }} className="tabular font-medium hover:text-primary">
                    {p.id}
                  </Link>
                  <span className="truncate">{p.part}</span>
                  <span className="tabular ml-auto text-muted-foreground">{num(p.qty)}</span>
                  <Tag tone={p.status === "Received" ? "good" : p.status === "Delayed" ? "bad" : "warn"}>
                    {p.status}
                  </Tag>
                </li>
              ))
            )}
          </ul>
        </Panel>
      </div>
    </Shell>
  );
}
