import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { NormalizedMonitorItem } from "@/components/custom/monitor-types"
import { formatBytes } from "@/components/custom/monitor-utils"
import { cn } from "@/lib/utils"

type MonitorDetailsProps = {
  items: NormalizedMonitorItem[]
  selectedId?: string
  onSelect?: (id: string) => void
}

const MonitorDetails = ({ items, selectedId, onSelect }: MonitorDetailsProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Detalle por contenedor</CardTitle>
      <CardDescription>Resumen rapido de recursos clave.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid gap-3">
        {items.map((item) => (
          <button
            key={item.ID}
            type="button"
            onClick={() => onSelect?.(item.ID)}
            aria-pressed={selectedId === item.ID}
            className={cn(
              "flex flex-col gap-1 rounded-md border border-border/60 px-3 py-2 text-left transition-colors hover:border-border",
              selectedId === item.ID && "border-primary/60 bg-primary/5"
            )}
          >
            <div className="flex items-center justify-between text-sm font-medium">
              <span>{item.Name}</span>
              <span>{item.cpu.toFixed(2)}% CPU</span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>Mem: {item.mem.toFixed(2)}%</span>
              <span>
                RAM: {formatBytes(item.memUsedBytes)} / {formatBytes(item.memTotalBytes)}
              </span>
              <span>
                Net: {formatBytes(item.netRxBytes)} / {formatBytes(item.netTxBytes)}
              </span>
              <span>
                Disco: {formatBytes(item.blockReadBytes)} / {formatBytes(item.blockWriteBytes)}
              </span>
              <span>PIDs: {item.PIDs}</span>
            </div>
          </button>
        ))}
      </div>
    </CardContent>
  </Card>
)

export default MonitorDetails
