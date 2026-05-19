import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { NormalizedMonitorItem } from "@/components/custom/monitor-types"
import { formatBytes } from "@/components/custom/monitor-utils"

type MonitorSummaryProps = {
  containersCount: number
  topCpu: NormalizedMonitorItem[]
  totalMemUsed: number
  totalMem: number
}

const MonitorSummary = ({ containersCount, topCpu, totalMemUsed, totalMem }: MonitorSummaryProps) => (
  <section className="grid gap-4 md:grid-cols-3">
    <Card>
      <CardHeader>
        <CardDescription>Contenedores activos</CardDescription>
        <CardTitle>{containersCount}</CardTitle>
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
)

export default MonitorSummary
