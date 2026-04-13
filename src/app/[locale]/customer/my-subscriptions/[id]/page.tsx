import { z } from "zod";
import { redirect } from "next/navigation";
import { getMySubscriptionUseCase } from "@/features/subscriptions/application/useCases/getMySubscription";
import { isLocale, type Locale, withLocalePath } from "@/i18n/config";
import { isBackendRequestError } from "@/lib/server/backendClient";

export default async function CustomerMySubscriptionDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: loc, id: rawId } = await params;
  if (!isLocale(loc)) redirect("/en/customer/subscriptions");
  const locale = loc as Locale;

  const id = z.string().min(1).parse(rawId);

  let s: Awaited<ReturnType<typeof getMySubscriptionUseCase>>;
  try {
    s = await getMySubscriptionUseCase(id);
  } catch (error) {
    if (isBackendRequestError(error) && (error.status === 401 || error.status === 403)) {
      redirect(withLocalePath(locale, "/customer/login"));
    }
    throw error;
  }

  return (
    <main className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-semibold">Subscription</h1>

      <div className="mt-6 space-y-2 rounded-xl border border-black/10 p-4">
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

