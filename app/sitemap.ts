import type { MetadataRoute } from "next";
import { CONTENT_UPDATED, SITE_ORIGIN, publicPages } from "@/lib/seo-content";
export default function sitemap(): MetadataRoute.Sitemap {
  return publicPages.map((page) => ({
    url: SITE_ORIGIN + page.path,
    lastModified: CONTENT_UPDATED,
    changeFrequency: page.path === "/privacy" ? "yearly" : "monthly",
    priority:
      page.path === "/" ? 1 : page.path.startsWith("/services") ? 0.8 : 0.5,
  }));
}
