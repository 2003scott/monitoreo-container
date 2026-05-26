import { useMemo } from "react"

import MonitorCpuMemCharts from "@/components/custom/monitor-cpu-mem-charts"
import DatabaseSnapshotTable from "@/components/custom/database-snapshot-table"
import MonitorDetails from "@/components/custom/monitor-details"
import MonitorHeader from "@/components/custom/monitor-header"
import MonitorIoCharts from "@/components/custom/monitor-io-charts"
import MonitorSummary from "@/components/custom/monitor-summary"
import MonitorTopCpu from "@/components/custom/monitor-top-cpu"
import type { MonitorItem } from "@/components/custom/monitor-types"
import { normalizeMonitorItems } from "@/components/custom/monitor-utils"
import { Card } from "@/components/ui/card"

type MonitorDashboardProps = {
  items: MonitorItem[]
}

const MonitorDashboard = ({ items }: MonitorDashboardProps) => {
  const normalized = useMemo(() => normalizeMonitorItems(items), [items])
  const scopedItems = normalized

  const cpuChartData = scopedItems.map((item) => ({
    name: item.Name,
    cpu: Number(item.cpu.toFixed(2)),
  }))

  const memChartData = scopedItems.map((item) => ({
    name: item.Name,
    mem: Number(item.mem.toFixed(2)),
  }))

  const netChartData = scopedItems.map((item) => ({
    name: item.Name,
    rx: Number((item.netRxBytes / (1024 * 1024)).toFixed(2)),
    tx: Number((item.netTxBytes / (1024 * 1024)).toFixed(2)),
  }))

  const blockChartData = scopedItems.map((item) => ({
    name: item.Name,
    read: Number((item.blockReadBytes / (1024 * 1024)).toFixed(2)),
    write: Number((item.blockWriteBytes / (1024 * 1024)).toFixed(2)),
  }))

  const topCpu = [...scopedItems].sort((a, b) => b.cpu - a.cpu).slice(0, 3)
  const totalMemUsed = scopedItems.reduce((acc, item) => acc + item.memUsedBytes, 0)
  const totalMem = scopedItems.reduce((acc, item) => acc + item.memTotalBytes, 0)

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <MonitorHeader />
        <MonitorSummary
          containersCount={scopedItems.length}
          topCpu={topCpu}
          totalMemUsed={totalMemUsed}
          totalMem={totalMem}
        />
        <DatabaseSnapshotTable />
        <MonitorCpuMemCharts cpuChartData={cpuChartData} memChartData={memChartData} />
        <MonitorIoCharts netChartData={netChartData} blockChartData={blockChartData} />
        <section className="grid gap-4 lg:grid-cols-2">
          <MonitorDetails
            items={scopedItems.length ? scopedItems : normalized}
          />
          <MonitorTopCpu items={topCpu} />
        </section>
      </div>
    </div>
  )
}

export default MonitorDashboard
