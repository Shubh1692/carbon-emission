import Link from "next/link";
import { OrdersApiResponse } from "@/lib/types/carbon-emission";
import { getBaseUrl } from "@/lib/utils";

type SP = { page?: string; limit?: string; projectKey?: string };
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function fmtMoney(n: number | null) {
  if (n == null) return "-";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n) + '$';
}
function fmtNum(n: number | null) {
  if (n == null) return "-";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 }).format(n);
}
function buildHref(page: number, limit: number, projectKey: string) {
  const sp = new URLSearchParams();
  sp.set("page", String(page));
  sp.set("limit", String(limit));
  if (projectKey) sp.set("projectKey", projectKey);
  return `/orders?${sp.toString()}`;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<SP> | SP;
}) {
  const sp = await searchParams;

  const page = clamp(Number(sp?.page ?? 1) || 1, 1, 1_000_000);
  const limit = clamp(Number(sp?.limit ?? 20) || 20, 5, 100);
  const projectKey = (sp?.projectKey ?? "").trim();

  const offset = (page - 1) * limit;

  const qs = new URLSearchParams();
  qs.set("limit", String(limit));
  qs.set("offset", String(offset));
  if (projectKey) qs.set("projectKey", projectKey);

  const res = await fetch(`${await getBaseUrl()}/api/orders?${qs.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-6xl p-6">
          <div className="text-xl font-bold">Orders</div>
          <div className="mt-2 text-rose-300">Failed to load orders.</div>
        </div>
      </div>
    );
  }

  const data = (await res.json()) as OrdersApiResponse;
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = clamp(page, 1, totalPages);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* helps if your global styles/layout is not dark */}
      <style>{`
        summary::-webkit-details-marker { display:none; }
        summary { list-style: none; }
      `}</style>

      <div className="mx-auto max-w-6xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold">Retirement Orders</h1>
            <p className="text-sm text-slate-300">
              Showing <span className="font-semibold text-white">{data.data.length}</span> of{" "}
              <span className="font-semibold text-white">{total}</span>
            </p>
          </div>

          {/* Filters */}
          <form className="flex gap-2" action="/orders" method="GET">
            <input type="hidden" name="limit" value={String(limit)} />
            <input
              name="projectKey"
              defaultValue={projectKey}
              placeholder="Project Key (e.g. CMARK-5)"
              className="w-64 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500">
              Apply
            </button>
          </form>
        </div>

        {/* Quick stats */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-slate-300">Project Key</div>
            <div className="mt-1 text-lg font-bold text-white">{projectKey || "All"}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-slate-300">Page</div>
            <div className="mt-1 text-lg font-bold text-white">
              {safePage} / {totalPages}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-slate-300">Per page</div>
            <div className="mt-1 text-lg font-bold text-white">{limit}</div>
          </div>
        </div>

        {/* Orders */}
        <div className="space-y-3">
          {data.data.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-200">
              No orders found.
            </div>
          ) : (
            data.data.map((r) => {
              const tonnes = r.quantity_tonnes ?? 0;
              const creditsEarned = tonnes;

              const unitPrice = Number(r.unit_price ?? 0);
              const totalCost =
                Number(r.total_cost ?? 0) ?? (unitPrice != null ? unitPrice * tonnes : null);

              const status = (r.status ?? "UNKNOWN").toUpperCase();
              const statusPill =
                status === "COMPLETE" || status === "COMPLETED" || status === "SUCCESS"
                  ? "bg-emerald-500/15 text-emerald-200 border-emerald-400/20"
                  : status === "FAILED" || status === "ERROR"
                    ? "bg-rose-500/15 text-rose-200 border-rose-400/20"
                    : "bg-amber-500/15 text-amber-200 border-amber-400/20";

              return (
                <details key={r.id} className="group rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                  <summary className="cursor-pointer p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-white font-extrabold">#{r.id}</span>
                          <span className="rounded-full bg-teal-500/15 border border-teal-400/20 px-2 py-0.5 text-xs font-bold text-teal-200">
                            {r.project_id}
                          </span>
                          <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${statusPill}`}>
                            {status}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-200">
                          <div>
                            <span className="text-slate-400">tCO₂:</span>{" "}
                            <span className="font-semibold text-white">{fmtNum(tonnes)}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Unit price:</span>{" "}
                            <span className="font-semibold text-white">
                              {unitPrice == null ? "-" : fmtMoney(unitPrice)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Total:</span>{" "}
                            <span className="font-semibold text-white">
                              {totalCost == null ? "-" : fmtMoney(totalCost)}
                            </span>
                          </div>
                        </div>

                        {r.quote_uuid && (
                          <div className="mt-1 text-xs text-slate-400 truncate max-w-[680px]">
                            Quote: <span className="text-slate-200">{r.quote_uuid}</span>
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {r.polygonscan_url ? (
                          <a
                            href={r.polygonscan_url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"

                          >
                            Polygonscan
                          </a>
                        ) : null}

                        {r.view_retirement_url ? (
                          <a
                            href={r.view_retirement_url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-500"

                          >
                            View receipt
                          </a>
                        ) : null}

                        <span className="ml-1 text-slate-400 group-open:rotate-180 transition-transform">▾</span>
                      </div>
                    </div>
                  </summary>

                  <div className="border-t border-white/10 p-4 space-y-4">
                    {/* Metrics */}
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="text-xs text-slate-400">Credits earned</div>
                        <div className="mt-1 text-xl font-extrabold text-white">{fmtNum(creditsEarned)}</div>
                        <div className="text-xs text-slate-400 mt-1">Assuming 1 credit = 1 tCO₂</div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="text-xs text-slate-400">tCO₂ purchased</div>
                        <div className="mt-1 text-xl font-extrabold text-white">{fmtNum(tonnes)}</div>
                        <div className="text-xs text-slate-400 mt-1">From quantity_tonnes</div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="text-xs text-slate-400">Cost breakdown</div>
                        <div className="mt-1 text-sm text-slate-200">
                          Unit: <span className="font-semibold text-white">{unitPrice == null ? "-" : fmtMoney(unitPrice)}</span>
                        </div>
                        <div className="mt-1 text-sm text-slate-200">
                          Total: <span className="font-semibold text-white">{totalCost == null ? "-" : fmtMoney(totalCost)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="text-xs text-slate-400">Beneficiary</div>
                        <div className="mt-1 text-sm font-semibold text-white">{r.beneficiary_name ?? "-"}</div>

                        <div className="mt-3 text-xs text-slate-400">Message</div>
                        <div className="mt-1 text-sm text-slate-200 whitespace-pre-wrap">
                          {r.retirement_message ?? "-"}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="text-xs text-slate-400">Timestamps</div>
                        <div className="mt-1 text-sm text-slate-200">
                          Created:{" "}
                          <span className="font-semibold text-white">{new Date(r.created_at).toLocaleString()}</span>
                        </div>
                        <div className="mt-1 text-sm text-slate-200">
                          Updated:{" "}
                          <span className="font-semibold text-white">{new Date(r.updated_at).toLocaleString()}</span>
                        </div>

                        <div className="mt-3 text-xs text-slate-400">Asset price source</div>
                        <div className="mt-1 text-sm text-slate-200 break-all">{r.asset_price_source_id ?? "-"}</div>
                      </div>
                    </div>

                    {/* Raw JSON */}
                    <details className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <summary className="cursor-pointer text-sm font-semibold text-white">Raw JSON (quote + order)</summary>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <pre className="rounded-xl bg-black/50 p-3 text-xs text-slate-200 overflow-auto max-h-[320px]">
                          {JSON.stringify(r.raw_quote_json ?? {}, null, 2)}
                        </pre>
                        <pre className="rounded-xl bg-black/50 p-3 text-xs text-slate-200 overflow-auto max-h-[320px]">
                          {JSON.stringify(r.raw_order_json ?? {}, null, 2)}
                        </pre>
                      </div>
                    </details>
                  </div>
                </details>
              );
            })
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="text-xs text-slate-300">
            Page <span className="font-semibold text-white">{safePage}</span> of{" "}
            <span className="font-semibold text-white">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={buildHref(safePage - 1, limit, projectKey)}
              className={`rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 ${safePage <= 1 ? "pointer-events-none opacity-50" : ""
                }`}
            >
              Prev
            </Link>

            <Link
              href={buildHref(safePage + 1, limit, projectKey)}
              className={`rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 ${safePage >= totalPages ? "pointer-events-none opacity-50" : ""
                }`}
            >
              Next
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
