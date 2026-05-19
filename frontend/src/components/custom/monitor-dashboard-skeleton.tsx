import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const MonitorDashboardSkeleton = () => (
  <div className="min-h-screen bg-background px-6 py-8">
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-7 w-72" />
        <Skeleton className="h-4 w-96" />
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={`summary-${index}`}>
            <CardHeader>
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-64" />
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-7 w-44" />
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={`cpu-mem-${index}`}>
            <CardHeader>
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={`io-${index}`}>
            <CardHeader>
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-44" />
          </CardHeader>
          <CardContent className="grid gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={`detail-${index}`} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
          </CardHeader>
          <CardContent className="grid gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={`top-${index}`} className="h-8 w-full" />
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  </div>
)

export default MonitorDashboardSkeleton
