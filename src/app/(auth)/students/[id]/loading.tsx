const shimmer = 'animate-shimmer rounded'

export default function StudentDetailLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className={`${shimmer} h-4 w-16 mb-2`} />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className={`${shimmer} h-7 w-48 mb-1`} />
          <div className={`${shimmer} h-4 w-40`} />
        </div>
        <div className="flex gap-2">
          <div className={`${shimmer} h-9 w-20`} />
          <div className={`${shimmer} h-9 w-20`} />
          <div className={`${shimmer} h-9 w-28`} />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
            <div className={`${shimmer} h-4 w-24`} />
            <div className={`${shimmer} h-8 w-12`} />
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 space-y-3">
          <div className={`${shimmer} h-5 w-24`} />
          <div className={`${shimmer} h-4 w-48`} />
          <div className={`${shimmer} h-4 w-32`} />
        </div>
        <div className="rounded-xl border bg-card p-6 space-y-3">
          <div className={`${shimmer} h-5 w-36`} />
          {[1, 2, 3].map((i) => (
            <div key={i} className={`${shimmer} h-20 w-full`} />
          ))}
        </div>
      </div>
    </div>
  )
}
