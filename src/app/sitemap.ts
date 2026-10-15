import { business } from "@/config/business";
export default function sitemap() {
  return ["", "/custom-design", "/privacy", "/terms", "/order-policy"].map(
    (path) => ({
      url: `${business.url}${path}`,
      changeFrequency: "monthly" as const,
      priority: path ? 0.6 : 1,
    }),
  );
}
