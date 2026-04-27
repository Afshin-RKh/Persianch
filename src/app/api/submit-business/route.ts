import { NextRequest, NextResponse } from "next/server";

const PHP_API = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";
const ADMIN_TOKEN = process.env.ADMIN_API_TOKEN || "";

async function geocode(address: string, city: string, country: string): Promise<{ lat: number; lng: number } | null> {
  const query = [address, city, country].filter(Boolean).join(", ");
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "BiruniMap/1.0 (contact@birunimap.com)",
          "Accept-Language": "en",
        },
      }
    );
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    // Retry with just city + country if full address fails
    const res2 = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent([city, country].join(", "))}&format=json&limit=1`,
      { headers: { "User-Agent": "BiruniMap/1.0 (contact@birunimap.com)", "Accept-Language": "en" } }
    );
    const data2 = await res2.json();
    if (data2.length > 0) {
      return { lat: parseFloat(data2[0].lat), lng: parseFloat(data2[0].lon) };
    }
  } catch {
    // geocoding failure is non-fatal
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessName, category, country, city, address, phone, website, instagram, email, description, connection } = body;

    if (!businessName || !category || !country || !address || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Geocode server-side
    const coords = await geocode(address, city, country);

    // Build business payload — unapproved until reviewed
    const payload = {
      name: businessName,
      category,
      country,
      canton: city,
      address: [address, city, country].filter(Boolean).join(", "),
      phone: phone || null,
      website: website || null,
      instagram: instagram?.replace(/^@/, "") || null,
      email: email || null,
      description: description || null,
      description_fa: null,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      is_featured: false,
      is_verified: false,
      is_approved: false,
      // Store submitter connection in description as note
      ...(connection ? { _submission_note: `Connection: ${connection} | Submitter email: ${email}` } : {}),
    };

    const phpRes = await fetch(`${PHP_API}/businesses.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ADMIN_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await phpRes.json();

    if (!phpRes.ok || !result.success) {
      console.error("PHP API error:", result);
      return NextResponse.json({ error: "Failed to save business" }, { status: 500 });
    }

    return NextResponse.json({ success: true, geocoded: coords !== null });
  } catch (err) {
    console.error("submit-business error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
