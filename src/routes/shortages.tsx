import { createFileRoute, Link } from "@tanstack/react-router";
import { Filter, Send } from "lucide-react";
import { Shell } from "@/components/erp/Shell";
import { Kpi, Panel, Tag } from "@/components/erp/bits";
import { hubs, num, shortageFor, subparts } from "@/lib/erp-data";

export const Route = createFileRoute("/shortages")({
  head: () => ({
    meta: [
      { title: "Consolidated Shortages — Float ERP" },
      {
        name: "description",
        content: "Company-wide shortage matrix: requirement minus stock per subpart per hub, with action tracking.",
      },
      { property: "og:title", content: "Consolidated Shortages — Float ERP" },
      { property: "og:description", content: "One grid showing surplus and deficit for every subpart across hubs." },
    ],
  }),
  component: Shortages,
});

function Shortages() {
  const rows = subparts.map((s) => ({
    part: s,
    cells: hubs.map((h) => shortageFor(h.code, s.code)),
  }));
  const totalGap = rows.reduce((a, r) => a + r.cells.reduce((x, y) => x + Math.max(0, y), 0), 0);
  const affected = rows.filter((r) => r.cells.some((c) => c > 0)).length;

  return (
    <Shell
      title="Consolidated Shortages"
      subtitle="Requirement − stock, week 33 · negative values are surplus"
      actions={
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-3 py-2 text-sm">
            <Filter className="size-4" /> Filters
          </button>
          <button className="rule-header inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium">
            <Send className="size-4" /> Raise procurement
          </button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total deficit" value={num(totalGap)} tone="bad" hint="units to be arranged" />
        <Kpi label="Parts affected" value={`${affected} / ${subparts.length}`} tone="warn" />
        <Kpi label="Hubs in deficit" value="5 / 6" tone="warn" hint="F11 fully covered" />
        <Kpi label="Actions logged" value="5" tone="good" hint="this week" />
      </div>

      <Panel title="Shortage matrix" description="Red = deficit, green = surplus">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="sticky left-0 bg-card px-5 py-3 text-left font-medium">Subpart</th>
                {hubs.map((h) => (
                  <th key={h.code} className="px-3 py-3 text-center font-medium">
                    {h.code}
                  </th>
                ))}
                <th className="px-5 py-3 text-right font-medium">Net</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const net = r.cells.reduce((a, b) => a + b, 0);
                return (
                  <tr key={r.part.code} className="border-b border-border/70 last:border-0 hover:bg-muted/40">
                    <td className="sticky left-0 bg-card px-5 py-3">
                      <p className="font-medium">
                      <Link to="/part/$code" params={{ code: r.part.code }} className="hover:text-primary">
                        {r.part.name}
                      </Link>
                    </p>
                      <p className="tabular text-xs text-muted-foreground">{r.part.code}</p>
                    </td>
                    {r.cells.map((c, i) => (
                      <td key={i} className="px-3 py-3 text-center">
                        <span
                          className={`tabular inline-block min-w-16 rounded px-2 py-1 text-xs font-semibold ${
                            c > 0 ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
                          }`}
                        >
                          {c > 0 ? num(c) : `−${num(-c)}`}
                        </span>
                      </td>
                    ))}
                    <td
                      className={`tabular px-5 py-3 text-right font-semibold ${net > 0 ? "text-destructive" : "text-success"}`}
                    >
                      {net > 0 ? num(net) : `−${num(-net)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Action log" description="What the owner did about each flagged shortage">
        <ul className="divide-y divide-border">
          {[
            { part: "Valve Seat Insert", hub: "F10", qty: 12000, by: "Owner", when: "10 Aug", note: "Ordered from Sanjay Brass" },
            { part: "Seal Gasket", hub: "F9", qty: 8000, by: "Procurement", when: "09 Aug", note: "PO raised, ETA 14 Aug" },
            { part: "Float Split Arm Enhance", hub: "F8", qty: 3000, by: "Production Mgr", when: "07 Aug", note: "Extra molding shift" },
            { part: "Cover Cap", hub: "F11", qty: 5000, by: "Procurement", when: "05 Aug", note: "Vendor delayed 3 days" },
          ].map((a) => (
            <li key={a.part} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
              <Tag tone="info">{a.hub}</Tag>
              <span className="font-medium">{a.part}</span>
              <span className="tabular text-muted-foreground">{num(a.qty)} units</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {a.note} · {a.by} · {a.when}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </Shell>
  );
}
