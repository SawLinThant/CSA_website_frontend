"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { getLocaleFromPathname, withLocalePath } from "@/i18n/config";

type View = "register" | "otp";

export default function CustomerRegisterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const locale = getLocaleFromPathname(pathname);

  const [view, setView] = useState<View>("register");
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [otp, setOtp] = useState("");

  const returnTo = useMemo(() => {
    const raw = sp.get("returnTo");
    if (raw && raw.startsWith(`/${locale}/customer/`)) return raw;
    return withLocalePath(locale, "/customer/subscriptions");
  }, [locale, sp]);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "customer", phone }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Failed to send OTP");
        return;
      }
      toast.success("OTP sent");
      setView("otp");
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setSubmitting(false);
    }
  }

  async function completeRegister(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "customer",
          name,
          email: email.trim() || undefined,
          phone,
          password,
          otp,
          rememberMe,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Registration failed");
        return;
      }
      toast.success("Account created");
      router.push(returnTo);
      router.refresh();
    } catch {
      toast.error("Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <p className="mt-2 text-sm opacity-70">Create your customer account.</p>

      {view === "register" ? (
        <form onSubmit={sendOtp} className="mt-6 space-y-4">
          <label className="block">
            <div className="text-sm font-medium">Name</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 h-11 w-full rounded-xl border border-black/10 px-3"
            />
          </label>
          <label className="block">
            <div className="text-sm font-medium">Email (optional)</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="mt-1 h-11 w-full rounded-xl border border-black/10 px-3"
            />
          </label>
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
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1 h-11 w-full rounded-xl border border-black/10 px-3"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground/70">
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
            Remember me
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white hover:bg-primary/95 disabled:opacity-60"
          >
            {submitting ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={completeRegister} className="mt-6 space-y-4">
          <label className="block">
            <div className="text-sm font-medium">OTP</div>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              inputMode="numeric"
              maxLength={6}
              className="mt-1 h-11 w-full rounded-xl border border-black/10 px-3 text-center tracking-[0.3em]"
            />
          </label>

          <button
            type="submit"
            disabled={submitting || otp.length !== 6}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white hover:bg-primary/95 disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>
          <button
            type="button"
            onClick={() => setView("register")}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-black/10 text-sm font-semibold"
          >
            Back
          </button>
        </form>
      )}

      <div className="mt-4 text-sm opacity-70">
        Already have an account?{" "}
        <Link href={`${withLocalePath(locale, "/customer/login")}?returnTo=${encodeURIComponent(returnTo)}`}>
          Login
        </Link>
      </div>
    </main>
  );
}

