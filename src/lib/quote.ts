import { materials, pricing } from "@/config/pricing";
import type { Analysis, Settings, PrintQuote } from "./models";
export function estimate(analysis: Analysis, settings: Settings): PrintQuote {
  const m = materials[settings.material];
  if (
    !m ||
    !Number.isInteger(settings.quantity) ||
    settings.quantity < 1 ||
    settings.quantity > 1000 ||
    !Number.isFinite(settings.infill) ||
    settings.infill < 10 ||
    settings.infill > 100 ||
    !(settings.quality in pricing.qualityMultiplier) ||
    !Number.isFinite(analysis.volumeCm3) ||
    analysis.volumeCm3 < 0
  )
    throw new Error("Invalid quote parameters.");
  const deposited =
    analysis.volumeCm3 *
    (pricing.shellFraction +
      ((1 - pricing.shellFraction) * settings.infill) / 100) *
    pricing.supportAllowance;
  const weightGrams = deposited * m.density * settings.quantity;
  const hours =
    (deposited / pricing.extrusionCm3PerHour) *
    pricing.qualityMultiplier[settings.quality] *
    m.multiplier *
    settings.quantity;
  const raw =
    pricing.setupFee +
    weightGrams * m.costPerGram +
    hours * pricing.machineHourlyRate;
  const total = Math.ceil(Math.max(30, pricing.minimumOrder, raw) * 100) / 100;
  if (!Number.isFinite(total))
    throw new Error("Estimate exceeds supported range.");
  return {
    total,
    weightGrams,
    hours,
    manual: settings.material === "Other" || analysis.warnings.length > 0,
    settings,
    analysis,
  };
}
export const cad = (value: number) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 2,
  }).format(value);

export function estimateOrder(parts: { analysis: Analysis; quantity: number }[], settings: Settings): PrintQuote {
  if (!parts.length || parts.length > 5) throw new Error("Add between one and five STL files.");
  const quotes = parts.map(part => estimate(part.analysis, { ...settings, quantity: part.quantity }));
  const quantity = parts.reduce((sum, part) => sum + part.quantity, 0);
  if (quantity > 1000) throw new Error("A request supports up to 1,000 printed parts.");
  const weightGrams = quotes.reduce((sum, quote) => sum + quote.weightGrams, 0);
  const hours = quotes.reduce((sum, quote) => sum + quote.hours, 0);
  const raw = pricing.setupFee + weightGrams * materials[settings.material].costPerGram + hours * pricing.machineHourlyRate;
  const total = Math.ceil(Math.max(30, pricing.minimumOrder, raw) * 100) / 100;
  return {
    total, weightGrams, hours, manual: quotes.some(quote => quote.manual),
    settings: { ...settings, quantity },
    analysis: {
      dimensions: [0, 1, 2].map(axis => Math.max(...parts.map(part => part.analysis.dimensions[axis]))) as [number, number, number],
      volumeCm3: parts.reduce((sum, part) => sum + part.analysis.volumeCm3 * part.quantity, 0),
      triangles: parts.reduce((sum, part) => sum + part.analysis.triangles, 0),
      watertight: parts.every(part => part.analysis.watertight),
      warnings: [...new Set(parts.flatMap(part => part.analysis.warnings))],
    },
  };
}
// Slicer integration boundary: implement with a trusted server-side slicing service.
export interface Slicer {
  analyze(
    file: Uint8Array,
    settings: Settings,
  ): Promise<{ hours: number; weightGrams: number }>;
}
