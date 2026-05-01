export function businessSlug(b: {
  id: number | string;
  name: string;
  category?: string;
  country?: string;
  canton?: string;
}): string {
  const parts = [b.category, b.name, b.country, b.canton]
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")  // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${parts}-${b.id}`;
}

export function idFromSlug(slug: string): number | null {
  const match = slug.match(/-(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}
