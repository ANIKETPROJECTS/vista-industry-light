import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Shell } from "@/components/erp/Shell";
import { Kpi, Panel, Tag } from "@/components/erp/bits";
import { hubs, num, workers } from "@/lib/erp-data";

export const Route = createFileRoute("/worker/$id")({
  loader: ({ params }) => {
    const worker = workers.find((w) => w.id === params.id);
    if (!worker) throw notFound();
    return { worker };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Worker unavailable — Float ERP" }, { name: "robots", content: "noindex" }] };
    const t = `${loaderData.worker.name} (${loaderData.worker.id}) — Float ERP`;
    const d = `Daily output, attendance and productivity rating for operator ${loaderData.worker.name}.`;
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
      ],
    };
  },
  notFoundComponent: WorkerMissing,
  component: WorkerDetail,
});

function WorkerMissing() {
  return (
    <Shell title="Worker not found" subtitle="No such operator id">
      <Panel title="Nothing here">
        <p className="p-5 text-sm text-muted-foreground">
          Back to{" "}
          <Link to="/production" className="text-primary underline">
            Production &amp; Workforce
          </Link>
          .
        </p>
      </Panel>
    </Shell>
  );
}

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function WorkerDetail() {
  const { worker } = Route.useLoaderData();
  const hub = hubs.find((h) => h.code === worker.hub);
  const daily = days.map((d, i) => ({
    day: d,
    output: i < worker.days ? Math.round(worker.avg * (0.85 + ((i * 7) % 5) / 14)) : 0,
  }));
  const best = Math.max(...daily.map((d) => d.output));

  return (
    <Shell
      title={worker.name}
      subtitle={`${worker.id} · ${worker.role} · Unit ${worker.hub}`}
      actions={
        <Link
          to="/production"
          className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-3 py-2 text-sm"
        >
          <ArrowLeft className="size-4" /> Workforce
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Weekly output" value={num(worker.output)} tone="good" hint="units logged" />
        <Kpi label="Average / day" value={num(worker.avg)} tone={worker.avg > 240 ? "good" : worker.avg > 180 ? "warn" : "bad"} />
        <Kpi label="Best day" value={num(best)} hint="peak shift output" />
        <Kpi label="Days present" value={`${worker.days} / 6`} tone={worker.days === 6 ? "good" : "warn"} />
      </div>

      <Panel title="Daily output" description="Week 33 shift log">
        <div className="h-60 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={daily}>
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
              <Bar dataKey="output" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} barSize={34} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Employment record" description="Master data">
          <dl className="divide-y divide-border text-sm">
            {[
              ["Operator id", worker.id],
              ["Role", worker.role],
              ["Unit", hub ? `${hub.code} — ${hub.name.replace(/^Unit \w+ — /, "")}` : worker.hub],
              ["Joined", "14 Mar 2024"],
              ["Wage type", "Daily · ₹640"],
              ["Supervisor", hub?.manager ?? "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center gap-3 px-5 py-3">
                <span className="text-muted-foreground">{k}</span>
                <span className="ml-auto font-medium">{v}</span>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel title="Peers at this unit" description="Same hub operators">
          <ul className="divide-y divide-border">
            {workers
              .filter((w) => w.hub === worker.hub && w.id !== worker.id)
              .map((w) => (
                <li key={w.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                  <Link to="/worker/$id" params={{ id: w.id }} className="font-medium hover:text-primary">
                    {w.name}
                  </Link>
                  <span className="text-xs text-muted-foreground">{w.role}</span>
                  <span className="tabular ml-auto">{num(w.output)}</span>
                  <Tag tone={w.avg > 240 ? "good" : w.avg > 180 ? "warn" : "bad"}>{w.avg}/day</Tag>
                </li>
              ))}
          </ul>
        </Panel>
      </div>
    </Shell>
  );
}
