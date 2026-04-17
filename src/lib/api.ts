import { Business, Category } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://afshin.ch/persianch/api";

export async function getBusinesses(filters?: {
  category?: Category;
  city?: string;
  search?: string;
  featured?: boolean;
}): Promise<Business[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.set("category", filters.category);
  if (filters?.city) params.set("city", filters.city);
  if (filters?.search) params.set("search", filters.search);
  if (filters?.featured) params.set("featured", "1");

  const res = await fetch(`${API_URL}/businesses.php?${params.toString()}`);
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

export async function getBlogPosts(): Promise<BlogPost[]> {
  const res = await fetch(`${API_URL}/blog.php`);
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
}
