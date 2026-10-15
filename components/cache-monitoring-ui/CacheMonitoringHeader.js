import { Gauge, RefreshCw } from "lucide-react";
import PageTitle from "@/components/ui/PageTitle";
import PageManual from "@/components/ui/PageManual";

export default function CacheMonitoringHeader({ refresh, loading, autoRefresh, setAutoRefresh }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <PageTitle
        Icon={Gauge}
        title="Cache Monitoring"
        description="See how the backend cache is behaving during real traffic."
        titleAction={<PageManual page="admin-cache-monitoring" />}
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
        <button
          type="button"
          aria-pressed={autoRefresh}
          onClick={() => setAutoRefresh((enabled) => !enabled)}
          className={`rounded-md border px-4 py-2.5 text-sm font-semibold transition-colors ${
            autoRefresh
              ? "border-primary bg-primary/10 text-primary-emphasis"
              : "border-border bg-card text-foreground hover:bg-muted"
          }`}
        >
          Auto-refresh {autoRefresh ? "on · 30s" : "off"}
        </button>
      </div>
    </div>
  );
}
