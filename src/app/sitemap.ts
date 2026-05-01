import type { MetadataRoute } from "next";

const BASE = "https://birunimap.com";
const API   = "https://birunimap.com/api";

async function fetchIds(endpoint: string, key: string): Promise<string[]> {
  try {
    const res = await fetch(`${API}/${endpoint}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    const rows: { id?: number | string; slug?: string }[] = Array.isArray(data) ? data : (data.businesses ?? data.events ?? data.posts ?? []);
    return rows.map((r) => String(r[key as keyof typeof r] ?? "")).filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [businessIds, eventIds, blogSlugs] = await Promise.all([
    fetchIds("businesses.php?limit=500&approved=1", "id"),
    fetchIds("events.php?limit=500", "id"),
    fetchIds("blog.php?limit=500&status=published", "slug"),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,            lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/businesses`,  lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/events`,      lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/blog`,        lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/about`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/contact`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/get-listed`,  lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  const businessRoutes: MetadataRoute.Sitemap = businessIds.map((id) => ({
    url: `${BASE}/businesses/detail?id=${id}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const eventRoutes: MetadataRoute.Sitemap = eventIds.map((id) => ({
    url: `${BASE}/events/detail?id=${id}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${BASE}/blog/post?slug=${slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...businessRoutes, ...eventRoutes, ...blogRoutes];
}
