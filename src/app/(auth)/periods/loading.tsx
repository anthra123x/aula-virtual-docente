const shimmer = 'animate-shimmer rounded'

export default function PeriodsLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className={`${shimmer} h-7 w-36 mb-1`} />
        <div className={`${shimmer} h-4 w-56`} />
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
            <div className={`${shimmer} h-4 w-20`} />
            <div className={`${shimmer} h-8 w-16`} />
          </div>
        ))}
      </div>

      <div className={`${shimmer} h-10 w-64`} />

      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-6 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className={`${shimmer} h-5 w-40`} />
                <div className={`${shimmer} h-3 w-56`} />
              </div>
              <div className={`${shimmer} h-8 w-8 rounded-md`} />
            </div>
            <div className="flex gap-4">
              <div className={`${shimmer} h-3 w-24`} />
              <div className={`${shimmer} h-3 w-24`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
