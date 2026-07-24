const shimmer = 'animate-shimmer rounded'

export default function ObservationsLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className={`${shimmer} h-7 w-36 mb-1`} />
        <div className={`${shimmer} h-4 w-56`} />
      </div>

      <div className="grid gap-3 grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
            <div className={`${shimmer} h-4 w-20`} />
            <div className={`${shimmer} h-8 w-12`} />
          </div>
        ))}
      </div>

      <div className={`${shimmer} h-10 w-full`} />

      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-6 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`${shimmer} h-4 w-32`} />
                  <div className={`${shimmer} h-5 w-24 rounded-full`} />
                </div>
                <div className={`${shimmer} h-3 w-48`} />
              </div>
              <div className="flex gap-1">
                <div className={`${shimmer} h-8 w-8 rounded-md`} />
                <div className={`${shimmer} h-8 w-8 rounded-md`} />
              </div>
            </div>
            <div className={`${shimmer} h-8 w-full`} />
          </div>
        ))}
      </div>
    </div>
  )
}
