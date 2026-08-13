import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
} from "recharts";
import { AlertTriangle, ArrowUpRight, CalendarClock } from "lucide-react";
import { Shell } from "@/components/erp/Shell";
import { Kpi, Panel, Tag } from "@/components/erp/bits";
import { hubOutput, hubs, num, productionTrend, shortageFor, skus, subparts } from "@/lib/erp-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Float ERP — Production & Stock Control Dashboard" },
      {
        name: "description",
        content:
          "Live overview of orders, hub stock, shortages and workforce productivity across six Float manufacturing hubs.",
      },
      { property: "og:title", content: "Float ERP — Production & Stock Control Dashboard" },
      {
        property: "og:description",
        content: "Orders, BOM explosion, hub stock, shortages and workforce output in one industrial control panel.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const totalShortage = hubs.reduce(
    (acc, h) => acc + subparts.reduce((a, s) => a + Math.max(0, shortageFor(h.code, s.code)), 0),
    0,
  );
  const criticals = hubs
    .flatMap((h) =>
      subparts.map((s) => ({ hub: h.code, part: s.name, code: s.code, gap: shortageFor(h.code, s.code) })),
    )
    .filter((r) => r.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 6);

  return (
    <Shell
      title="Operations Dashboard"
      subtitle="Float product line · Week 33, Aug 2026 · all 6 hubs"
      actions={
        <button className="rule-header inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium">
          <CalendarClock className="size-4" /> Week 33
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Open order qty" value={num(71000)} delta={8} hint="Jul'26 → Aug'26" />
        <Kpi label="Weekly capacity" value={num(30000)} hint="6 hubs · 6 days/week" tone="neutral" />
        <Kpi label="Subpart shortage" value={num(totalShortage)} delta={-12} hint="units across hubs" tone="bad" />
        <Kpi label="Per-person average" value="204" delta={4} hint="units / worker / day" tone="good" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel
          title="Production vs target"
          description="Consolidated daily output, current week"
          className="xl:col-span-2"
          action={<Tag tone="good">98.4% attainment</Tag>}
        >
          <div className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={productionTrend}>
                <defs>
                  <linearGradient id="prod" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
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
                  type="monotone"
                  dataKey="produced"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  fill="url(#prod)"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Hub output" description="Units produced this week">
          <div className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hubOutput} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="hub"
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                />
                <Tooltip
                  cursor={{ fill: "var(--color-muted)" }}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="output" fill="var(--color-chart-1)" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel
          title="Critical shortages"
          description="Requirement exceeding on-hand stock"
          className="xl:col-span-2"
          action={
            <Link to="/shortages" className="inline-flex items-center gap-1 text-xs font-medium text-primary">
              Open module <ArrowUpRight className="size-3" />
            </Link>
          }
        >
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-5 py-2.5 font-medium">Subpart</th>
                <th className="px-5 py-2.5 font-medium">Code</th>
                <th className="px-5 py-2.5 font-medium">Hub</th>
                <th className="px-5 py-2.5 text-right font-medium">Gap</th>
                <th className="px-5 py-2.5 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {criticals.map((r) => (
                <tr key={r.hub + r.code} className="border-b border-border/70 last:border-0 hover:bg-muted/50">
                  <td className="px-5 py-2.5 font-medium">{r.part}</td>
                  <td className="tabular px-5 py-2.5 text-muted-foreground">{r.code}</td>
                  <td className="px-5 py-2.5">
                    <Tag tone="info">{r.hub}</Tag>
                  </td>
                  <td className="tabular px-5 py-2.5 text-right font-semibold text-destructive">−{num(r.gap)}</td>
                  <td className="px-5 py-2.5 text-right">
                    <Tag tone={r.gap > 3000 ? "bad" : "warn"}>{r.gap > 3000 ? "Critical" : "Watch"}</Tag>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <div className="space-y-6">
          <Panel title="Data freshness" description="Last stock update per hub">
            <ul className="divide-y divide-border">
              {hubs.map((h) => (
                <li key={h.code} className="flex items-center gap-3 px-5 py-3">
                  <span className="tabular w-10 text-sm font-semibold">{h.code}</span>
                  <div className="min-w-0 flex-1">
                    <div className="h-1.5 w-full rounded-full bg-muted">
                      <div className="h-1.5 rounded-full bg-primary" style={{ width: `${h.health}%` }} />
                    </div>
                  </div>
                  <span className="tabular text-xs text-muted-foreground">{h.updated}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Order book" description="Aug 2026 monthly demand">
            <ul className="divide-y divide-border">
              {skus.slice(0, 4).map((s) => (
                <li key={s.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.company}</p>
                  </div>
                  <span className="tabular font-semibold">{num(s.order)}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <div className="panel flex items-start gap-3 border-l-4 border-l-warning p-5">
        <AlertTriangle className="mt-0.5 size-5 text-warning" />
        <div>
          <p className="text-sm font-medium">F10 stock data is 8 days stale</p>
          <p className="text-sm text-muted-foreground">
            Shortage figures for Bhiwandi may be inaccurate until the hub manager submits a fresh count.
          </p>
        </div>
      </div>
    </Shell>
  );
}
