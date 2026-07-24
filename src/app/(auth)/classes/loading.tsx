const shimmer = 'animate-shimmer rounded'

export default function ClassesLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className={`${shimmer} h-7 w-24 mb-1`} />
          <div className={`${shimmer} h-4 w-48`} />
        </div>
        <div className={`${shimmer} h-9 w-28`} />
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

      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`${shimmer} h-5 w-36`} />
                  <div className={`${shimmer} h-5 w-20 rounded-full`} />
                </div>
                <div className={`${shimmer} h-3 w-56`} />
              </div>
              <div className={`${shimmer} h-3 w-16`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
