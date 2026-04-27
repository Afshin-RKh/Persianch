"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";

type Method = "email" | "phone";
type Step   = "form" | "verify";

export default function SignUpPage() {
  const { user, register, applyAuth } = useAuth();
  const router = useRouter();

  const [method, setMethod]     = useState<Method>("email");
  const [step, setStep]         = useState<Step>("form");
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [otpMsg, setOtpMsg]     = useState("");

  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp]           = useState("");

  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [resent, setResent]     = useState(false);

  if (user) { router.replace("/"); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (method === "email" && !email) { setError("Email is required"); return; }
    if (method === "phone" && !phone) { setError("Phone number is required"); return; }
    setLoading(true);
    try {
      const result = await register(name, email, password, [], phone);
      setPendingId(result.user_id);
      setOtpMsg(result.message);
      if (!result.email_sent) {
        setError("Email could not be sent. Please check your email address or try again later.");
      }
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
        body: JSON.stringify({ action: "verify_otp", user_id: pendingId, code: otp }),
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
        body: JSON.stringify({ action: "resend_otp", user_id: pendingId }),
      });
      setResent(true);
    } catch { /* non-fatal */ }
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]";

  // ── OTP verification step ──────────────────────────────────────────────
  if (step === "verify") {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-16 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-bold" style={{ color: "#1B3A6B" }}>
              Biruni<span style={{ color: "#C9A84C" }}>Map</span>
            </Link>
            <p className="text-gray-500 text-sm mt-2">Verify your account</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-6">
              <span className="text-4xl">📬</span>
              <p className="text-sm text-gray-600 mt-3">{otpMsg}</p>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Verification Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                  placeholder="6-digit code"
                  className={inputCls + " text-center tracking-widest text-xl font-bold"}
                  autoFocus
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}
              {resent && <p className="text-green-600 text-sm">Code resent!</p>}

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-50 transition-colors"
                style={{ backgroundColor: "#8B1A1A" }}
              >
                {loading ? "Verifying..." : "Verify & Create Account"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              {"Didn't receive it? "}
              <button
                onClick={handleResend}
                className="font-semibold hover:underline"
                style={{ color: "#1B3A6B" }}
              >
                Resend code
              </button>
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ── Registration form ──────────────────────────────────────────────────
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold" style={{ color: "#1B3A6B" }}>
            Biruni<span style={{ color: "#C9A84C" }}>Map</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Create your free account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Method toggle */}
          <div className="flex rounded-xl border border-gray-200 mb-6 overflow-hidden">
            {(["email", "phone"] as Method[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMethod(m); setError(""); }}
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                  method === m
                    ? "text-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                style={method === m ? { backgroundColor: "#1B3A6B" } : {}}
              >
                {m === "email" ? "📧 Email" : "📱 Phone"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Ali Hosseini"
                className={inputCls}
              />
            </div>

            {method === "email" ? (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className={inputCls}
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  placeholder="+49 176 12345678"
                  className={inputCls}
                />
                <p className="text-xs text-gray-400 mt-1">Include country code (e.g. +49 for Germany)</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Min. 8 characters"
                className={inputCls}
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-3 rounded-xl transition-colors text-sm disabled:opacity-50"
              style={{ backgroundColor: "#8B1A1A" }}
            >
              {loading ? "Sending code..." : "Continue →"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/auth/signin" className="font-semibold hover:underline" style={{ color: "#1B3A6B" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
