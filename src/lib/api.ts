import { Business, Category } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";

export async function getBusinesses(filters?: {
  category?: Category;
  canton?: string;
  search?: string;
  featured?: boolean;
  token?: string;
  bounds?: { lat_min: number; lat_max: number; lng_min: number; lng_max: number };
}): Promise<Business[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.set("category", filters.category);
  if (filters?.canton) params.set("canton", filters.canton);
  if (filters?.search) params.set("search", filters.search);
  if (filters?.featured) params.set("featured", "1");
  if (filters?.bounds) {
    params.set("lat_min", String(filters.bounds.lat_min));
    params.set("lat_max", String(filters.bounds.lat_max));
    params.set("lng_min", String(filters.bounds.lng_min));
    params.set("lng_max", String(filters.bounds.lng_max));
  }

  const headers: Record<string, string> = {};
  if (filters?.token) headers["Authorization"] = `Bearer ${filters.token}`;

  const res = await fetch(`${API_URL}/businesses.php?${params.toString()}`, { headers });
  if (!res.ok) throw new Error("Failed to fetch businesses");
  return res.json();
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const res = await fetch(`${API_URL}/businesses.php?id=${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function addBusiness(data: Partial<Business>): Promise<{ success: boolean; id: number }> {
  const res = await fetch(`${API_URL}/businesses.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateBusiness(id: string | number, data: Partial<Business>): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/businesses.php`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...data }),
  });
  return res.json();
}

export async function deleteBusiness(id: string | number): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/businesses.php`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  return res.json();
}

export interface BlogFilters {
  tag?: string;
  country?: string;
  city?: string;
  language?: string;
}

export async function getBlogPosts(filters?: BlogFilters): Promise<BlogPost[]> {
  const params = new URLSearchParams();
  if (filters?.tag)      params.set("tag",      filters.tag);
  if (filters?.country)  params.set("country",  filters.country);
  if (filters?.city)     params.set("city",      filters.city);
  if (filters?.language) params.set("language",  filters.language);
  const qs = params.toString();
  const res = await fetch(`${API_URL}/blog.php${qs ? "?" + qs : ""}`);
  if (!res.ok) throw new Error("Failed to fetch blog posts");
  return res.json();
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const res = await fetch(`${API_URL}/blog.php?slug=${slug}`);
  if (!res.ok) return null;
  return res.json();
}

export interface BlogPost {
  id: number;
  title: string;
  title_fa?: string;
  slug: string;
  content: string;
  content_fa?: string;
  cover_image?: string;
  published: boolean;
  created_at: string;
  tags?: string;
  country?: string;
  city?: string;
  language?: string;
  author_name?: string;
}
