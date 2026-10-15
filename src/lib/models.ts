import { materials, pricing } from "@/config/pricing";
export type Settings = {
  material: keyof typeof materials;
  quantity: number;
  quality: keyof typeof pricing.qualityMultiplier;
  infill: number;
  colour: string;
};
export type Analysis = {
  dimensions: [number, number, number];
  volumeCm3: number;
  triangles: number;
  watertight: boolean;
  warnings: string[];
};
export type Customer = { name: string; email: string; phone: string };
export type PrintQuote = {
  total: number;
  weightGrams: number;
  hours: number;
  manual: boolean;
  settings: Settings;
  analysis: Analysis;
};
export type PrintRequest = {
  id: string;
  customer: Customer;
  quote: PrintQuote;
  notes: string;
  file: StoredFile;
  createdAt: string;
};
export type CustomDesignRequest = {
  id: string;
  customer: Customer;
  description: string;
  intendedUse: string;
  dimensions: string;
  material: string;
  quantity: number;
  deadline: string;
  file?: StoredFile;
  createdAt: string;
};
export type StoredFile = {
  name: string;
  contentType: string;
  bytes: Uint8Array;
  privateKey?: string;
};
