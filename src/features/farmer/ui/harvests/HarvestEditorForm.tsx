"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Locale } from "@/i18n/config";
import { withLocalePath } from "@/i18n/config";
import type { AppMessages } from "@/i18n/messages";
import type { Harvest } from "@/features/farmer/domain/schemas";
import { createHarvestAction, updateHarvestAction } from "@/features/farmer/actions/harvestActions";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProductOption = { id: string; name: string };

type Props = {
  locale: Locale;
  messages: AppMessages["farmer"];
  products: ProductOption[];
  mode: "create" | "edit";
  harvest?: Harvest;
  onDone?: () => void;
  onCancel?: () => void;
  inModal?: boolean;
};

function toInputDate(iso: string) {
  return iso.slice(0, 10);
}

export default function HarvestEditorForm({
  locale,
  messages,
  products,
  mode,
  harvest,
  onDone,
  onCancel,
  inModal = false,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const qty = Number(fd.get("quantityAvailable"));
    const price = Number(fd.get("unitPrice"));
    const harvestDate = String(fd.get("harvestDate") ?? "");
    const availableUntil = String(fd.get("availableUntil") ?? "");

    if (!(qty > 0) || !(price > 0) || !harvestDate || !availableUntil) {
      toast.error(messages.error);
      return;
    }

    startTransition(async () => {
      if (mode === "create") {
        const productId = String(fd.get("productId") ?? "");
        if (!productId) {
          toast.error(messages.error);
          return;
        }
        const r = await createHarvestAction(locale, {
          productId,
          quantityAvailable: Math.floor(qty),
          unitPrice: price,
          harvestDate,
          availableUntil,
        });
        if (!r.ok) {
          toast.error(r.error ?? messages.error);
          return;
        }
        toast.success("OK");
        if (!onDone) {
          router.push(`${withLocalePath(locale, "/farmer")}#recent-harvests`);
        }
        router.refresh();
        onDone?.();
        return;
      }

      if (!harvest) return;
      const r = await updateHarvestAction(locale, harvest.id, {
        quantityAvailable: Math.floor(qty),
        unitPrice: price,
        harvestDate,
        availableUntil,
      });
      if (!r.ok) {
        toast.error(r.error ?? messages.error);
        return;
      }
      toast.success("OK");
      if (!onDone) {
        router.push(`${withLocalePath(locale, "/farmer")}#recent-harvests`);
      }
      router.refresh();
      onDone?.();
    });
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", inModal ? "w-full" : "mx-auto max-w-xl")}>
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <div className="grid gap-4">
          {mode === "create" ? (
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">{messages.selectProduct}</span>
              <select
                name="productId"
                required
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/40 focus:ring-2"
              >
                <option value="">—</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">{messages.quantity}</span>
            <input
              name="quantityAvailable"
              type="number"
              min={1}
              step={1}
              required
              defaultValue={harvest?.quantityAvailable}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/40 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">{messages.unitPrice}</span>
            <input
              name="unitPrice"
              type="number"
              step="0.01"
              min={0.01}
              required
              defaultValue={harvest?.unitPrice}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/40 focus:ring-2"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">{messages.harvestDate}</span>
              <input
                name="harvestDate"
                type="date"
                required
                defaultValue={harvest ? toInputDate(harvest.harvestDate) : undefined}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/40 focus:ring-2"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">{messages.availableUntil}</span>
              <input
                name="availableUntil"
                type="date"
                required
                defaultValue={harvest ? toInputDate(harvest.availableUntil) : undefined}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/40 focus:ring-2"
              />
            </label>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button type="submit" disabled={pending}>
            {pending ? "…" : messages.save}
          </Button>
          {onCancel ? (
            <button type="button" onClick={onCancel} className={cn(buttonVariants({ variant: "outline" }))}>
              {messages.backToList}
            </button>
          ) : (
            <Link
              href={`${withLocalePath(locale, "/farmer")}#recent-harvests`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              {messages.backToList}
            </Link>
          )}
        </div>
      </div>
    </form>
  );
}
