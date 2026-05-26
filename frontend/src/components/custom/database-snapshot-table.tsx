import { useFetch } from "@/hooks/use-fetch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type DatabaseSnapshot = {
  name: "principal" | "mirror"
  status: "online" | "offline"
  registrosCount: number
  historialCount: number
  lastRegistro?: {
    id: number
    fecha: string
  } | null
  lastHistorial?: {
    id: number
    fecha: string
    contenedor: string
    activo: number
  } | null
  error?: string
}

const formatDate = (value?: string | null) => {
  if (!value) return "-"
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString()
}

const DatabaseSnapshotTable = () => {
  const { data, isLoading, error } = useFetch<DatabaseSnapshot[]>('/databases')
  const snapshots = Array.isArray(data) ? data : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de bases de datos</CardTitle>
        <CardDescription>Comparación entre la base principal y el espejo.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando estado de bases...</p>
        ) : error ? (
          <p className="text-sm text-red-500">Error cargando estado: {error.message}</p>
        ) : snapshots.length ? (
          <div className="overflow-x-auto rounded-md border border-border/60">
            <table className="w-full min-w-195 text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Base</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Registros</th>
                  <th className="px-4 py-3">Historial</th>
                  <th className="px-4 py-3">Último registro</th>
                  <th className="px-4 py-3">Último historial</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((snapshot) => (
                  <tr key={snapshot.name} className="border-t border-border/60">
                    <td className="px-4 py-3 font-medium capitalize">{snapshot.name}</td>
                    <td className="px-4 py-3">
                      <span className={snapshot.status === 'online' ? 'text-emerald-600' : 'text-red-500'}>
                        {snapshot.status === 'online' ? 'Online' : 'Offline'}
                      </span>
                      {snapshot.error ? (
                        <div className="mt-1 text-xs text-red-500">{snapshot.error}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{snapshot.registrosCount}</td>
                    <td className="px-4 py-3">{snapshot.historialCount}</td>
                    <td className="px-4 py-3">
                      {snapshot.lastRegistro ? (
                        <div>
                          <div>ID {snapshot.lastRegistro.id}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(snapshot.lastRegistro.fecha)}</div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {snapshot.lastHistorial ? (
                        <div>
                          <div>
                            ID {snapshot.lastHistorial.id} - {snapshot.lastHistorial.contenedor}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(snapshot.lastHistorial.fecha)} · {snapshot.lastHistorial.activo ? 'Activo' : 'Inactivo'}
                          </div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No hay datos de bases de datos todavía.</p>
        )}
      </CardContent>
    </Card>
  )
}

export default DatabaseSnapshotTable
