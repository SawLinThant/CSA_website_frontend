"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteProductAction } from "@/features/farmer/actions/productActions";
import { Button } from "@/components/ui/button";
export default function ProductDeleteButton({
  productId,
  locale,
  label,
  confirmMessage,
  errorMessage,
  iconOnly = false,
}: {
  productId: string;
  locale: string;
  label: string;
  confirmMessage: string;
  errorMessage: string;
  iconOnly?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      size={iconOnly ? "icon-lg" : "sm"}
      disabled={pending}
      title={label}
      onClick={() => {
        if (!confirm(confirmMessage)) return;
        startTransition(async () => {
          const r = await deleteProductAction(productId, locale);
          if (!r.ok) toast.error(r.error ?? errorMessage);
          else {
            toast.success("Deleted");
            router.refresh();
          }
        });
      }}
    >
      {iconOnly ? (
        <>
          <Trash2 className="size-4" />
          <span className="sr-only">{label}</span>
        </>
      ) : (
        label
      )}
    </Button>
  );
}
