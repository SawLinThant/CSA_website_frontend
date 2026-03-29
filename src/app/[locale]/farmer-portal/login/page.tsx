"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { getLocaleFromPathname, withLocalePath } from "@/i18n/config";

export default function FarmerPortalLoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/farmer/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password, rememberMe }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Farmer login failed");
        return;
      }
      toast.success("Farmer login successful");
      router.push(withLocalePath(locale, "/farmer"));
      router.refresh();
    } catch {
      toast.error("Farmer login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-md h-[90vh] flex flex-col justify-center px-4 py-10">
      <h1 className="text-2xl font-semibold text-foreground">Farmer Portal Login</h1>
      <p className="mt-2 text-sm text-muted-foreground">Sign in to manage products, harvests, and farm profile.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-xl border bg-card p-5">
        <label className="block">
          <span className="text-sm font-medium">Phone</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            minLength={6}
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Password</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            minLength={8}
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
          Remember me
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-60"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        No farmer account?{" "}
        <Link href={withLocalePath(locale, "/farmer-portal/register")} className="font-semibold text-primary hover:underline">
          Register here
        </Link>
      </p>
    </main>
  );
}
