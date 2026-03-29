"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { getLocaleFromPathname, withLocalePath } from "@/i18n/config";

type View = "register" | "otp";

export default function FarmerPortalRegisterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const [view, setView] = useState<View>("register");
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [farmName, setFarmName] = useState("");
  const [farmLocation, setFarmLocation] = useState("");
  const [farmDescription, setFarmDescription] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [otp, setOtp] = useState("");

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/farmer/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
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
      const res = await fetch("/api/farmer/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: email.trim() || undefined,
          phone,
          password,
          farmName,
          farmLocation,
          farmDescription: farmDescription.trim() || undefined,
          otp,
          rememberMe,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Farmer registration failed");
        return;
      }
      toast.success("Farmer account created");
      router.push(withLocalePath(locale, "/farmer"));
      router.refresh();
    } catch {
      toast.error("Farmer registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-semibold text-foreground">Farmer Portal Register</h1>
      <p className="mt-2 text-sm text-muted-foreground">Create your farmer account for the dedicated farmer portal.</p>

      {view === "register" ? (
        <form onSubmit={sendOtp} className="mt-6 space-y-4 rounded-xl border bg-card p-5">
          <label className="block">
            <span className="text-sm font-medium">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full rounded-md border px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Email (optional)</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="mt-1 w-full rounded-md border px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Phone</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} required minLength={6} className="mt-1 w-full rounded-md border px-3 py-2" />
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
          <label className="block">
            <span className="text-sm font-medium">Farm Name</span>
            <input value={farmName} onChange={(e) => setFarmName(e.target.value)} required className="mt-1 w-full rounded-md border px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Farm Location</span>
            <input
              value={farmLocation}
              onChange={(e) => setFarmLocation(e.target.value)}
              required
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Farm Description (optional)</span>
            <textarea
              value={farmDescription}
              onChange={(e) => setFarmDescription(e.target.value)}
              rows={3}
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
            {submitting ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={completeRegister} className="mt-6 space-y-4 rounded-xl border bg-card p-5">
          <label className="block">
            <span className="text-sm font-medium">OTP</span>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              inputMode="numeric"
              maxLength={6}
              className="mt-1 w-full rounded-md border px-3 py-2 text-center tracking-[0.3em]"
            />
          </label>
          <button
            type="submit"
            disabled={submitting || otp.length !== 6}
            className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Create farmer account"}
          </button>
          <button
            type="button"
            onClick={() => setView("register")}
            className="w-full rounded-md border px-4 py-2 font-medium"
          >
            Back
          </button>
        </form>
      )}

      <p className="mt-4 text-sm text-muted-foreground">
        Already have a farmer account?{" "}
        <Link href={withLocalePath(locale, "/farmer-portal/login")} className="font-semibold text-primary hover:underline">
          Login here
        </Link>
      </p>
    </main>
  );
}
