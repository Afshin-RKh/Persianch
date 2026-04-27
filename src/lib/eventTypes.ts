export const EVENT_TYPE_META: Record<string, { icon: string; label: string; color: string }> = {
  concert:            { icon: "🎵", label: "Concert",              color: "#7C3AED" },
  theatre:            { icon: "🎭", label: "Theatre",              color: "#B45309" },
  protest:            { icon: "✊", label: "Protest / Gathering",  color: "#DC2626" },
  language_class:     { icon: "📚", label: "Language Class",       color: "#0369A1" },
  dance_class:        { icon: "💃", label: "Dance Class",          color: "#DB2777" },
  food_culture:       { icon: "🍽️", label: "Food & Culture",       color: "#D97706" },
  art_exhibition:     { icon: "🎨", label: "Art Exhibition",       color: "#059669" },
  sports:             { icon: "🏃", label: "Sports",               color: "#16A34A" },
  religious_cultural: { icon: "🕌", label: "Religious / Cultural", color: "#1B3A6B" },
  party:              { icon: "🎉", label: "Party / Celebration",  color: "#9333EA" },
  conference:         { icon: "📢", label: "Conference / Talk",    color: "#475569" },
  other:              { icon: "📌", label: "Other",                color: "#6B7280" },
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
