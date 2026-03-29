import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function FarmerDashboardSection({
  id,
  icon: Icon,
  title,
  subtitle,
  action,
  children,
  className,
}: {
  id?: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24", className)}>
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
              <Icon className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">{title}</h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          {action ? <div className="shrink-0 sm:pt-0.5">{action}</div> : null}
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}
