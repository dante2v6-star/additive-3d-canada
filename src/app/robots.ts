import { business } from "@/config/business";
export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${business.url}/sitemap.xml`,
  };
}
