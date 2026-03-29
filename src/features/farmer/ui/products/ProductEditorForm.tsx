"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Locale } from "@/i18n/config";
import { withLocalePath } from "@/i18n/config";
import type { AppMessages } from "@/i18n/messages";
import type { Category } from "@/features/farmer/domain/schemas";
import type { Product } from "@/features/products/domain/schemas";
import {
  createProductJsonAction,
  createProductUploadAction,
  updateProductJsonAction,
  updateProductUploadAction,
} from "@/features/farmer/actions/productActions";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  locale: Locale;
  messages: AppMessages["farmer"];
  categories: Category[];
  mode: "create" | "edit";
  product?: Product;
  onDone?: () => void;
  onCancel?: () => void;
  inModal?: boolean;
};

export default function ProductEditorForm({
  locale,
  messages,
  categories,
  mode,
  product,
  onDone,
  onCancel,
  inModal = false,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const fileInput = form.elements.namedItem("images") as HTMLInputElement | null;
    const hasFiles = Boolean(fileInput?.files && fileInput.files.length > 0);

    startTransition(async () => {
      if (mode === "create") {
        if (hasFiles) {
          const r = await createProductUploadAction(locale, fd);
          if (!r.ok) {
            toast.error(r.error ?? messages.error);
            return;
          }
        } else {
          const url = String(fd.get("primaryImageUrl") ?? "").trim();
          const images =
            url !== "" ? [{ imageUrl: url, isPrimary: true as const, sortOrder: 0 }] : [];
          const price = Number(fd.get("basePrice"));
          if (!(price > 0)) {
            toast.error(messages.error);
            return;
          }
          const r = await createProductJsonAction(locale, {
            name: String(fd.get("name") ?? "").trim(),
            description: String(fd.get("description") ?? "").trim() || null,
            categoryId: String(fd.get("categoryId") ?? ""),
            unit: String(fd.get("unit") ?? "kg"),
            basePrice: price,
            images,
          });
          if (!r.ok) {
            toast.error(r.error ?? messages.error);
            return;
          }
        }
        toast.success("OK");
        if (!onDone) {
          router.push(`${withLocalePath(locale, "/farmer")}#my-products`);
        }
        router.refresh();
        onDone?.();
        return;
      }

      if (!product) return;

      if (hasFiles) {
        const r = await updateProductUploadAction(locale, product.id, fd);
        if (!r.ok) {
          toast.error(r.error ?? messages.error);
          return;
        }
      } else {
        const url = String(fd.get("primaryImageUrl") ?? "").trim();
        const images =
          url !== "" ? [{ imageUrl: url, isPrimary: true as const, sortOrder: 0 }] : undefined;
        const price = Number(fd.get("basePrice"));
        if (!(price > 0)) {
          toast.error(messages.error);
          return;
        }
        const r = await updateProductJsonAction(locale, product.id, {
          name: String(fd.get("name") ?? "").trim(),
          description: String(fd.get("description") ?? "").trim() || null,
          categoryId: String(fd.get("categoryId") ?? ""),
          unit: String(fd.get("unit") ?? "kg"),
          basePrice: price,
          isActive: fd.get("isActive") === "on",
          ...(images ? { images } : {}),
        });
        if (!r.ok) {
          toast.error(r.error ?? messages.error);
          return;
        }
      }
      toast.success("OK");
      if (!onDone) {
        router.push(`${withLocalePath(locale, "/farmer")}#my-products`);
      }
      router.refresh();
      onDone?.();
    });
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", inModal ? "w-full" : "mx-auto max-w-xl")}>
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <div className="grid gap-4">
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">{messages.productName}</span>
            <input
              name="name"
              required
              minLength={1}
              defaultValue={product?.name}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/40 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">{messages.description}</span>
            <textarea
              name="description"
              rows={3}
              defaultValue={product?.description ?? ""}
              className="mt-1 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/40 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">{messages.category}</span>
            <select
              name="categoryId"
              required
              defaultValue={product?.categoryId}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/40 focus:ring-2"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">{messages.unit}</span>
              <input
                name="unit"
                required
                defaultValue={product?.unit ?? "kg"}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/40 focus:ring-2"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">{messages.basePrice}</span>
              <input
                name="basePrice"
                type="number"
                step="0.01"
                min={0.01}
                required
                defaultValue={product?.basePrice}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/40 focus:ring-2"
              />
            </label>
          </div>
          {mode === "edit" && product ? (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked={product.isActive} />
              {messages.active}
            </label>
          ) : null}
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">{messages.imagesUpload}</span>
            <input
              name="images"
              type="file"
              accept="image/*"
              multiple
              className="mt-1 w-full text-sm file:mr-2 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground"
            />
            <p className="mt-1 text-xs text-muted-foreground">{messages.imagesHint}</p>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">{messages.primaryImageUrl}</span>
            <input
              name="primaryImageUrl"
              type="url"
              placeholder="https://"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/40 focus:ring-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">{messages.primaryImageHint}</p>
          </label>
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
              href={`${withLocalePath(locale, "/farmer")}#my-products`}
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
