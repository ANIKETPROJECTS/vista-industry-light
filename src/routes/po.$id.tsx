import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { Shell } from "@/components/erp/Shell";
import { Kpi, Panel, Tag } from "@/components/erp/bits";
import { hubs, inr, num, procurement, subparts } from "@/lib/erp-data";

export const Route = createFileRoute("/po/$id")({
  loader: ({ params }) => {
    const po = procurement.find((p) => p.id === params.id);
    if (!po) throw notFound();
    return { po };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Purchase unavailable — Float ERP" }, { name: "robots", content: "noindex" }] };
    const t = `${loaderData.po.id} — ${loaderData.po.part} · Float ERP`;
    const d = `Vendor, quantity, value and delivery timeline for purchase ${loaderData.po.id}.`;
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
      ],
    };
  },
  notFoundComponent: PoMissing,
  component: PoDetail,
});

function PoMissing() {
  return (
    <Shell title="Purchase not found" subtitle="No such entry in the register">
      <Panel title="Nothing here">
        <p className="p-5 text-sm text-muted-foreground">
          Back to{" "}
          <Link to="/procurement" className="text-primary underline">
            Procurement
          </Link>
          .
        </p>
      </Panel>
    </Shell>
  );
}

const stages = ["Raised", "Ordered", "In transit", "Received"];

function PoDetail() {
  const { po } = Route.useLoaderData();
  const part = subparts.find((s) => s.name === po.part);
  const hub = hubs.find((h) => h.code === po.hub);
  const unitCost = part ? Math.round(part.weight * part.rate * 100) / 100 : 0;
  const value = Math.round(unitCost * po.qty);
  const reached = po.status === "Received" ? 3 : po.status === "In transit" ? 2 : po.status === "Delayed" ? 1 : 1;

  return (
    <Shell
      title={`Purchase ${po.id}`}
      subtitle={`${po.part} · ${po.vendor} · raised ${po.date} by ${po.by}`}
      actions={
        <Link
          to="/procurement"
          className="inline-flex items-center gap-2 rounded-md border border-input bg-card px-3 py-2 text-sm"
        >
          <ArrowLeft className="size-4" /> Register
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Quantity" value={num(po.qty)} hint="units ordered" />
        <Kpi label="Estimated value" value={inr(value)} hint={`${inr(unitCost)} / piece`} />
        <Kpi
          label="Status"
          value={po.status}
          tone={po.status === "Received" ? "good" : po.status === "Delayed" ? "bad" : "warn"}
        />
        <Kpi label="Destination" value={po.hub} hint={hub?.name.replace(/^Unit \w+ — /, "") ?? ""} />
      </div>

      <Panel title="Delivery timeline" description="Movement of this purchase">
        <ol className="divide-y divide-border">
          {stages.map((s, i) => {
            const done = i <= reached;
            return (
              <li key={s} className="flex items-center gap-3 px-5 py-3 text-sm">
                {done ? (
                  <CheckCircle2 className="size-4 text-success" />
                ) : (
                  <Circle className="size-4 text-muted-foreground" />
                )}
                <span className={done ? "font-medium" : "text-muted-foreground"}>{s}</span>
                {i === reached && po.status === "Delayed" ? <Tag tone="bad">Delayed 3 days</Tag> : null}
                <span className="ml-auto text-xs text-muted-foreground">{done ? po.date : "pending"}</span>
              </li>
            );
          })}
        </ol>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Order details">
          <dl className="divide-y divide-border text-sm">
            {[
              ["Purchase id", po.id],
              ["Vendor", po.vendor],
              ["Raised by", po.by],
              ["Raised on", po.date],
              ["Destination hub", po.hub],
              ["Payment terms", "30 days credit"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center gap-3 px-5 py-3">
                <span className="text-muted-foreground">{k}</span>
                <span className="ml-auto font-medium">{v}</span>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel title="Part being purchased">
          {part ? (
            <dl className="divide-y divide-border text-sm">
              <div className="flex items-center gap-3 px-5 py-3">
                <span className="text-muted-foreground">Subpart</span>
                <Link to="/part/$code" params={{ code: part.code }} className="ml-auto font-medium hover:text-primary">
                  {part.name}
                </Link>
              </div>
              {[
                ["Part code", part.code],
                ["Material", part.material],
                ["Weight", `${part.weight} kg`],
                ["Rate", `${inr(part.rate)} / kg`],
                ["Source", part.source],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="tabular ml-auto font-medium">{v}</span>
                </div>
              ))}
            </dl>
          ) : (
            <p className="p-5 text-sm text-muted-foreground">In-house molded item, no master record.</p>
          )}
        </Panel>
      </div>
    </Shell>
  );
}
