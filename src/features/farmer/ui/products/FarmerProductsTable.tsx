"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Pencil, Plus, X } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { AppMessages } from "@/i18n/messages";
import type { Product } from "@/features/products/domain/schemas";
import type { Category } from "@/features/farmer/domain/schemas";
import { formatMoneyAmount } from "@/lib/format/money";
import { cn } from "@/lib/utils";
import ProductDeleteButton from "./ProductDeleteButton";
import ProductEditorForm from "./ProductEditorForm";

function primaryImage(product: Product) {
  const imgs = product.images ?? [];
  const primary = imgs.find((i) => i.isPrimary) ?? imgs[0];
  return primary?.imageUrl ?? null;
}

export default function FarmerProductsTable({
  locale,
  messages,
  items,
  categories,
}: {
  locale: Locale;
  messages: AppMessages["farmer"];
  items: Product[];
  categories: Category[];
}) {
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!modalMode) return;
    const onEsc = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        closeModal();
      }
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [modalMode]);

  function openCreateModal() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsModalClosing(false);
    setEditingProduct(undefined);
    setModalMode("create");
  }

  function openEditModal(product: Product) {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsModalClosing(false);
    setEditingProduct(product);
    setModalMode("edit");
  }

  function closeModal() {
    if (!modalMode || isModalClosing) return;
    setIsModalClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setModalMode(null);
      setEditingProduct(undefined);
      setIsModalClosing(false);
      closeTimerRef.current = null;
    }, 200);
  }

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
          <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[26px]">Active Catalogue</h3>
          <p className="text-sm text-muted-foreground">Your public listings currently visible to buyers.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
          >
            <Plus className="size-3.5" />
            Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((p) => {
          const img = primaryImage(p);
          return (
            <article
              key={p.id}
              className="group overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative aspect-4/3 bg-muted">
                {img ? <Image src={img} alt={p.name} fill className="object-cover" sizes="320px" unoptimized /> : null}
                <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-medium backdrop-blur",
                      p.isActive
                        ? "border-emerald-200 bg-emerald-50/90 text-emerald-800"
                        : "border-zinc-300 bg-white/90 text-zinc-700",
                    )}
                  >
                    {p.isActive ? messages.active : messages.inactive}
                  </span>
                  <button
                    type="button"
                    onClick={() => openEditModal(p)}
                    className="inline-flex size-7 items-center justify-center rounded-full border border-border/70 bg-background/90 text-foreground/70 hover:text-foreground"
                    title={messages.editProduct}
                  >
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">{messages.editProduct}</span>
                  </button>
                </div>
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <h4 className="line-clamp-1 text-base font-semibold text-foreground">{p.name}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">Per {p.unit}</p>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-emerald-700">{formatMoneyAmount(p.basePrice, locale)}</span>
                  <div className="flex items-center gap-1.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => openEditModal(p)}
                      className="inline-flex size-8 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted"
                      title={messages.editProduct}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <ProductDeleteButton
                      productId={p.id}
                      locale={locale}
                      label={messages.deleteProduct}
                      confirmMessage={messages.confirmDeleteProduct}
                      errorMessage={messages.error}
                      iconOnly
                    />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{messages.noProducts}</p>
      ) : null}

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
                {modalMode === "create" ? messages.createProduct : messages.editProduct}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close product editor"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="max-h-[85vh] overflow-y-auto p-4 sm:max-h-[78vh] sm:p-5">
              <ProductEditorForm
                locale={locale}
                messages={messages}
                categories={categories}
                mode={modalMode}
                product={modalMode === "edit" ? editingProduct : undefined}
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
