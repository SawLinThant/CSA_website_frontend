"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AppMessages } from "@/i18n/messages";

type AuthMode = "login" | "register";
type View = "login" | "register" | "otp";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  initialMode: AuthMode;
  messages: AppMessages["auth"];
};

const MODAL_TRANSITION_MS = 280;

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-neutral-800/50">
      <path
        d="M6.6 3h2.8c.33 0 .6.27.6.6 0 1.77.35 3.5 1 5.1a.6.6 0 0 1-.26.66l-1.74 1.04a12.04 12.04 0 0 0 5.3 5.3l1.04-1.74a.6.6 0 0 1 .66-.26c1.6.65 3.33 1 5.1 1 .33 0 .6.27.6.6v2.8c0 1.1-.9 2-2 2C10.07 22 2 13.93 2 4.6A2.6 2.6 0 0 1 4.6 2h2z"
        stroke="green"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-neutral-800/50">
      <rect x="5" y="10" width="14" height="11" rx="2" stroke="green" strokeWidth="1.4" />
      <path
        d="M8 10V7a4 4 0 0 1 8 0v3"
        stroke="green"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-neutral-800/50">
      <circle cx="12" cy="9" r="3.5" stroke="green" strokeWidth="1.4" />
      <path
        d="M6 19.5v-.5c0-2.5 2.46-4.5 6-4.5s6 2 6 4.5v.5"
        stroke="green"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-neutral-800/50">
      <rect x="4" y="6" width="16" height="12" rx="2" stroke="green" strokeWidth="1.4" />
      <path
        d="M4 8.5 12 13l8-4.5"
        stroke="green"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AuthModal({ open, onClose, initialMode, messages }: AuthModalProps) {
  const router = useRouter();
  const titleId = useId();
  const [view, setView] = useState<View>("login");
  const role = "customer";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [mounted, setMounted] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      let cancelled = false;
      const outer = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!cancelled) setAnimateIn(true);
        });
      });
      return () => {
        cancelled = true;
        cancelAnimationFrame(outer);
      };
    }

    setAnimateIn(false);
    const hideTimer = window.setTimeout(() => setMounted(false), MODAL_TRANSITION_MS);
    return () => window.clearTimeout(hideTimer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setView(initialMode === "register" ? "register" : "login");
    setError(null);
    setOtp("");
  }, [open, initialMode]);

  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted, onClose]);

  if (!mounted) return null;

  const goLogin = () => {
    setView("login");
    setError(null);
    setOtp("");
  };

  const goRegister = () => {
    setView("register");
    setError(null);
    setOtp("");
  };

  const normalizeDigits = (value: string, max: number) => value.replace(/\D/g, "").slice(0, max);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          phone,
          password,
          rememberMe,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        const msg = data.error ?? messages.errorGeneric;
        setError(msg);
        toast.error(msg);
        return;
      }
      toast.success(messages.toastLoginSuccess);
      router.refresh();
      onClose();
    } catch {
      setError(messages.errorGeneric);
      toast.error(messages.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterContinue(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError(messages.passwordPlaceholder);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, phone }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        const msg = data.error ?? messages.toastOtpSendFailed;
        setError(msg);
        toast.error(msg);
        return;
      }
      toast.success(messages.toastOtpSent);
      setView("otp");
    } catch {
      setError(messages.errorGeneric);
      toast.error(messages.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterComplete(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      const body = {
        role: "customer" as const,
        name: name.trim(),
        email: email.trim() || undefined,
        phone,
        password,
        otp,
        rememberMe,
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        const msg = data.error ?? messages.errorGeneric;
        setError(msg);
        toast.error(msg);
        return;
      }
      toast.success(messages.toastRegisterSuccess);
      router.refresh();
      onClose();
    } catch {
      setError(messages.errorGeneric);
      toast.error(messages.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 transition-opacity ease-out ${
        animateIn ? "opacity-100" : "opacity-0"
      }`}
      style={{ transitionDuration: `${MODAL_TRANSITION_MS}ms` }}
      role="presentation"
      onMouseDown={(ev) => {
        if (ev.target === ev.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`max-h-[min(90vh,720px)] w-full max-w-[420px] overflow-y-auto rounded-[12px] bg-white shadow-xl transition-[opacity,transform] ease-out ${
          animateIn ? "translate-y-0 scale-100 opacity-100" : "translate-y-1 scale-[0.98] opacity-0"
        }`}
        style={{ transitionDuration: `${MODAL_TRANSITION_MS}ms` }}
      >
        <div className="relative bg-primary px-6 pb-4 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-md p-1 text-green hover:bg-black/5"
            aria-label={messages.closeAria}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="text-green">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <p className="text-xs font-medium uppercase tracking-wide text-white">FreshRoot</p>
          <h2 id={titleId} className="mt-1 text-xl font-bold text-white">
            {view === "login" && messages.loginTitle}
            {view === "register" && messages.registerTitle}
            {view === "otp" && messages.otpTitle}
          </h2>
          <p className="mt-1 text-sm text-white">
            {view === "login" && messages.loginSubtitle}
            {view === "register" && messages.registerSubtitle}
            {view === "otp" && messages.otpSubtitle}
          </p>
        </div>

        <div className="px-6 py-5">
          {/* {error ? (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : null} */}

          {view === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-800/80">{messages.phoneLabel}</label>
                <div className="mt-1 flex items-center border border-primary gap-2 rounded-[10px] bg-[#fff9f0] px-3 py-2.5 ring-primary/25 focus-within:ring-2">
                  <PhoneIcon />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder={messages.phonePlaceholder}
                    className="min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-800/45"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-medium text-neutral-800/80">{messages.passwordLabel}</label>
                  <button
                    type="button"
                    className="text-xs font-medium text-primary/90 opacity-50"
                    disabled
                    title="Coming soon"
                  >
                    {messages.forgotPassword}
                  </button>
                </div>
                <div className="mt-1 flex items-center gap-2 border border-primary rounded-[10px] bg-[#fff9f0] px-3 py-2.5 ring-primary/25 focus-within:ring-2">
                  <LockIcon />
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    autoComplete="current-password"
                    placeholder={messages.passwordPlaceholder}
                    className="min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-800/45"
                    required
                    minLength={8}
                  />
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-800/75">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-4 rounded border-neutral-400 text-primary accent-primary"
                />
                {messages.rememberMe}
              </label>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-[10px] bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/95 disabled:opacity-60"
              >
                {loading ? messages.submitting : messages.login}
              </button>
            </form>
          ) : null}

          {view === "register" ? (
            <form onSubmit={handleRegisterContinue} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-800/80">{messages.nameLabel}</label>
                <div className="mt-1 flex items-center gap-2 rounded-[10px] border border-primary bg-[#fff9f0] px-3 py-2.5 ring-primary/25 focus-within:ring-2">
                  <UserIcon />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    placeholder={messages.nameLabel}
                    className="min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-800/45"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-800/80">{messages.emailLabel}</label>
                <div className="mt-1 flex items-center gap-2 rounded-[10px] border border-primary bg-[#fff9f0] px-3 py-2.5 ring-primary/25 focus-within:ring-2">
                  <MailIcon />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder={messages.emailLabel}
                    autoComplete="email"
                    className="min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-800/45"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-800/80">{messages.phoneLabel}</label>
                <div className="mt-1 flex items-center gap-2 rounded-[10px] border border-primary bg-[#fff9f0] px-3 py-2.5 ring-primary/25 focus-within:ring-2">
                  <PhoneIcon />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder={messages.phonePlaceholder}
                    className="min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-800/45"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-800/80">{messages.passwordLabel}</label>
                <div className="mt-1 flex items-center gap-2 rounded-[10px] border border-primary bg-[#fff9f0] px-3 py-2.5 ring-primary/25 focus-within:ring-2">
                  <LockIcon />
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    autoComplete="new-password"
                    placeholder={messages.passwordPlaceholder}
                    className="min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-800/45"
                    required
                    minLength={8}
                  />
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-800/75">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-4 rounded border-neutral-400 accent-primary"
                />
                {messages.rememberMe}
              </label>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-[10px] bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/95 disabled:opacity-60"
              >
                {loading ? messages.sendingOtp : messages.registerCta}
              </button>
            </form>
          ) : null}

          {view === "otp" ? (
            <form onSubmit={handleRegisterComplete} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-primary">{messages.otpPlaceholder}</label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(normalizeDigits(e.target.value, 6))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  className="mt-1 w-full rounded-[10px] border border-primary text-primary bg-[#fff9f0] px-3 py-3 text-center font-mono text-xl tracking-[0.35em] outline-none ring-primary/25 focus:ring-2"
                  maxLength={6}
                  required
                />
              </div>
              <div className="flex gap-2">
                {/* <button
                  type="button"
                  onClick={() => {
                    setView("register");
                    setError(null);
                  }}
                  className="flex-1 rounded-[10px] border border-neutral-300 py-3 text-sm font-medium text-neutral-800"
                >
                  {messages.back}
                </button> */}
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="flex-2 rounded-[10px] bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/95 disabled:opacity-60"
                >
                  {loading ? messages.submitting : messages.verifyCreateAccount}
                </button>
              </div>
            </form>
          ) : null}
        </div>

        <div className="border-t border-neutral-200/80 bg-[#fff9f0] px-6 py-4 text-center text-sm text-neutral-800/75">
          {view === "login" ? (
            <>
              {messages.noAccount}{" "}
              <button type="button" onClick={goRegister} className="font-bold text-primary hover:underline">
                {messages.register}
              </button>
            </>
          ) : view === "register" ? (
            <>
              {messages.haveAccount}{" "}
              <button type="button" onClick={goLogin} className="font-bold text-primary hover:underline">
                {messages.login}
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setView("register")} className="font-medium text-primary hover:underline">
              {messages.back}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
