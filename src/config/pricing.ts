// CAD. These are starting assumptions, not calibrated machine/slicer rates.
export const pricing = {
  minimumOrder: 30,
  setupFee: 12,
  machineHourlyRate: 5,
  extrusionCm3PerHour: 12,
  shellFraction: 0.25,
  supportAllowance: 1.15,
  qualityMultiplier: { draft: 0.8, standard: 1, fine: 1.45 },
};
export const materials = {
  PLA: {
    label: "PLA",
    density: 1.24,
    costPerGram: 0.09,
    multiplier: 1,
    description: "Detailed prototypes & visual models",
  },
  PETG: {
    label: "PETG",
    density: 1.27,
    costPerGram: 0.11,
    multiplier: 1.1,
    description: "Tough, versatile functional parts",
  },
  ABS: {
    label: "ABS",
    density: 1.04,
    costPerGram: 0.12,
    multiplier: 1.2,
    description: "Durable engineering applications",
  },
  ASA: {
    label: "ASA",
    density: 1.07,
    costPerGram: 0.14,
    multiplier: 1.25,
    description: "Outdoor & UV-resistant applications",
  },
  TPU: {
    label: "TPU",
    density: 1.21,
    costPerGram: 0.17,
    multiplier: 1.6,
    description: "Flexible components & protective parts",
  },
  Nylon: {
    label: "Nylon",
    density: 1.14,
    costPerGram: 0.2,
    multiplier: 1.5,
    description: "Wear-resistant functional components",
  },
  CF_Nylon: {
    label: "Carbon Fiber Nylon",
    density: 1.2,
    costPerGram: 0.3,
    multiplier: 1.8,
    description: "Stiff, demanding engineering parts",
  },
  Other: {
    label: "Other / Request Quote",
    density: 1.2,
    costPerGram: 0,
    multiplier: 1,
    description: "We’ll help choose the right material",
  },
} as const;
export const colours = [
  "Black",
  "White",
  "Grey",
  "Blue",
  "Red",
  "Other / discuss with us",
];
export const MAX_FILE_BYTES = 3 * 1024 * 1024; // Under Vercel's 4.5 MB request limit, including multipart overhead.
export const MAX_TRIANGLES = 60000;
