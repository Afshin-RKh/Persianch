"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";

type Step = "form" | "forgot" | "reset";

export default function SignInPage() {
  const { login, user, applyAuth } = useAuth();
  const router = useRouter();

  const [step, setStep]                     = useState<Step>("form");
  const [resetPendingId, setResetPendingId] = useState<number>(0);

  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotEmail, setForgotEmail]   = useState("");
  const [resetCode, setResetCode]       = useState("");
  const [newPassword, setNewPassword]   = useState("");
  const [showNewPw, setShowNewPw]       = useState(false);

  const [error, setError]   = useState("");
  const [info, setInfo]     = useState("");
  const [loading, setLoading] = useState(false);

  if (user) { router.replace("/"); return null; }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "forgot_password", email: forgotEmail }),
      });
      const data = await res.json();
      setResetPendingId(data.pending_id || 0);
      setInfo(data.message || "If that email exists, we sent a reset code.");
      setStep("reset");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_password", pending_id: resetPendingId, code: resetCode, password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      setStep("form");
      setInfo("Password updated! You can now sign in.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] bg-white";

  const ErrorMsg = ({ msg }: { msg: string }) => (
    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
      <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
      <p className="text-red-600 text-sm">{msg}</p>
    </div>
  );

  const InfoMsg = ({ msg }: { msg: string }) => (
    <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
      <CheckCircle2 size={15} className="text-green-600 flex-shrink-0 mt-0.5" />
      <p className="text-green-700 text-sm">{msg}</p>
    </div>
  );

  // ── Forgot password ────────────────────────────────────────────────────
  if (step === "forgot") {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-16 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-bold" style={{ color: "#1B3A6B" }}>
              Biruni<span style={{ color: "#C9A84C" }}>Map</span>
            </Link>
            <p className="text-gray-500 text-sm mt-2">Reset your password</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Your Email</label>
                <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                  required placeholder="you@example.com" className={inputCls} autoFocus />
              </div>
              {error && <ErrorMsg msg={error} />}
              <button type="submit" disabled={loading}
                className="w-full text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-50"
                style={{ backgroundColor: "#8B1A1A" }}>
                {loading ? "Sending..." : "Send Reset Code →"}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-5">
              <button onClick={() => { setStep("form"); setError(""); }}
                className="font-semibold hover:underline" style={{ color: "#1B3A6B" }}>
                ← Back to sign in
              </button>
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ── Reset code ─────────────────────────────────────────────────────────
  if (step === "reset") {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-16 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-bold" style={{ color: "#1B3A6B" }}>
              Biruni<span style={{ color: "#C9A84C" }}>Map</span>
            </Link>
            <p className="text-gray-500 text-sm mt-2">Enter your reset code</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {info && <InfoMsg msg={info} />}
            <form onSubmit={handleReset} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">6-digit Code</label>
                <input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6}
                  value={resetCode} onChange={e => setResetCode(e.target.value.replace(/\D/g, ""))}
                  required placeholder="000000"
                  className={inputCls + " text-center tracking-widest text-2xl font-bold"}
                  autoFocus />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">New Password</label>
                <div className="relative">
                  <input type={showNewPw ? "text" : "password"} value={newPassword}
                    onChange={e => setNewPassword(e.target.value)} required
                    placeholder="Min. 8 characters" className={inputCls + " pr-11"} />
                  <button type="button" onClick={() => setShowNewPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showNewPw ? "Hide password" : "Show password"}>
                    {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {error && <ErrorMsg msg={error} />}
              <button type="submit" disabled={loading || resetCode.length < 6}
                className="w-full text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-50"
                style={{ backgroundColor: "#8B1A1A" }}>
                {loading ? "Updating..." : "Set New Password →"}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  // ── Sign in form ───────────────────────────────────────────────────────
  return (
    <main className="min-h-screen flex bg-gray-50">
      {/* Left decorative panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-2/5 flex-col justify-between p-10 text-white"
        style={{ background: "linear-gradient(160deg, #0D1B2E 0%, #1B3A6B 100%)" }}>
        <Link href="/" className="text-xl font-bold">
          Biruni<span style={{ color: "#C9A84C" }}>Map</span>
        </Link>
        <div>
          <p className="text-3xl font-bold leading-snug mb-4">
            The map of the<br />Iranian diaspora.
          </p>
          <p className="text-blue-200 text-sm leading-relaxed max-w-xs">
            Businesses, events and community for Iranians worldwide — across 50+ countries.
          </p>
        </div>
        <p className="text-xs text-blue-300 opacity-60">Inspired by Al-Biruni · Est. 973 CE</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8 lg:hidden">
            <Link href="/" className="text-2xl font-bold" style={{ color: "#1B3A6B" }}>
              Biruni<span style={{ color: "#C9A84C" }}>Map</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-8">Sign in to your account to continue.</p>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required placeholder="you@example.com" className={inputCls} autoComplete="email" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-gray-600">Password</label>
                  <button type="button" onClick={() => { setStep("forgot"); setForgotEmail(email); setError(""); }}
                    className="text-xs font-medium hover:underline" style={{ color: "#1B3A6B" }}>
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={password}
                    onChange={e => setPassword(e.target.value)} required
                    placeholder="••••••••" className={inputCls + " pr-11"}
                    autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPw ? "Hide password" : "Show password"}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                  className="rounded accent-[#1B3A6B] w-4 h-4" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>

              {info && <InfoMsg msg={info} />}
              {error && <ErrorMsg msg={error} />}

              <button type="submit" disabled={loading}
                className="w-full text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: "#8B1A1A" }}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              No account?{" "}
              <Link href="/auth/signup" className="font-semibold hover:underline" style={{ color: "#1B3A6B" }}>
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
