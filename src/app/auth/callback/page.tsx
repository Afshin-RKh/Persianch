"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function AuthCallbackPage() {
  const { user } = useAuth();
  const router   = useRouter();

  useEffect(() => {
    // AuthProvider handles the token from URL on mount.
    // Once user is set, redirect home.
    if (user) router.replace("/");
  }, [user, router]);

  return (
    <main className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
      Signing you in...
    </main>
  );
}
