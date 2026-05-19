import MonitorDashboard from "@/components/custom/monitor-dashboard"
import MonitorDashboardSkeleton from "@/components/custom/monitor-dashboard-skeleton"
import type { MonitorItem } from "@/components/custom/monitor-types"
import { useFetch } from "./hooks/use-fetch"

function App() {
  const { data, isLoading, error } = useFetch<MonitorItem[]>("/monitor")
  const containers = Array.isArray(data) ? data : []

  if (isLoading) {
    return <MonitorDashboardSkeleton />
  }

  if (error) {
    return <p className="p-6 text-sm">Error: {error.message}</p>
  }

  if (!containers.length) {
    return <p className="p-6 text-sm">No hay datos de contenedores.</p>
  }

  return <MonitorDashboard items={containers} />
}

export default App
