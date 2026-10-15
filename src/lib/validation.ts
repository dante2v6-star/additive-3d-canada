import { z } from "zod";
import { materials, pricing, colours } from "@/config/pricing";
import { legal } from "@/config/legal";
const materialKeys = Object.keys(materials) as [
  keyof typeof materials,
  ...(keyof typeof materials)[],
];
export const customerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(254),
  phone: z
    .string()
    .trim()
    .min(7)
    .max(30)
    .regex(/^[+\d() .-]+$/)
    .refine(
      (v) =>
        v.replace(/\D/g, "").length >= 7 && v.replace(/\D/g, "").length <= 15,
      "Enter a valid phone number.",
    ),
});
export const settingsSchema = z.object({
  material: z.enum(materialKeys),
  quantity: z.coerce.number().int().min(1).max(1000),
  quality: z.enum(
    Object.keys(pricing.qualityMultiplier) as ["draft", "standard", "fine"],
  ),
  infill: z.coerce.number().min(10).max(100),
  colour: z.enum(colours as [string, ...string[]]),
});
export const commonSchema = customerSchema.extend({
  requestId: z.uuid(),
  kind: z.enum(["print", "design"]),
  acknowledged: z.literal("true"),
  privacyConsent: z.literal("true"),
  uploadRights: z.literal("true"),
  policyVersion: z.literal(legal.version),
  website: z.string().max(0).optional(),
});
export const designSchema = z.object({
  description: z.string().trim().min(20).max(8000),
  intendedUse: z.string().trim().min(2).max(500),
  dimensions: z.string().max(200).default(""),
  material: z.enum(materialKeys),
  quantity: z.coerce.number().int().min(1).max(1000),
  deadline: z.union([z.literal(""), z.iso.date()]).default(""),
});
