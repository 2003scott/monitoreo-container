import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type CpuChartItem = {
  name: string
  cpu: number
}

type MemChartItem = {
  name: string
  mem: number
}

type MonitorCpuMemChartsProps = {
  cpuChartData: CpuChartItem[]
  memChartData: MemChartItem[]
}

const MonitorCpuMemCharts = ({ cpuChartData, memChartData }: MonitorCpuMemChartsProps) => (
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
)

export default MonitorCpuMemCharts
