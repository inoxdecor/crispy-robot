import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/seo-content";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/", other: { "Content-Signal": "search=yes, ai-train=no" } },
    sitemap: SITE_ORIGIN + "/sitemap.xml",
    host: SITE_ORIGIN,
  };
}
