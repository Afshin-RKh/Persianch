"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth, authHeaders } from "@/lib/auth";
import { idFromSlug } from "@/lib/businessSlug";

const API = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";

function ClaimForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, token } = useAuth();

  const slug = searchParams.get("slug");
  const rawId = slug ? idFromSlug(slug) : Number(searchParams.get("id"));
  const id = rawId ? Number(rawId) : null;

  const [businessName, setBusinessName] = useState<string>("");
  const [isOwner, setIsOwner]           = useState(false);
  const [message, setMessage]           = useState("");
  const [name, setName]                 = useState(user?.name ?? "");
  const [email, setEmail]               = useState(user?.email ?? "");
  const [submitting, setSubmitting]     = useState(false);
  const [done, setDone]                 = useState(false);
  const [error, setError]               = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`${API}/businesses.php?id=${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(b => { if (b?.name) setBusinessName(b.name); })
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (user) { setName(user.name); setEmail(user.email); }
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner && !message.trim()) {
      setError("Please tick the ownership box or describe the issue.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API}/business_claims.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify({ business_id: id, is_owner: isOwner, message, name, email }),
      });
      if (res.ok) setDone(true);
      else { const d = await res.json(); setError(d.error ?? "Something went wrong."); }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">🔒</p>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Sign in required</h1>
        <p className="text-gray-500 text-sm mb-6">You need to be signed in to claim a business or report an issue.</p>
        <Link
          href={`/auth/signin?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "/businesses")}`}
          className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white"
          style={{ backgroundColor: "#1B3A6B" }}
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-5xl mb-4">🔍</p>
        <p className="font-semibold text-gray-600">Business not found.</p>
        <Link href="/businesses" className="mt-4 inline-block text-sm hover:underline" style={{ color: "#1B3A6B" }}>← Browse businesses</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: "#f0fdf4" }}>
          <CheckCircle size={32} style={{ color: "#16a34a" }} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Message sent</h1>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          Thank you — our team will review your submission and get back to you.
        </p>
        <Link href={slug ? `/businesses/detail?slug=${slug}` : `/businesses/detail?id=${id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white"
          style={{ backgroundColor: "#1B3A6B" }}>
          <ArrowLeft size={14} /> Back to listing
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      <Link href={slug ? `/businesses/detail?slug=${slug}` : `/businesses/detail?id=${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B3A6B] transition-colors font-medium mb-8">
        <ArrowLeft size={15} /> Back to listing
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        {businessName ? `Report about ${businessName}` : "Report / Claim"}
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        Own this business or spotted incorrect information? Let us know and we'll review it.
      </p>

      <form onSubmit={submit} className="space-y-5">

        {/* Ownership checkbox */}
        <label className="flex items-start gap-3 p-4 rounded-2xl border border-gray-200 cursor-pointer hover:border-[#1B3A6B] transition-colors">
          <input
            type="checkbox"
            checked={isOwner}
            onChange={e => setIsOwner(e.target.checked)}
            className="mt-0.5 accent-[#1B3A6B] w-4 h-4 flex-shrink-0"
          />
          <div>
            <p className="text-sm font-semibold text-gray-800">I own this business</p>
            <p className="text-xs text-gray-400 mt-0.5">Check this if you are the business owner and want to manage this listing.</p>
          </div>
        </label>

        {/* Issue message */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Report an issue <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            placeholder="Describe the issue — wrong address, phone number, closed business…"
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] resize-none bg-gray-50"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full text-white font-semibold py-3 rounded-2xl text-sm disabled:opacity-50 transition-opacity"
          style={{ backgroundColor: "#1B3A6B" }}
        >
          {submitting ? "Sending…" : "Send message"}
        </button>
      </form>
    </main>
  );
}

export default function ClaimPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading…</div>}>
      <ClaimForm />
    </Suspense>
  );
}
