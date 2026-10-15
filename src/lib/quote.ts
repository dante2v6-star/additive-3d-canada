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
// Slicer integration boundary: implement with a trusted server-side slicing service.
export interface Slicer {
  analyze(
    file: Uint8Array,
    settings: Settings,
  ): Promise<{ hours: number; weightGrams: number }>;
}
