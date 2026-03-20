import type { Subscription } from "../domain/schemas";

export function SubscriptionList({ subscriptions }: { subscriptions: Subscription[] }) {
  return (
    <div className="space-y-3">
      {subscriptions.map((s) => (
        <div key={s.id} className="rounded-lg border border-black/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold">Plan: {s.planId}</div>
            <div className="text-sm opacity-70 capitalize">{s.status}</div>
          </div>
          <div className="mt-2 text-sm opacity-70">
            Next delivery:{" "}
            {new Date(s.nextDeliveryDate).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" })}
          </div>
          {s.pauseUntil ? (
            <div className="mt-1 text-sm opacity-70">
              Paused until:{" "}
              {new Date(s.pauseUntil).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" })}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

