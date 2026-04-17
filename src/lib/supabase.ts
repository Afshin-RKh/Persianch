import { createClient } from "@supabase/supabase-js";
import { Business, Category } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getBusinesses(filters?: {
  category?: Category;
  city?: string;
  search?: string;
  featured?: boolean;
}): Promise<Business[]> {
  let query = supabase
    .from("businesses")
    .select("*")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters?.category) query = query.eq("category", filters.category);
  if (filters?.city) query = query.eq("city", filters.city);
  if (filters?.featured) query = query.eq("is_featured", true);
  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,name_fa.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function getFeaturedBusinesses(): Promise<Business[]> {
  return getBusinesses({ featured: true });
}
