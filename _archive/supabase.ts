import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Business, Category } from "@/types";

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error("Supabase env vars not set");
    }
    _client = createClient(url, key);
  }
  return _client;
}

export async function getBusinesses(filters?: {
  category?: Category;
  city?: string;
  search?: string;
  featured?: boolean;
}): Promise<Business[]> {
  const supabase = getClient();
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
  const supabase = getClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export { getClient as supabase };
