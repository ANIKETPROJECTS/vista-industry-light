import { createFileRoute } from "@tanstack/react-router";
import { InventoryHistoryPage } from "./inventory";

export const Route = createFileRoute("/inventory/history")({
  head: () => ({ meta: [{ title: "Inventory History — Float ERP" }] }),
  component: InventoryHistoryPage,
});