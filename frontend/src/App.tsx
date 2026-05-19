import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useFetch } from "./hooks/use-fetch"

type MonitorItem = {
  BlockIO: string
  CPUPerc: string
  Container: string
  ID: string
  MemPerc: string
  MemUsage: string
  Name: string
  NetIO: string
  PIDs: string
}

type UsagePair = {
  usedBytes: number
  totalBytes: number
}

const parsePercent = (value?: string) => {
  if (!value) return 0
  const parsed = Number.parseFloat(value.replace("%", ""))
  return Number.isFinite(parsed) ? parsed : 0
}

const parseSizeToBytes = (value?: string) => {
  if (!value) return 0
  const match = value.trim().match(/^([\d.]+)\s*([a-zA-Z]+)?$/)
  if (!match) return 0
  const amount = Number.parseFloat(match[1])
  if (!Number.isFinite(amount)) return 0
  const unit = (match[2] ?? "B").toUpperCase()
  const base = unit.includes("I") ? 1024 : 1000

  switch (unit) {
    case "B":
      return amount
    case "KB":
      return amount * Math.pow(base, 1)
    case "MB":
      return amount * Math.pow(base, 2)
    case "GB":
      return amount * Math.pow(base, 3)
    case "TB":
      return amount * Math.pow(base, 4)
    case "KIB":
      return amount * Math.pow(1024, 1)
    case "MIB":
      return amount * Math.pow(1024, 2)
    case "GIB":
      return amount * Math.pow(1024, 3)
    case "TIB":
      return amount * Math.pow(1024, 4)
    default:
      return amount
  }
}

const parseUsagePair = (value?: string): UsagePair => {
  if (!value) return { usedBytes: 0, totalBytes: 0 }
  const [usedPart, totalPart] = value.split("/").map((item) => item.trim())
  return {
    usedBytes: parseSizeToBytes(usedPart),
    totalBytes: parseSizeToBytes(totalPart),
  }
}

