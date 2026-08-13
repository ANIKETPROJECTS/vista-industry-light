import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, RefreshCw } from "lucide-react";
import { Shell } from "@/components/erp/Shell";
import { Panel, Tag } from "@/components/erp/bits";
import { hubStock, hubs, num, subparts } from "@/lib/erp-data";

export const Route = createFileRoute("/hubs")({
  head: () => ({
    meta: [
      { title: "Hubs & Stock — Float ERP" },
      {
        name: "description",
        content: "Per-hub on-hand subpart stock, next-week requirement and live shortage flags for six plants.",
      },
      { property: "og:title", content: "Hubs & Stock — Float ERP" },
      { property: "og:description", content: "Plant master with daily rate, stock counts and requirement coverage." },
    ],
  }),
  component: Hubs,
});

function Hubs() {
  const [active, setActive] = useState(hubs[0]!.code);
  const hub = hubs.find((h) => h.code === active)!;
  const rows = subparts.map((s) => {
    const r = hubStock[active]![s.code]!;
    return { ...s, ...r, gap: r.required - r.stock };
  });

  return (
    <Shell
      title="Hubs & Stock"
      subtitle="6 manufacturing units · stock entered by hub managers"
      actions={
        <button className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-3 py-2 text-sm">
          <RefreshCw className="size-4" /> Request update
        </button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {hubs.map((h) => (
          <div
            key={h.code}
            role="button"
            tabIndex={0}
            onClick={() => setActive(h.code)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setActive(h.code);
            }}
            className={`panel cursor-pointer p-5 text-left transition-colors ${
              h.code === active ? "ring-2 ring-ring" : "hover:bg-muted/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">{h.code}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" /> {h.name}
                </p>
              </div>
              <Tag tone={h.health > 80 ? "good" : h.health > 60 ? "warn" : "bad"}>{h.health}% healthy</Tag>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Daily</p>
                <p className="tabular text-sm font-semibold">{num(h.daily)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Weekly</p>
                <p className="tabular text-sm font-semibold">{num(h.weekly)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Updated</p>
                <p className="tabular text-sm font-semibold">{h.updated.slice(0, 6)}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>Manager · {h.manager}</span>
              <Link to="/hub/$code" params={{ code: h.code }} className="font-medium text-primary hover:underline">
                Open unit →
              </Link>
            </div>
          </button>
        ))}
      </div>

      <Panel
        title={`${hub.code} stock sheet`}
        description={`${hub.name} · updated ${hub.updated} by ${hub.manager}`}
        action={<Tag tone="info">Week 33 requirement</Tag>}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-2.5 text-left font-medium">Subpart</th>
              <th className="px-5 py-2.5 text-left font-medium">Source</th>
              <th className="px-5 py-2.5 text-right font-medium">Stock</th>
              <th className="px-5 py-2.5 text-right font-medium">Next week req.</th>
              <th className="px-5 py-2.5 text-right font-medium">Coverage</th>
              <th className="px-5 py-2.5 text-right font-medium">Shortage</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const cover = Math.min(100, Math.round((r.stock / Math.max(1, r.required)) * 100));
              return (
                <tr key={r.code} className="border-b border-border/70 last:border-0 hover:bg-muted/40">
                  <td className="px-5 py-3">
                    <p className="font-medium">
                      <Link to="/part/$code" params={{ code: r.code }} className="hover:text-primary">
                        {r.name}
                      </Link>
                    </p>
                    <p className="tabular text-xs text-muted-foreground">{r.code}</p>
                  </td>
                  <td className="px-5 py-3">
                    <Tag tone={r.source === "Molded" ? "info" : "neutral"}>{r.source}</Tag>
                  </td>
                  <td className="tabular px-5 py-3 text-right">{num(r.stock)}</td>
                  <td className="tabular px-5 py-3 text-right">{num(r.required)}</td>
                  <td className="px-5 py-3">
                    <div className="ml-auto h-1.5 w-28 rounded-full bg-muted">
                      <div
                        className={`h-1.5 rounded-full ${cover === 100 ? "bg-success" : cover > 70 ? "bg-warning" : "bg-destructive"}`}
                        style={{ width: `${cover}%` }}
                      />
                    </div>
                  </td>
                  <td
                    className={`tabular px-5 py-3 text-right font-semibold ${r.gap > 0 ? "text-destructive" : "text-success"}`}
                  >
                    {r.gap > 0 ? num(r.gap) : `+${num(-r.gap)}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </Shell>
  );
}
