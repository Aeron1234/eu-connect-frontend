import CacheMonitoringDashboard from "@/components/cache-monitoring-ui/CacheMonitoringDashboard";
import { getCacheMetrics } from "@/lib/server-actions/cache-metrics-actions";

export const metadata = { title: "Cache Monitoring" };
export const dynamic = "force-dynamic";

export default async function CacheMonitoringPage() {
  const initialSnapshot = await getCacheMetrics();
  return <CacheMonitoringDashboard initialSnapshot={initialSnapshot} />;
}
