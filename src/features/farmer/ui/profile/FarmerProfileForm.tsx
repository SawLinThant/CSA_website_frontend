"use client";

import { useActionState, useEffect } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import type { Locale } from "@/i18n/config";
import type { AppMessages } from "@/i18n/messages";
import type { FarmerProfileResponse } from "@/features/farmer/domain/schemas";
import {
  updateFarmerProfileAction,
  type FormActionState,
} from "@/features/farmer/actions/profileActions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const initialState: FormActionState = { ok: false };

export default function FarmerProfileForm({
  locale,
  data,
  messages,
  embedDashboard = false,
}: {
  locale: Locale;
  data: FarmerProfileResponse;
  messages: AppMessages["farmer"];
  /** When true, skip inner card shell (parent section provides it). */
  embedDashboard?: boolean;
}) {
  const [state, formAction, pending] = useActionState(updateFarmerProfileAction, initialState);

  useEffect(() => {
    if (state === initialState) return;
    if (state.ok) toast.success(messages.saved);
    else if (state.error) toast.error(state.error);
  }, [state, messages.saved]);

  const { user, farmer } = data;

  return (
    <form action={formAction} className={cn(!embedDashboard && "mx-auto max-w-xl space-y-4")}>
      <input type="hidden" name="_locale" value={locale} />

      <div
        className={cn(
          embedDashboard ? "space-y-0" : "space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6",
        )}
      >
        <div className={cn("grid gap-4 sm:grid-cols-2", !embedDashboard && "mt-4")}>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-muted-foreground">{messages.name}</span>
            <input
              name="name"
              defaultValue={user.name}
              required
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/40 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">{messages.phone}</span>
            <input
              name="phone"
              defaultValue={user.phone}
              required
              minLength={6}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/40 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">{messages.email}</span>
            <input
              name="email"
              type="email"
              defaultValue={user.email ?? ""}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/40 focus:ring-2"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-muted-foreground">Profile Image URL</span>
            <input
              name="imageUrl"
              type="url"
              defaultValue={user.imageUrl ?? ""}
              placeholder="https://"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/40 focus:ring-2"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-muted-foreground">Profile Image Upload</span>
            <input
              name="image"
              type="file"
              accept="image/*"
              className="mt-1 w-full text-sm file:mr-2 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-muted-foreground">{messages.farmName}</span>
            <input
              name="farmName"
              defaultValue={farmer.farmName}
              required
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/40 focus:ring-2"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-muted-foreground">{messages.farmLocation}</span>
            <input
              name="farmLocation"
              defaultValue={farmer.farmLocation}
              required
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/40 focus:ring-2"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-muted-foreground">{messages.farmDescription}</span>
            <textarea
              name="farmDescription"
              rows={3}
              defaultValue={farmer.farmDescription ?? ""}
              className="mt-1 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/40 focus:ring-2"
            />
          </label>
        </div>
        <div className={cn("mt-6", embedDashboard && "flex justify-end")}>
          <Button type="submit" disabled={pending} className={cn(!embedDashboard && "w-full sm:w-auto", "gap-2")}>
            <Save className="size-4 opacity-90" aria-hidden />
            {pending ? messages.saving : messages.save}
          </Button>
        </div>
      </div>
    </form>
  );
}
