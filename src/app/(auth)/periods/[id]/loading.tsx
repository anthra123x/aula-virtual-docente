const shimmer = 'animate-shimmer rounded'

export default function PeriodDetailLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className={`${shimmer} h-4 w-16`} />

      <div>
        <div className={`${shimmer} h-7 w-48 mb-1`} />
        <div className={`${shimmer} h-4 w-72`} />
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
            <div className={`${shimmer} h-4 w-20`} />
            <div className={`${shimmer} h-8 w-12`} />
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-6 space-y-3">
            <div className={`${shimmer} h-5 w-32`} />
            <div className={`${shimmer} h-4 w-full`} />
            <div className={`${shimmer} h-4 w-3/4`} />
          </div>
        ))}
      </div>
    </div>
  )
}
