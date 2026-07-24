const shimmer = 'animate-shimmer rounded'

export default function GroupDetailLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className={`${shimmer} h-4 w-4 rounded-full`} />
            <div className={`${shimmer} h-7 w-36`} />
          </div>
          <div className={`${shimmer} h-4 w-48 mt-1 ml-6`} />
        </div>
        <div className="flex gap-2">
          <div className={`${shimmer} h-9 w-20`} />
          <div className={`${shimmer} h-9 w-20`} />
          <div className={`${shimmer} h-9 w-24`} />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
            <div className={`${shimmer} h-4 w-20`} />
            <div className={`${shimmer} h-8 w-16`} />
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card">
        <div className="p-6 border-b">
          <div className={`${shimmer} h-5 w-40`} />
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-1">
                <div className={`${shimmer} h-4 w-36`} />
                <div className={`${shimmer} h-3 w-24`} />
              </div>
              <div className={`${shimmer} h-8 w-12`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
