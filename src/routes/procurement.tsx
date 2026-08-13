import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Shell } from "@/components/erp/Shell";
import { Kpi, Panel, Tag } from "@/components/erp/bits";
import { inr, num, procurement } from "@/lib/erp-data";

export const Route = createFileRoute("/procurement")({
  head: () => ({
    meta: [
      { title: "Procurement Actions — Float ERP" },
      {
        name: "description",
        content: "Track purchase actions raised against subpart shortages: vendor, quantity, date and delivery status.",
      },
      { property: "og:title", content: "Procurement Actions — Float ERP" },
      { property: "og:description", content: "Vendor follow-up and delivery status for every shortage action." },
    ],
  }),
  component: Procurement,
});

const toneFor = (s: string) =>
  s === "Received" ? "good" : s === "Delayed" ? "bad" : s === "In transit" ? "info" : "warn";

function Procurement() {
  return (
    <Shell
      title="Procurement"
      subtitle="Actions raised against flagged shortages"
      actions={
        <button className="rule-header inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium">
          <Plus className="size-4" /> Log action
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Open actions" value="4" tone="warn" hint="2 in transit" />
        <Kpi label="Units on order" value={num(53000)} hint="across 5 vendors" />
        <Kpi label="Committed spend" value={inr(846000)} hint="this month" />
        <Kpi label="On-time rate" value="82%" delta={-6} tone="bad" hint="last 30 days" />
      </div>

      <Panel title="Action register" description="Replaces the manual '[Person] Action' columns from the sheets">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-2.5 text-left font-medium">Ref</th>
              <th className="px-5 py-2.5 text-left font-medium">Subpart</th>
              <th className="px-5 py-2.5 text-left font-medium">Hub</th>
              <th className="px-5 py-2.5 text-left font-medium">Vendor</th>
              <th className="px-5 py-2.5 text-right font-medium">Qty</th>
              <th className="px-5 py-2.5 text-left font-medium">Date</th>
              <th className="px-5 py-2.5 text-left font-medium">Raised by</th>
              <th className="px-5 py-2.5 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {procurement.map((p) => (
              <tr key={p.id} className="border-b border-border/70 last:border-0 hover:bg-muted/40">
                <td className="tabular px-5 py-3">{p.id}</td>
                <td className="px-5 py-3 font-medium">{p.part}</td>
                <td className="px-5 py-3">
                  <Tag tone="info">{p.hub}</Tag>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{p.vendor}</td>
                <td className="tabular px-5 py-3 text-right">{num(p.qty)}</td>
                <td className="tabular px-5 py-3 text-muted-foreground">{p.date}</td>
                <td className="px-5 py-3 text-muted-foreground">{p.by}</td>
                <td className="px-5 py-3 text-right">
                  <Tag tone={toneFor(p.status)}>{p.status}</Tag>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Vendor performance" description="Last 90 days">
          <ul className="divide-y divide-border">
            {[
              { v: "Sanjay Brass Works", otd: 94, orders: 12 },
              { v: "Polyseal India", otd: 88, orders: 9 },
              { v: "Metro Fasteners", otd: 78, orders: 15 },
              { v: "Shree Plastics", otd: 61, orders: 7 },
            ].map((v) => (
              <li key={v.v} className="flex items-center gap-4 px-5 py-3 text-sm">
                <span className="min-w-44 font-medium">{v.v}</span>
                <div className="h-1.5 flex-1 rounded-full bg-muted">
                  <div
                    className={`h-1.5 rounded-full ${v.otd > 85 ? "bg-success" : v.otd > 70 ? "bg-warning" : "bg-destructive"}`}
                    style={{ width: `${v.otd}%` }}
                  />
                </div>
                <span className="tabular text-xs text-muted-foreground">
                  {v.otd}% · {v.orders} POs
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Upcoming deliveries" description="Expected this week">
          <ul className="divide-y divide-border">
            {[
              { d: "13 Aug", part: "Valve Seat Insert", hub: "F10", qty: 12000 },
              { d: "14 Aug", part: "Seal Gasket", hub: "F9", qty: 8000 },
              { d: "16 Aug", part: "Screw M3x8", hub: "Fm", qty: 25000 },
            ].map((x) => (
              <li key={x.part} className="flex items-center gap-3 px-5 py-3.5 text-sm">
                <span className="tabular w-14 text-xs text-muted-foreground">{x.d}</span>
                <span className="flex-1 font-medium">{x.part}</span>
                <Tag tone="info">{x.hub}</Tag>
                <span className="tabular text-muted-foreground">{num(x.qty)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </Shell>
  );
}
