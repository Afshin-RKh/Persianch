"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import LocationSelector, { type Location } from "@/components/LocationSelector";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

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
  const [showPw, setShowPw]       = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [otp, setOtp]             = useState("");

  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

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

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] bg-white";

  const ErrorMsg = ({ msg }: { msg: string }) => (
    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
      <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
      <p className="text-red-600 text-sm">{msg}</p>
    </div>
  );

  if (step === "verify") {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-16 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-bold" style={{ color: "#1B3A6B" }}>
              Biruni<span style={{ color: "#C9A84C" }}>Map</span>
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📬</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Check your email</h2>
              <p className="text-sm text-gray-500">
                We sent a 6-digit code to <strong className="text-gray-700">{email}</strong>
              </p>
            </div>
            <form onSubmit={handleVerify} className="space-y-4">
              <input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6}
                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                required placeholder="000000"
                className={inputCls + " text-center tracking-widest text-2xl font-bold"}
                autoFocus />
              {error && <ErrorMsg msg={error} />}
              {resent && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                  <CheckCircle2 size={15} className="text-green-600 flex-shrink-0" />
                  <p className="text-green-700 text-sm">New code sent!</p>
                </div>
              )}
              <button type="submit" disabled={loading || otp.length < 6}
                className="w-full text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-50"
                style={{ backgroundColor: "#8B1A1A" }}>
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
    <main className="min-h-screen flex bg-gray-50">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-2/5 flex-col justify-between p-10 text-white"
        style={{ background: "linear-gradient(160deg, #1B3A6B 0%, #2D5A9E 100%)" }}>
        <Link href="/" className="text-xl font-bold">
          Biruni<span style={{ color: "#C9A84C" }}>Map</span>
        </Link>
        <div>
          <p className="text-3xl font-bold leading-snug mb-4">
            Join the Iranian<br />diaspora community.
          </p>
          <div className="space-y-3 text-blue-100 text-sm">
            {["Discover Iranian businesses near you", "Stay updated on community events", "Share guides and local knowledge"].map(item => (
              <div key={item} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-blue-300 opacity-60">Free forever · No spam · Iranian-run</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8 lg:hidden">
            <Link href="/" className="text-2xl font-bold" style={{ color: "#1B3A6B" }}>
              Biruni<span style={{ color: "#C9A84C" }}>Map</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-sm text-gray-500 mb-8">Free forever. Join thousands of Iranians worldwide.</p>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  required placeholder="Helma Omrani" className={inputCls} autoComplete="name" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required placeholder="you@example.com" className={inputCls} autoComplete="email" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-600">
                    Password <span className="font-normal text-gray-400">(min. 8 characters)</span>
                  </label>
                  {password.length > 0 && (
                    <span className="text-xs font-semibold" style={{ color: strengthColor }}>{strengthLabel}</span>
                  )}
                </div>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={password}
                    onChange={e => setPassword(e.target.value)} required
                    placeholder="At least 8 characters" className={inputCls + " pr-11"}
                    autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPw ? "Hide password" : "Show password"}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className="h-1 flex-1 rounded-full transition-colors duration-300"
                        style={{ backgroundColor: strength >= n ? strengthColor : "#E5E7EB" }} />
                    ))}
                  </div>
                )}
              </div>
              <div>
                <LocationSelector selected={locations} onChange={setLocations}
                  label="Where are you based? (optional)" />
              </div>

              {error && <ErrorMsg msg={error} />}

              <button type="submit" disabled={loading}
                className="w-full text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: "#8B1A1A" }}>
                {loading ? "Sending code..." : "Continue →"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{" "}
              <Link href="/auth/signin" className="font-semibold hover:underline" style={{ color: "#1B3A6B" }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
