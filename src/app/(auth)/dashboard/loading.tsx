import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function DashboardLoading() {
  const shimmer = 'animate-shimmer rounded'

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="space-y-1">
        <div className={`${shimmer} h-8 w-64`} />
        <div className={`${shimmer} h-4 w-48 mt-2`} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className={`${shimmer} h-4 w-20`} />
              <div className={`${shimmer} h-4 w-4`} />
            </CardHeader>
            <CardContent>
              <div className={`${shimmer} h-8 w-12`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className={`${shimmer} h-5 w-40`} />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <div className={`${shimmer} h-4 w-48`} />
                  <div className={`${shimmer} h-4 w-12`} />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className={`${shimmer} h-5 w-40`} />
            </CardHeader>
            <CardContent>
              <div className={`${shimmer} h-48 w-full`} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