const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B"
  const base = 1024
  const units = ["B", "KB", "MB", "GB", "TB"]
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(base)), units.length - 1)
  const value = bytes / Math.pow(base, exponent)
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 2)} ${units[exponent]}`
}

function App() {
  const { data, isLoading, error } = useFetch<MonitorItem[]>("/monitor")
  const containers = Array.isArray(data) ? data : []

  const normalized = containers.map((item) => {
    const memUsage = parseUsagePair(item.MemUsage)
    const netUsage = parseUsagePair(item.NetIO)
    const blockUsage = parseUsagePair(item.BlockIO)

    return {
      ...item,
      cpu: parsePercent(item.CPUPerc),
      mem: parsePercent(item.MemPerc),
      memUsedBytes: memUsage.usedBytes,
      memTotalBytes: memUsage.totalBytes,
      netRxBytes: netUsage.usedBytes,
      netTxBytes: netUsage.totalBytes,
      blockReadBytes: blockUsage.usedBytes,
      blockWriteBytes: blockUsage.totalBytes,
    }
  })

  const cpuChartData = normalized.map((item) => ({
    name: item.Name,
    cpu: Number(item.cpu.toFixed(2)),
  }))

  const memChartData = normalized.map((item) => ({
    name: item.Name,
    mem: Number(item.mem.toFixed(2)),
  }))

  const netChartData = normalized.map((item) => ({
    name: item.Name,
    rx: Number((item.netRxBytes / (1024 * 1024)).toFixed(2)),
    tx: Number((item.netTxBytes / (1024 * 1024)).toFixed(2)),
  }))

  const blockChartData = normalized.map((item) => ({
    name: item.Name,
    read: Number((item.blockReadBytes / (1024 * 1024)).toFixed(2)),
    write: Number((item.blockWriteBytes / (1024 * 1024)).toFixed(2)),
  }))

  const topCpu = [...normalized]
    .sort((a, b) => b.cpu - a.cpu)
    .slice(0, 3)

  const totalMemUsed = normalized.reduce((acc, item) => acc + item.memUsedBytes, 0)
  const totalMem = normalized.reduce((acc, item) => acc + item.memTotalBytes, 0)

  if (isLoading) {
    return <p className="p-6 text-sm">Cargando monitoreo...</p>
  }

  if (error) {
    return <p className="p-6 text-sm">Error: {error.message}</p>
  }

  if (!containers.length) {
    return <p className="p-6 text-sm">No hay datos de contenedores.</p>
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Monitor en tiempo real
          </p>
          <h1 className="text-2xl font-semibold text-foreground">
            Estado de contenedores Docker
          </h1>
          <p className="text-sm text-muted-foreground">
            CPU, memoria, red y disco por contenedor para identificar cuellos de botella.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Contenedores activos</CardDescription>
              <CardTitle>{containers.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Top CPU: {topCpu.map((item) => item.Name).join(", ")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Memoria total usada</CardDescription>
              <CardTitle>{formatBytes(totalMemUsed)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Capacidad total: {formatBytes(totalMem)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Contenedor con mas CPU</CardDescription>
              <CardTitle>
                {topCpu[0]?.Name ?? "-"} ({topCpu[0]?.cpu.toFixed(2) ?? "0.00"}%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {topCpu[0]?.ID?.slice(0, 12)}
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>CPU por contenedor (%)</CardTitle>
              <CardDescription>Detecta picos de consumo.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  cpu: { label: "CPU", color: "var(--color-chart-1)" },
                }}
              >
                <BarChart data={cpuChartData} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis width={36} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="cpu" fill="var(--color-cpu)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Memoria por contenedor (%)</CardTitle>
              <CardDescription>Uso relativo de RAM.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  mem: { label: "Memoria", color: "var(--color-chart-2)" },
                }}
              >
                <BarChart data={memChartData} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis width={36} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="mem" fill="var(--color-mem)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Red (MB)</CardTitle>
              <CardDescription>Entrada vs salida por contenedor.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  rx: { label: "Recibido", color: "var(--color-chart-3)" },
                  tx: { label: "Enviado", color: "var(--color-chart-4)" },
                }}
              >
                <ResponsiveContainer>
                  <BarChart data={netChartData} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis width={40} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="rx" fill="var(--color-rx)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="tx" fill="var(--color-tx)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disco (MB)</CardTitle>
              <CardDescription>Lecturas y escrituras por contenedor.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  read: { label: "Lectura", color: "var(--color-chart-5)" },
                  write: { label: "Escritura", color: "var(--color-chart-1)" },
                }}
              >
                <ResponsiveContainer>
                  <BarChart data={blockChartData} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis width={40} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="read" fill="var(--color-read)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="write" fill="var(--color-write)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Detalle por contenedor</CardTitle>
              <CardDescription>Resumen rapido de recursos clave.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {normalized.map((item) => (
                  <div
                    key={item.ID}
                    className="flex flex-col gap-1 rounded-md border border-border/60 px-3 py-2"
                  >
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>{item.Name}</span>
                      <span>{item.cpu.toFixed(2)}% CPU</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>Mem: {item.mem.toFixed(2)}%</span>
                      <span>RAM: {formatBytes(item.memUsedBytes)} / {formatBytes(item.memTotalBytes)}</span>
                      <span>Net: {formatBytes(item.netRxBytes)} / {formatBytes(item.netTxBytes)}</span>
                      <span>Disco: {formatBytes(item.blockReadBytes)} / {formatBytes(item.blockWriteBytes)}</span>
                      <span>PIDs: {item.PIDs}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top CPU</CardTitle>
              <CardDescription>Ranking por consumo instantaneo.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {topCpu.map((item, index) => (
                  <div
                    key={item.ID}
                    className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        #{index + 1} {item.Name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.ID.slice(0, 12)} · {item.Container.slice(0, 12)}
                      </p>
                    </div>
                    <div className="text-right text-sm font-semibold">
                      {item.cpu.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

export default App
