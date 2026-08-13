import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { UserPlus } from "lucide-react";
import { Shell } from "@/components/erp/Shell";
import { Kpi, Panel, Tag } from "@/components/erp/bits";
import { num, productionTrend, workers } from "@/lib/erp-data";

export const Route = createFileRoute("/production")({
  head: () => ({
    meta: [
      { title: "Production & Workforce — Float ERP" },
      {
        name: "description",
        content: "Daily production logs, total output and per-person average productivity by hub, SKU and worker.",
      },
      { property: "og:title", content: "Production & Workforce — Float ERP" },
      { property: "og:description", content: "Worker-level output tracking and per-person productivity averages." },
    ],
  }),
  component: Production,
});

function Production() {
  const total = workers.reduce((a, w) => a + w.output, 0);
  const avg = Math.round(total / workers.length);

  return (
    <Shell
      title="Production & Workforce"
      subtitle="Week 33 · 8 active operators across 6 hubs"
      actions={
        <button className="rule-header inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium">
          <UserPlus className="size-4" /> Add worker
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total production" value={num(total)} delta={6} hint="units this week" tone="good" />
        <Kpi label="Per-person average" value={num(avg)} delta={3} hint="units / worker / week" />
        <Kpi label="Best performer" value="285" hint="Anita Gupta · Fp" tone="good" />
        <Kpi label="Attendance" value="94%" delta={-2} hint="6-day week" tone="warn" />
      </div>

      <Panel title="Daily output" description="Consolidated across hubs, week 33">
        <div className="h-64 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} />
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
              <Bar dataKey="produced" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} barSize={34} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Operator productivity" description="Output logged per worker this week">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-2.5 text-left font-medium">Worker</th>
              <th className="px-5 py-2.5 text-left font-medium">Hub</th>
              <th className="px-5 py-2.5 text-left font-medium">Role</th>
              <th className="px-5 py-2.5 text-right font-medium">Days</th>
              <th className="px-5 py-2.5 text-right font-medium">Output</th>
              <th className="px-5 py-2.5 text-right font-medium">Avg / day</th>
              <th className="px-5 py-2.5 text-right font-medium">Rating</th>
            </tr>
          </thead>
          <tbody>
            {workers.map((w) => (
              <tr key={w.id} className="border-b border-border/70 last:border-0 hover:bg-muted/40">
                <td className="px-5 py-3">
                  <p className="font-medium">
                    <Link to="/worker/$id" params={{ id: w.id }} className="hover:text-primary">
                      {w.name}
                    </Link>
                  </p>
                  <p className="tabular text-xs text-muted-foreground">{w.id}</p>
                </td>
                <td className="px-5 py-3">
                  <Tag tone="info">{w.hub}</Tag>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{w.role}</td>
                <td className="tabular px-5 py-3 text-right">{w.days}</td>
                <td className="tabular px-5 py-3 text-right font-semibold">{num(w.output)}</td>
                <td className="tabular px-5 py-3 text-right">{w.avg}</td>
                <td className="px-5 py-3 text-right">
                  <Tag tone={w.avg > 240 ? "good" : w.avg > 180 ? "warn" : "bad"}>
                    {w.avg > 240 ? "Above target" : w.avg > 180 ? "On target" : "Below target"}
                  </Tag>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </Shell>
  );
}
