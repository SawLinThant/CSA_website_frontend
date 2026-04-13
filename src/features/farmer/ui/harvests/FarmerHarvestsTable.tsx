"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CalendarDays, CircleOff, Pencil, Plus, Sprout, X } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { withLocalePath } from "@/i18n/config";
import type { AppMessages } from "@/i18n/messages";
import type { Harvest } from "@/features/farmer/domain/schemas";
import { formatMoneyAmount } from "@/lib/format/money";
import { cn } from "@/lib/utils";
import HarvestEditorForm from "./HarvestEditorForm";

function dateShort(iso: string) {
  return iso.slice(0, 10);
}

function harvestStatusClass(status: Harvest["status"]) {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200";
    case "pending":
      return "bg-amber-100 text-amber-950 dark:bg-amber-950/50 dark:text-amber-100";
    default:
      return "bg-red-100 text-red-900 dark:bg-red-950/60 dark:text-red-200";
  }
}

export default function FarmerHarvestsTable({
  locale,
  messages,
  items,
  products,
  productNames,
  statusLabels,
}: {
  locale: Locale;
  messages: AppMessages["farmer"];
  items: Harvest[];
  products: { id: string; name: string }[];
  productNames: Record<string, string>;
  statusLabels: Record<Harvest["status"], string>;
}) {
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingHarvest, setEditingHarvest] = useState<Harvest | undefined>(undefined);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openCreateModal() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsModalClosing(false);
    setEditingHarvest(undefined);
    setModalMode("create");
  }

  function openEditModal(harvest: Harvest) {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsModalClosing(false);
    setEditingHarvest(harvest);
    setModalMode("edit");
  }

  function closeModal() {
    if (!modalMode || isModalClosing) return;
    setIsModalClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setModalMode(null);
      setEditingHarvest(undefined);
      setIsModalClosing(false);
      closeTimerRef.current = null;
    }, 200);
  }

  useEffect(() => {
    if (!modalMode) return;
    const onEsc = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [modalMode, isModalClosing]);

  useEffect(
    () => () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    },
    [],
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[32px]">Recent Harvests</h3>
          <p className="text-sm text-muted-foreground">Fresh yields waiting to be processed or shipped.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={withLocalePath(locale, "/farmer/harvests")} className="text-xs font-semibold text-emerald-800 hover:underline">
            View Full History
          </Link>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            <Plus className="size-3.5" />
            {messages.createHarvest}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {items.map((h) => (
          <article key={h.id} className="rounded-2xl border border-border/80 bg-card px-4 py-3 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Sprout className="size-4" />
                </span>
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-semibold text-foreground">{productNames[h.productId] ?? h.productId}</h4>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" />
                    Harvested: {dateShort(h.harvestDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize",
                    harvestStatusClass(h.status),
                  )}
                >
                  {statusLabels[h.status]}
                </span>
                <button
                  type="button"
                  onClick={() => openEditModal(h)}
                  className="inline-flex size-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  title={messages.editHarvest}
                >
                  <Pencil className="size-3.5" />
                </button>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/80 pt-2.5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/80">Available</p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <CircleOff className="size-3.5 text-muted-foreground" />
                  {h.quantityAvailable} units
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/80">Market Val.</p>
                <p className="mt-1 text-sm font-semibold text-emerald-700">{formatMoneyAmount(h.unitPrice, locale)}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {items.length === 0 ? <p className="text-sm text-muted-foreground">{messages.noHarvests}</p> : null}

      {modalMode ? (
        <div
          className={[
            "fixed inset-0 z-50 flex items-end justify-center bg-black/35 px-0 py-0 sm:items-center sm:px-4 sm:py-8",
            isModalClosing ? "animate-out fade-out duration-200" : "animate-in fade-in duration-200",
          ].join(" ")}
          onClick={closeModal}
        >
          <div
            className={[
              "w-full max-w-3xl rounded-t-2xl border border-border bg-background shadow-2xl sm:rounded-2xl",
              isModalClosing ? "animate-out fade-out zoom-out-95 duration-200" : "animate-in fade-in zoom-in-95 duration-200",
            ].join(" ")}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="text-lg font-semibold text-foreground">
                {modalMode === "create" ? messages.createHarvest : messages.editHarvest}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close harvest editor"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="max-h-[85vh] overflow-y-auto p-4 sm:max-h-[78vh] sm:p-5">
              <HarvestEditorForm
                locale={locale}
                messages={messages}
                products={products}
                mode={modalMode}
                harvest={modalMode === "edit" ? editingHarvest : undefined}
                onDone={closeModal}
                onCancel={closeModal}
                inModal
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
