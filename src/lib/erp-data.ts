// Dummy seed data for the Float ERP prototype (UI only, no persistence).

export const hubs = [
  { code: "F8", name: "Unit F8 — Rabale", daily: 1000, weekly: 6000, manager: "S. Kulkarni", updated: "12 Aug 2026", health: 92 },
  { code: "F9", name: "Unit F9 — Wagle Estate", daily: 800, weekly: 4800, manager: "R. Deshmukh", updated: "09 Aug 2026", health: 61 },
  { code: "Fp", name: "Unit Fp — Pawane", daily: 1200, weekly: 7200, manager: "A. Pawar", updated: "12 Aug 2026", health: 88 },
  { code: "Fm", name: "Unit Fm — Murbad", daily: 600, weekly: 3600, manager: "K. Jadhav", updated: "11 Aug 2026", health: 74 },
  { code: "F10", name: "Unit F10 — Bhiwandi", daily: 900, weekly: 5400, manager: "M. Shaikh", updated: "05 Aug 2026", health: 43 },
  { code: "F11", name: "Unit F11 — Vasai", daily: 500, weekly: 3000, manager: "P. Naik", updated: "12 Aug 2026", health: 81 },
];

export const skus = [
  { id: 1, name: "Eureka Reviva NXT", company: "Eureka Forbes", code: "FL-RVN", order: 50000 },
  { id: 2, name: "Eureka Enhance", company: "Eureka Forbes", code: "FL-ENH", order: 1000 },
  { id: 3, name: "Eureka SM (MIC)", company: "Eureka Forbes", code: "FL-SMM", order: 10000 },
  { id: 4, name: "Eureka TM", company: "Eureka Forbes", code: "FL-ETM", order: 100 },
  { id: 5, name: "AO Smith SM", company: "AO Smith", code: "FL-AOS", order: 7500 },
  { id: 6, name: "V-Guard TM-6L", company: "V-Guard", code: "FL-VG6", order: 2400 },
];

export type Subpart = {
  code: string;
  name: string;
  material: string;
  weight: number;
  rate: number;
  source: "Molded" | "Purchased";
  bom: Record<number, number>;
};

export const subparts: Subpart[] = [
  { code: "GP006-001", name: "Washer", material: "Nylon 66", weight: 0.004, rate: 210, source: "Purchased", bom: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 } },
  { code: "GP006-002", name: "Pivot Pin", material: "SS 304", weight: 0.011, rate: 260, source: "Purchased", bom: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 } },
  { code: "GP006-003", name: "Screw M3x8", material: "MS Zinc", weight: 0.002, rate: 95, source: "Purchased", bom: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2 } },
  { code: "GP006-010", name: "Ball Float Body (Reviva NXT)", material: "PP Copo", weight: 0.032, rate: 128, source: "Molded", bom: { 1: 1 } },
  { code: "GP006-011", name: "Float Split Arm Enhance", material: "POM", weight: 0.018, rate: 175, source: "Molded", bom: { 2: 1 } },
  { code: "GP006-012", name: "Float Arm SM", material: "POM", weight: 0.016, rate: 175, source: "Molded", bom: { 3: 1, 5: 1 } },
  { code: "GP006-013", name: "Float Body TM", material: "PP Copo", weight: 0.029, rate: 128, source: "Molded", bom: { 4: 1, 6: 1 } },
  { code: "GP006-020", name: "Seal Gasket", material: "Silicone", weight: 0.003, rate: 340, source: "Purchased", bom: { 1: 1, 3: 1, 5: 1, 6: 1 } },
  { code: "GP006-021", name: "Valve Seat Insert", material: "Brass", weight: 0.014, rate: 640, source: "Purchased", bom: { 1: 1, 2: 1, 5: 1 } },
  { code: "GP006-030", name: "Retainer Clip", material: "PP", weight: 0.005, rate: 118, source: "Molded", bom: { 1: 2, 3: 1, 4: 1, 6: 2 } },
  { code: "GP006-031", name: "Cover Cap", material: "ABS", weight: 0.009, rate: 155, source: "Molded", bom: { 2: 1, 3: 1, 4: 1 } },
  { code: "GP006-040", name: "Label Sticker", material: "Vinyl", weight: 0.001, rate: 70, source: "Purchased", bom: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 } },
];

