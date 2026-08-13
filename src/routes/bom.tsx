import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Plus } from "lucide-react";
import { Shell } from "@/components/erp/Shell";
import { Panel, Tag } from "@/components/erp/bits";
import { inr, num, skus, subparts } from "@/lib/erp-data";

export const Route = createFileRoute("/bom")({
  head: () => ({
    meta: [
      { title: "Bill of Materials — Float ERP" },
      {
        name: "description",
        content: "Component master and per-SKU bill of materials for every Float model, with material cost and source.",
      },
      { property: "og:title", content: "Bill of Materials — Float ERP" },
      { property: "og:description", content: "Subpart master, BOM matrix and costing for the Float product line." },
    ],
  }),
  component: Bom,
});

function Bom() {
  return (
    <Shell
      title="Bill of Materials"
      subtitle="Parent part: Float · 12 subparts · 6 SKUs"
      actions={
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-3 py-2 text-sm">
            <Download className="size-4" /> Export
          </button>
          <button className="rule-header inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium">
            <Plus className="size-4" /> Add subpart
          </button>
        </div>
      }
    >
      <Panel title="BOM matrix" description="Quantity of each subpart required per finished unit">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="sticky left-0 bg-card px-5 py-3 text-left font-medium">Subpart</th>
                <th className="px-3 py-3 text-left font-medium">Source</th>
                {skus.map((s) => (
                  <th key={s.id} className="px-3 py-3 text-center font-medium">
                    <span className="block text-foreground">{s.code}</span>
                    <span className="block text-[10px] normal-case">{s.name}</span>
                  </th>
                ))}
                <th className="px-5 py-3 text-right font-medium">₹/unit</th>
              </tr>
            </thead>
            <tbody>
              {subparts.map((s) => (
                <tr key={s.code} className="border-b border-border/70 last:border-0 hover:bg-muted/40">
                  <td className="sticky left-0 bg-card px-5 py-3">
                    <p className="font-medium">
                      <Link to="/part/$code" params={{ code: s.code }} className="hover:text-primary">
                        {s.name}
                      </Link>
                    </p>
                    <p className="tabular text-xs text-muted-foreground">
                      {s.code} · {s.material} · {s.weight} kg
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <Tag tone={s.source === "Molded" ? "info" : "neutral"}>{s.source}</Tag>
                  </td>
                  {skus.map((k) => {
                    const q = s.bom[k.id];
                    return (
                      <td
                        key={k.id}
                        className={`tabular px-3 py-3 text-center ${q ? "font-semibold" : "text-muted-foreground/40"}`}
                      >
                        {q ? q : "—"}
                      </td>
                    );
                  })}
                  <td className="tabular px-5 py-3 text-right">{inr(Math.round(s.weight * s.rate * 100) / 100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-3">
        {skus.slice(0, 3).map((s) => {
          const parts = subparts.filter((p) => p.bom[s.id]);
          const cost = parts.reduce((a, p) => a + (p.bom[s.id] ?? 0) * p.weight * p.rate, 0);
          return (
            <Panel key={s.id} title={s.name} description={`${s.company} · ${parts.length} components`}>
              <ul className="divide-y divide-border">
                {parts.slice(0, 5).map((p) => (
                  <li key={p.code} className="flex items-center justify-between px-5 py-2.5 text-sm">
                    <span>{p.name}</span>
                    <span className="tabular text-muted-foreground">×{p.bom[s.id]}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-border bg-muted/40 px-5 py-3 text-sm">
                <span className="text-muted-foreground">Material cost / unit</span>
                <span className="tabular font-semibold">{inr(Math.round(cost))}</span>
              </div>
            </Panel>
          );
        })}
      </div>

      <Panel title="Subpart master" description="Costing inputs used by the calculation engine">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-2.5 text-left font-medium">Code</th>
              <th className="px-5 py-2.5 text-left font-medium">Description</th>
              <th className="px-5 py-2.5 text-left font-medium">Material</th>
              <th className="px-5 py-2.5 text-right font-medium">Weight (kg)</th>
              <th className="px-5 py-2.5 text-right font-medium">Rate ₹/kg</th>
              <th className="px-5 py-2.5 text-right font-medium">Used in</th>
            </tr>
          </thead>
          <tbody>
            {subparts.map((s) => (
              <tr key={s.code} className="border-b border-border/70 last:border-0 hover:bg-muted/40">
                <td className="tabular px-5 py-2.5">{s.code}</td>
                <td className="px-5 py-2.5 font-medium">
                  <Link to="/part/$code" params={{ code: s.code }} className="hover:text-primary">
                    {s.name}
                  </Link>
                </td>
                <td className="px-5 py-2.5 text-muted-foreground">{s.material}</td>
                <td className="tabular px-5 py-2.5 text-right">{s.weight.toFixed(3)}</td>
                <td className="tabular px-5 py-2.5 text-right">{num(s.rate)}</td>
                <td className="tabular px-5 py-2.5 text-right">{Object.keys(s.bom).length} SKUs</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </Shell>
  );
}
