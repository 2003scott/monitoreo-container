import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type NetChartItem = {
  name: string
  rx: number
  tx: number
}

type BlockChartItem = {
  name: string
  read: number
  write: number
}

type MonitorIoChartsProps = {
  netChartData: NetChartItem[]
  blockChartData: BlockChartItem[]
}

const MonitorIoCharts = ({ netChartData, blockChartData }: MonitorIoChartsProps) => (
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
)

export default MonitorIoCharts
