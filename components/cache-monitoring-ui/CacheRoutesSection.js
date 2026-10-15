import { Search } from "lucide-react";
import ProgressBar from "@/components/ui/ProgressBar";
import { count, percent, bypasses } from "./cacheMetricsFormatting";

function RateCell({ row }) {
  if (!row.lookups) return <span className="text-foreground-subtle">—</span>;
  return (
    <div className="min-w-24">
      <span className="font-semibold tabular-nums text-foreground">{percent(row.hitRate)}</span>
      <ProgressBar value={row.hitRate * 100} label={`${row.route} hit rate`} size="sm" className="mt-1.5" />
    </div>
  );
}

export default function CacheRoutesSection({ routes, search, setSearch, sortBy, setSortBy }) {
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h2 className="font-semibold text-foreground">Routes using the cache</h2>
          <p className="mt-1 text-xs text-foreground-soft">Only route templates are shown; user IDs and query strings are excluded.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle" aria-hidden="true" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search routes"
            aria-label="Search cache routes"
            className="w-full rounded-md border border-input bg-card py-2 pl-9 pr-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 border-b border-border px-4 py-3 sm:px-5">
        {[["miss", "Most misses"], ["lookups", "Most lookups"], ["bypass", "Most bypasses"], ["route", "Route A–Z"]].map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={sortBy === key}
            onClick={() => setSortBy(key)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              sortBy === key ? "bg-primary text-primary-foreground" : "bg-muted text-foreground-soft hover:text-foreground"
            }`}
          >{label}</button>
        ))}
      </div>

      {routes.length === 0 ? (
        <p className="p-8 text-center text-sm text-foreground-soft">
          {search ? "No routes match your search." : "No cache activity in this period yet."}
        </p>
      ) : (
        <>
          <div className="space-y-2 p-4 md:hidden">
            {routes.map((row) => (
              <div key={row.route} className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="break-all text-sm font-semibold text-foreground">{row.route}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-foreground-soft">
                  <span>Hit rate <strong className="block text-sm text-foreground">{percent(row.hitRate)}</strong></span>
                  <span>Misses <strong className="block text-sm text-foreground">{count(row.miss)}</strong></span>
                  <span>Hits <strong className="block text-sm text-foreground">{count(row.hit)}</strong></span>
                  <span>Stores <strong className="block text-sm text-foreground">{count(row.store)}</strong></span>
                  <span>Bypasses <strong className="block text-sm text-foreground">{count(bypasses(row))}</strong></span>
                </div>
                {row.lookups > 0 && <ProgressBar value={row.hitRate * 100} label={`${row.route} hit rate`} size="sm" className="mt-3" />}
              </div>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[740px] text-left text-sm">
              <thead className="bg-muted/60 text-xs text-foreground-soft">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Route</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Hit rate</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Hits</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Misses</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Bypasses</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Stores</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((row) => (
                  <tr key={row.route} className="border-t border-border">
                    <td className="break-all px-5 py-3 font-medium text-foreground">{row.route}</td>
                    <td className="px-4 py-3"><RateCell row={row} /></td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">{count(row.hit)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">{count(row.miss)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">{count(bypasses(row))}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-foreground">{count(row.store)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
