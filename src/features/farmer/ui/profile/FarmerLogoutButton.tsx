"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Locale } from "@/i18n/config";
import { withLocalePath } from "@/i18n/config";

export default function FarmerLogoutButton({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function onLogout() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) {
        toast.error("Failed to logout. Please try again.");
        return;
      }
      toast.success("Logged out successfully.");
      router.replace(withLocalePath(locale, "/farmer/login"));
      router.refresh();
    } catch {
      toast.error("Failed to logout. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void onLogout()}
      disabled={submitting}
      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
    >
      {submitting ? "Logging out..." : "Logout"}
    </button>
  );
}
