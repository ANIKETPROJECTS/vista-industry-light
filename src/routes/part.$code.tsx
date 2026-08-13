import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Shell } from "@/components/erp/Shell";
import { Kpi, Panel, Tag } from "@/components/erp/bits";
import { hubStock, hubs, inr, num, procurement, skus, subparts } from "@/lib/erp-data";

export const Route = createFileRoute("/part/$code")({
  loader: ({ params }) => {
    const part = subparts.find((s) => s.code === params.code);
    if (!part) throw notFound();
    return { part };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Part unavailable — Float ERP" }, { name: "robots", content: "noindex" }] };
    const t = `${loaderData.part.name} (${loaderData.part.code}) — Float ERP`;
    const d = `Where-used, per-hub stock coverage and costing for subpart ${loaderData.part.code}.`;
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
      ],
    };
  },
  notFoundComponent: PartMissing,
  component: PartDetail,
});

function PartMissing() {
  return (
    <Shell title="Subpart not found" subtitle="No such part code in the BOM">
      <Panel title="Nothing here">
        <p className="p-5 text-sm text-muted-foreground">
          Back to{" "}
          <Link to="/bom" className="text-primary underline">
            Bill of Materials
          </Link>
          .
        </p>
      </Panel>
    </Shell>
  );
}

function PartDetail() {
  const { part } = Route.useLoaderData();
  const perHub = hubs.map((h) => {
    const r = hubStock[h.code]![part.code]!;
    return { hub: h.code, stock: r.stock, required: r.required, gap: r.required - r.stock };
  });
  const totalStock = perHub.reduce((a, r) => a + r.stock, 0);
  const totalReq = perHub.reduce((a, r) => a + r.required, 0);
  const deficit = perHub.reduce((a, r) => a + Math.max(0, r.gap), 0);
  const usedIn = skus.filter((s) => part.bom[s.id]);
  const pos = procurement.filter((p) => p.part === part.name);

  return (
    <Shell
      title={part.name}
      subtitle={`${part.code} · ${part.material} · ${part.source}`}
      actions={
        <Link to="/bom" className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-3 py-2 text-sm">
          <ArrowLeft className="size-4" /> Bill of Materials
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total stock" value={num(totalStock)} hint="across 6 hubs" />
        <Kpi label="Weekly requirement" value={num(totalReq)} />
        <Kpi label="Deficit" value={num(deficit)} tone={deficit > 0 ? "bad" : "good"} />
        <Kpi label="Material cost" value={`${inr(part.rate)}/kg`} hint={`${part.weight} kg per piece`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Specification" className="xl:col-span-1">
          <dl className="divide-y divide-border text-sm">
            {[
              ["Part code", part.code],
              ["Material", part.material],
              ["Net weight", `${part.weight} kg`],
              ["Rate", `${inr(part.rate)} / kg`],
              ["Piece cost", inr(Math.round(part.weight * part.rate * 100) / 100)],
              ["Source", part.source],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center gap-3 px-5 py-3">
                <span className="text-muted-foreground">{k}</span>
                <span className="tabular ml-auto font-medium">{v}</span>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel title="Stock vs requirement by hub" className="xl:col-span-2">
          <div className="h-60 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perHub}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="hub" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "var(--color-muted)" }}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="stock" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="required" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Where used" description="SKUs consuming this subpart">
          <ul className="divide-y divide-border">
            {usedIn.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                <Link to="/sku/$code" params={{ code: s.code }} className="font-medium hover:text-primary">
                  {s.name}
                </Link>
                <Tag tone="neutral">{s.company}</Tag>
                <span className="tabular ml-auto text-muted-foreground">{part.bom[s.id]} pc / unit</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Hub coverage" description="Deficit highlighted in red">
          <ul className="divide-y divide-border">
            {perHub.map((r) => (
              <li key={r.hub} className="flex items-center gap-3 px-5 py-3 text-sm">
                <Link to="/hub/$code" params={{ code: r.hub }} className="font-medium hover:text-primary">
                  {r.hub}
                </Link>
                <span className="tabular text-muted-foreground">
                  {num(r.stock)} / {num(r.required)}
                </span>
                <span
                  className={`tabular ml-auto font-semibold ${r.gap > 0 ? "text-destructive" : "text-success"}`}
                >
                  {r.gap > 0 ? num(r.gap) : `+${num(-r.gap)}`}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {pos.length > 0 ? (
        <Panel title="Recent purchases" description="Procurement register entries for this part">
          <ul className="divide-y divide-border">
            {pos.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
                <Link to="/po/$id" params={{ id: p.id }} className="tabular font-medium hover:text-primary">
                  {p.id}
                </Link>
                <Tag tone="info">{p.hub}</Tag>
                <span className="tabular text-muted-foreground">{num(p.qty)} units</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {p.vendor} · {p.date}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </Shell>
  );
}