// hub -> subpart code -> { stock, required }
export const hubStock: Record<string, Record<string, { stock: number; required: number }>> = (() => {
  const seedFactor: Record<string, number> = { F8: 1, F9: 0.72, Fp: 1.2, Fm: 0.6, F10: 0.9, F11: 0.5 };
  const out: Record<string, Record<string, { stock: number; required: number }>> = {};
  hubs.forEach((h, hi) => {
    out[h.code] = {};
    subparts.forEach((s, si) => {
      const base = Object.values(s.bom).reduce((a, b) => a + b, 0) * 900 * seedFactor[h.code];
      const required = Math.round(base / 10) * 10;
      const swing = ((hi * 7 + si * 13) % 11) / 10 - 0.35;
      out[h.code][s.code] = { stock: Math.max(0, Math.round((required * (1 + swing)) / 10) * 10), required };
    });
  });
  return out;
})();

export const shortageFor = (hub: string, code: string) => {
  const r = hubStock[hub][code];
  return r.required - r.stock;
};

export const workers = [
  { id: "W-101", name: "Sunita Pawar", hub: "F8", role: "Assembly", output: 1240, days: 6, avg: 207 },
  { id: "W-102", name: "Ramesh Yadav", hub: "F8", role: "Molding", output: 1580, days: 6, avg: 263 },
  { id: "W-103", name: "Anita Gupta", hub: "Fp", role: "Assembly", output: 1710, days: 6, avg: 285 },
  { id: "W-104", name: "Imran Shaikh", hub: "Fp", role: "Packing", output: 1320, days: 6, avg: 220 },
  { id: "W-105", name: "Kiran More", hub: "F9", role: "Assembly", output: 980, days: 5, avg: 196 },
  { id: "W-106", name: "Vikas Bhosale", hub: "F10", role: "Molding", output: 1120, days: 6, avg: 187 },
  { id: "W-107", name: "Meena Patil", hub: "Fm", role: "Assembly", output: 860, days: 6, avg: 143 },
  { id: "W-108", name: "Sagar Jadhav", hub: "F11", role: "Packing", output: 740, days: 5, avg: 148 },
];

export const productionTrend = [
  { day: "Mon", produced: 4120, target: 4500 },
  { day: "Tue", produced: 4680, target: 4500 },
  { day: "Wed", produced: 4390, target: 4500 },
  { day: "Thu", produced: 5020, target: 4500 },
  { day: "Fri", produced: 4760, target: 4500 },
  { day: "Sat", produced: 3980, target: 4500 },
];

export const hubOutput = hubs.map((h) => ({ hub: h.code, output: Math.round(h.weekly * (0.72 + (h.health / 100) * 0.3)) }));

export const procurement = [
  { id: "PA-2081", part: "Valve Seat Insert", hub: "F10", qty: 12000, date: "10 Aug 2026", by: "Owner", status: "In transit", vendor: "Sanjay Brass Works" },
  { id: "PA-2080", part: "Seal Gasket", hub: "F9", qty: 8000, date: "09 Aug 2026", by: "Procurement", status: "Ordered", vendor: "Polyseal India" },
  { id: "PA-2079", part: "Screw M3x8", hub: "Fm", qty: 25000, date: "08 Aug 2026", by: "Owner", status: "Received", vendor: "Metro Fasteners" },
  { id: "PA-2078", part: "Float Split Arm Enhance", hub: "F8", qty: 3000, date: "07 Aug 2026", by: "Production Mgr", status: "In transit", vendor: "In-house molding" },
  { id: "PA-2077", part: "Cover Cap", hub: "F11", qty: 5000, date: "05 Aug 2026", by: "Procurement", status: "Delayed", vendor: "Shree Plastics" },
];

export const weeklyTargets = hubs.map((h) => ({
  hub: h.code,
  cells: skus.map((s, i) => Math.round((h.weekly * (s.order / 71000)) * (1 + ((i % 3) - 1) * 0.15) / 10) * 10),
}));

export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
export const num = (n: number) => n.toLocaleString("en-IN");
