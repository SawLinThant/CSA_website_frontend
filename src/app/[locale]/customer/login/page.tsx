"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { getLocaleFromPathname, withLocalePath } from "@/i18n/config";

export default function CustomerLoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const locale = getLocaleFromPathname(pathname);

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const returnTo = useMemo(() => {
    const raw = sp.get("returnTo");
    if (raw && raw.startsWith(`/${locale}/customer/`)) return raw;
    return withLocalePath(locale, "/customer/subscriptions");
  }, [locale, sp]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "customer",
          phone,
          password,
          rememberMe,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Login failed");
        return;
      }
      toast.success("Login successful");
      router.push(returnTo);
      router.refresh();
    } catch {
      toast.error("Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-semibold">Customer Login</h1>
      <p className="mt-2 text-sm opacity-70">Sign in to manage your subscriptions and orders.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block">
          <div className="text-sm font-medium">Phone</div>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            minLength={6}
            inputMode="tel"
            autoComplete="tel"
            className="mt-1 h-11 w-full rounded-xl border border-black/10 px-3"
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium">Password</div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            className="mt-1 h-11 w-full rounded-xl border border-black/10 px-3"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground/70">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Remember me
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white hover:bg-primary/95 disabled:opacity-60"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-4 text-sm opacity-70">
        No account?{" "}
        <Link
          href={`${withLocalePath(locale, "/customer/register")}?returnTo=${encodeURIComponent(returnTo)}`}
        >
          Register
        </Link>
      </div>
    </main>
  );
}

