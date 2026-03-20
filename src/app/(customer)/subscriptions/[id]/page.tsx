import { z } from "zod";
import { redirect } from "next/navigation";
import { getMySubscriptionUseCase } from "@/features/subscriptions/application/useCases/getMySubscription";

export default async function CustomerSubscriptionDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const id = z.string().min(1).parse(params.id);

  let s: Awaited<ReturnType<typeof getMySubscriptionUseCase>>;
  try {
    s = await getMySubscriptionUseCase(id);
  } catch {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Subscription</h1>

      <div className="mt-6 space-y-2 rounded-lg border border-black/10 p-4">
        <div>
          <span className="text-sm opacity-70">Status:</span>{" "}
          <span className="font-medium">{s.status}</span>
        </div>
        <div>
          <span className="text-sm opacity-70">Plan ID:</span>{" "}
          <span className="font-medium">{s.planId}</span>
        </div>
        <div>
          <span className="text-sm opacity-70">Start:</span>{" "}
          <span className="font-medium">{new Date(s.startDate).toLocaleDateString()}</span>
        </div>
        <div>
          <span className="text-sm opacity-70">Next delivery:</span>{" "}
          <span className="font-medium">{new Date(s.nextDeliveryDate).toLocaleDateString()}</span>
        </div>
        {s.pauseUntil ? (
          <div>
            <span className="text-sm opacity-70">Paused until:</span>{" "}
            <span className="font-medium">{new Date(s.pauseUntil).toLocaleDateString()}</span>
          </div>
        ) : null}
      </div>
    </main>
  );
}

