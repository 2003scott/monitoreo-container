import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { NormalizedMonitorItem } from "@/components/custom/monitor-types"
import { formatBytes } from "@/components/custom/monitor-utils"
import { cn } from "@/lib/utils"
import { http } from "@/service"

type MonitorDetailsProps = {
  items: NormalizedMonitorItem[]
  selectedId?: string
  onSelect?: (id: string) => void
}

// TU LISTA MAESTRA DE CONTENEDORES
const ALL_CONTAINERS = [
  'mysql', 
  'mysql_mirror', 
  'frontend', 
  'backend', 
  'passbolt_app', 
  'passbolt_db', 
  'monitoring'
];

const MonitorDetails = ({ items, selectedId, onSelect }: MonitorDetailsProps) => {
  const [loadingContainer, setLoadingContainer] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Función para encender/apagar
  const handleToggle = async (e: React.MouseEvent, containerName: string, isRunning: boolean) => {
    e.stopPropagation(); // Evita que al hacer clic en el botón se seleccione toda la tarjeta
    setLoadingContainer(containerName);
    const action = isRunning ? 'stop' : 'start';
    
    try {
      await http.post(`/containers/${containerName}/${action}`);
      await queryClient.invalidateQueries({ queryKey: ["/monitor"] });
    } catch (error) {
      console.error(`Error ejecutando ${action} en ${containerName}:`, error);
    } finally {
      setTimeout(() => setLoadingContainer(null), 2000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalle por contenedor</CardTitle>
        <CardDescription>Control individual y resumen de recursos.</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid gap-3">
          {/* AHORA ITERAMOS SOBRE TODOS TUS CONTENEDORES, NO SOLO LOS ACTIVOS */}
          {ALL_CONTAINERS.map((containerName) => {
            // Buscamos si el contenedor actual está entregando métricas (está encendido)
            const activeItem = items.find(item => item.Name === containerName);
            const isRunning = !!activeItem; // true si lo encontró, false si está apagado

            return (
              <div
                key={containerName}
                onClick={() => isRunning && activeItem && onSelect?.(activeItem.ID)}
                className={cn(
                  "flex flex-col gap-2 rounded-md border border-border/60 px-3 py-3 transition-colors",
                  isRunning ? "hover:border-border cursor-pointer bg-card" : "bg-muted/30 opacity-80", // Opaco si está apagado
                  selectedId === activeItem?.ID && "border-primary/60 bg-primary/5"
                )}
              >
                {/* CABECERA DE CADA TARJETA (Nombre + Métricas + Botón) */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{containerName}</span>
                  
                  <div className="flex items-center gap-4">
                    {/* Muestra CPU solo si está encendido */}
                    {isRunning && activeItem && (
                      <span className="text-sm font-medium">{activeItem.cpu.toFixed(2)}% CPU</span>
                    )}
                    
                    {/* BOTÓN INDIVIDUAL AL LADO DE CADA CONTENEDOR */}
                    <button
                      type="button"
                      onClick={(e) => handleToggle(e, containerName, isRunning)}
                      disabled={loadingContainer === containerName}
                      className={cn(
                        "px-3 py-1 text-xs font-bold rounded-md transition-colors shadow-sm disabled:opacity-50",
                        isRunning 
                          ? "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200" 
                          : "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
                      )}
                    >
                      {loadingContainer === containerName 
                        ? "⏳..." 
                        : isRunning ? "⏹ Apagar" : "▶ Encender"
                      }
                    </button>
                  </div>
                </div>

                {/* DETALLES DE MÉTRICAS (Solo se muestran si está encendido) */}
                {isRunning && activeItem ? (
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                    <span>Mem: {activeItem.mem.toFixed(2)}%</span>
                    <span>RAM: {formatBytes(activeItem.memUsedBytes)} / {formatBytes(activeItem.memTotalBytes)}</span>
                    <span>Net: {formatBytes(activeItem.netRxBytes)} / {formatBytes(activeItem.netTxBytes)}</span>
                    <span>Disco: {formatBytes(activeItem.blockReadBytes)} / {formatBytes(activeItem.blockWriteBytes)}</span>
                    <span>PIDs: {activeItem.PIDs}</span>
                  </div>
                ) : (
                  <div className="text-xs text-red-500 font-medium mt-1">
                    ⚠️ Contenedor Offline
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default MonitorDetails