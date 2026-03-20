import type { ReactNode } from "react";

export default function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="text-sm font-semibold text-neutral-50">{title}</div>
      <div className="space-y-2 text-sm">
        {children}
      </div>
    </section>
  );
}

