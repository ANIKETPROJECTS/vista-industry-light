import { createFileRoute } from "@tanstack/react-router";
import { InventoryAdjustmentPage } from "./inventory";

export const Route = createFileRoute("/inventory/adjustment")({
  head: () => ({ meta: [{ title: "Stock Adjustment — Float ERP" }] }),
  component: InventoryAdjustmentPage,
});