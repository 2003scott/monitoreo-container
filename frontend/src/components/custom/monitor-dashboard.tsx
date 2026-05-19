import { useEffect, useMemo, useState } from "react"

import MonitorCpuMemCharts from "@/components/custom/monitor-cpu-mem-charts"
import MonitorDetails from "@/components/custom/monitor-details"
import MonitorHeader from "@/components/custom/monitor-header"
import MonitorIoCharts from "@/components/custom/monitor-io-charts"
import MonitorSummary from "@/components/custom/monitor-summary"
import MonitorTopCpu from "@/components/custom/monitor-top-cpu"
import type { MonitorItem } from "@/components/custom/monitor-types"
import { normalizeMonitorItems } from "@/components/custom/monitor-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type MonitorDashboardProps = {
  items: MonitorItem[]
}

const MonitorDashboard = ({ items }: MonitorDashboardProps) => {
  const normalized = useMemo(() => normalizeMonitorItems(items), [items])
  const [viewMode, setViewMode] = useState<"general" | "container">("general")
  const [selectedId, setSelectedId] = useState<string>("")

  useEffect(() => {
    if (viewMode !== "container") return
    const active = normalized.find((item) => item.ID === selectedId)
    if (!active) {
      setSelectedId(normalized[0]?.ID ?? "")
    }
  }, [normalized, selectedId, viewMode])

  const activeId = viewMode === "general" ? "" : selectedId || normalized[0]?.ID || ""
  const scopedItems =
    viewMode === "general"
      ? normalized
      : normalized.filter((item) => item.ID === activeId)

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
  const selectedName = normalized.find((item) => item.ID === activeId)?.Name ?? "-"

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
        <Card>
          <CardHeader>
            <CardTitle>Vista de monitoreo</CardTitle>
            <CardDescription>
              {viewMode === "general"
                ? "Resumen general de todos los contenedores."
                : `Mostrando solo: ${selectedName}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={viewMode === "general" ? "default" : "outline"}
                onClick={() => setViewMode("general")}
              >
                Vista general
              </Button>
              <Button
                type="button"
                size="sm"
                variant={viewMode === "container" ? "default" : "outline"}
                onClick={() => setViewMode("container")}
              >
                Solo contenedor
              </Button>
            </div>
            <Select
              value={activeId}
              onValueChange={(value) => {
                setSelectedId(value)
                setViewMode("container")
              }}
            >
              <SelectTrigger size="sm" className="min-w-[12rem]">
                <SelectValue placeholder="Selecciona un contenedor" />
              </SelectTrigger>
              <SelectContent>
                {normalized.map((item) => (
                  <SelectItem key={item.ID} value={item.ID}>
                    {item.Name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        <MonitorCpuMemCharts cpuChartData={cpuChartData} memChartData={memChartData} />
        <MonitorIoCharts netChartData={netChartData} blockChartData={blockChartData} />
        <section className="grid gap-4 lg:grid-cols-2">
          <MonitorDetails
            items={scopedItems.length ? scopedItems : normalized}
            selectedId={activeId}
            onSelect={(id) => {
              setSelectedId(id)
              setViewMode("container")
            }}
          />
          <MonitorTopCpu items={topCpu} />
        </section>
      </div>
    </div>
  )
}

export default MonitorDashboard
