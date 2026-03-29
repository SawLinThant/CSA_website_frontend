"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthModal } from "@/components/site/auth";
import type { AppMessages } from "@/i18n/messages";

export default function SubscribeNowButton({
  authRole,
  messages,
  planId,
}: {
  authRole: "guest" | "customer" | "farmer" | "admin";
  messages: AppMessages["auth"];
  planId?: string;
}) {
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  return (
    <>
      <button
        type="button"
        disabled={submitting}
        onClick={() => {
          if (authRole === "guest") {
            setAuthOpen(true);
            return;
          }
          if (authRole !== "customer") {
            toast.error("Only customer accounts can subscribe.");
            return;
          }
          if (!planId) {
            toast.error("No active subscription plan for this box.");
            return;
          }

          setSubmitting(true);
          void fetch("/api/subscriptions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ planId }),
          })
            .then(async (res) => {
              const data = (await res.json().catch(() => ({}))) as { error?: string };
              if (!res.ok) {
                throw new Error(data.error ?? "Subscription failed");
              }
              toast.success("Subscribed successfully.");
              router.push("/subscriptions");
              router.refresh();
            })
            .catch((e) => {
              const message = e instanceof Error ? e.message : "Subscription failed";
              if (message.toLowerCase().includes("address")) {
                toast.error("Please add your delivery address in Profile before subscribing.");
                return;
              }
              toast.error(message);
            })
            .finally(() => {
              setSubmitting(false);
            });
        }}
        className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#2F6B2F] text-sm font-semibold text-white transition hover:bg-[#275A27]"
      >
        {submitting ? "Subscribing..." : "Subscribe Now"}
      </button>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode="login"
        messages={messages}
      />
    </>
  );
}

