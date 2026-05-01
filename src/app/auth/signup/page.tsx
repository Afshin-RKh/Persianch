"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import LocationSelector, { type Location } from "@/components/LocationSelector";

const API = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";

type Step = "form" | "verify";

export default function SignUpPage() {
  const { user, register, applyAuth } = useAuth();
  const router = useRouter();

  const [step, setStep]           = useState<Step>("form");
  const [pendingId, setPendingId] = useState<number | null>(null);

  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [otp, setOtp]             = useState("");

  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [resent, setResent]       = useState(false);

  const pwStrength = (pw: string) => {
    if (pw.length === 0) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 4);
  };
  const strength = pwStrength(password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#EF4444", "#F97316", "#EAB308", "#22C55E"][strength];

  if (user) { router.replace("/"); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await register(name, email, password, locations);
      setPendingId(result.pending_id);
      setStep("verify");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_otp", pending_id: pendingId, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      applyAuth(data.token, data.user);
      router.replace("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResent(false);
    setError("");
    try {
      await fetch(`${API}/auth.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend_otp", pending_id: pendingId }),
      });
      setResent(true);
    } catch { /* non-fatal */ }
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]";

  if (step === "verify") {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-16 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-bold" style={{ color: "#1B3A6B" }}>
              Biruni<span style={{ color: "#C9A84C" }}>Map</span>
            </Link>
            <p className="text-gray-500 text-sm mt-2">Check your email</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-6">
              <span className="text-4xl">📬</span>
              <p className="text-sm text-gray-600 mt-3">
                We sent a 6-digit code to <strong>{email}</strong>. Enter it below to create your account.
              </p>
            </div>
            <form onSubmit={handleVerify} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                required
                placeholder="000000"
                className={inputCls + " text-center tracking-widest text-2xl font-bold"}
                autoFocus
              />
              {error && <p className="text-red-600 text-sm">{error}</p>}
              {resent && <p className="text-green-600 text-sm">New code sent!</p>}
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-50"
                style={{ backgroundColor: "#8B1A1A" }}
              >
                {loading ? "Verifying..." : "Create Account →"}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-5">
              {"Didn't receive it? "}
              <button onClick={handleResend} className="font-semibold hover:underline" style={{ color: "#1B3A6B" }}>
                Resend code
              </button>
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold" style={{ color: "#1B3A6B" }}>
            Biruni<span style={{ color: "#C9A84C" }}>Map</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Create your account</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Helma Omrani" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className={inputCls} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-600">Password <span className="font-normal text-gray-400">(min. 8 characters)</span></label>
                {password.length > 0 && (
                  <span className="text-xs font-semibold" style={{ color: strengthColor }}>{strengthLabel}</span>
                )}
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="At least 8 characters" className={inputCls} />
              {password.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="h-1 flex-1 rounded-full transition-colors duration-200"
                      style={{ backgroundColor: strength >= n ? strengthColor : "#E5E7EB" }} />
                  ))}
                </div>
              )}
            </div>
            <div>
              <LocationSelector
                selected={locations}
                onChange={setLocations}
                label="Where are you based? (optional)"
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-50"
              style={{ backgroundColor: "#8B1A1A" }}
            >
              {loading ? "Sending code..." : "Continue →"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/auth/signin" className="font-semibold hover:underline" style={{ color: "#1B3A6B" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
