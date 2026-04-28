export const EVENT_TYPE_META: Record<string, { icon: string; label: string; color: string }> = {
  concert: { icon: "🎵", label: "Concert", color: "#7C3AED" },
  show:    { icon: "🎭", label: "Show",    color: "#B45309" },
  march:   { icon: "✊", label: "March",   color: "#DC2626" },
  class:   { icon: "📚", label: "Class",   color: "#0369A1" },
  sports:  { icon: "🏃", label: "Sports",  color: "#16A34A" },
  party:   { icon: "🎉", label: "Party",   color: "#9333EA" },
  other:   { icon: "📌", label: "Other",   color: "#6B7280" },
};

export interface EventRow {
  id: number;
  title: string;
  title_fa?: string;
  event_type: string;
  country: string;
  city: string;
  address?: string;
  venue?: string;
  lat?: number;
  lng?: number;
  start_date: string;
  end_date: string;
  next_occurrence: string;
  is_recurring: boolean;
  recurrence_type?: string;
  description?: string;
  external_link?: string;
  status?: string;
}
