"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "https://birunimap.com/api";

type Step = "form" | "forgot" | "reset";

export default function SignInPage() {
  const { login, user, applyAuth } = useAuth();
  const router = useRouter();

  const [step, setStep]             = useState<Step>("form");
  const [resetPendingId, setResetPendingId] = useState<number>(0);

  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode]   = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [error, setError]           = useState("");
  const [info, setInfo]             = useState("");
  const [loading, setLoading]       = useState(false);

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

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]";

  // ── Forgot password step ───────────────────────────────────────────────
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
                <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required placeholder="you@example.com" className={inputCls} autoFocus />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-50"
                style={{ backgroundColor: "#8B1A1A" }}
              >
                {loading ? "Sending..." : "Send Reset Code →"}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-5">
              <button onClick={() => { setStep("form"); setError(""); }} className="font-semibold hover:underline" style={{ color: "#1B3A6B" }}>
                ← Back to sign in
              </button>
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ── Reset code + new password step ────────────────────────────────────
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
            {info && <p className="text-sm text-gray-600 mb-4 text-center">{info}</p>}
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">6-digit Code</label>
                <input
                  type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6}
                  value={resetCode} onChange={e => setResetCode(e.target.value.replace(/\D/g, ""))}
                  required placeholder="000000"
                  className={inputCls + " text-center tracking-widest text-2xl font-bold"}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="Min. 8 characters" className={inputCls} />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button type="submit" disabled={loading || resetCode.length < 6}
                className="w-full text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-50"
                style={{ backgroundColor: "#8B1A1A" }}
              >
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
    <main className="min-h-screen flex items-center justify-center px-4 py-16 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold" style={{ color: "#1B3A6B" }}>
            Biruni<span style={{ color: "#C9A84C" }}>Map</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Sign in to your account</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className={inputCls} />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-gray-600">Password</label>
                <button type="button" onClick={() => { setStep("forgot"); setForgotEmail(email); setError(""); }}
                  className="text-xs hover:underline" style={{ color: "#1B3A6B" }}>
                  Forgot password?
                </button>
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className={inputCls} />
            </div>

            {info && <p className="text-green-600 text-sm">{info}</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-50"
              style={{ backgroundColor: "#8B1A1A" }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            No account?{" "}
            <Link href="/auth/signup" className="font-semibold hover:underline" style={{ color: "#1B3A6B" }}>Create one</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
