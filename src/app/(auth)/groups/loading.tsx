const shimmer = 'animate-shimmer rounded'

export default function GroupsLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className={`${shimmer} h-7 w-28 mb-1`} />
          <div className={`${shimmer} h-4 w-48`} />
        </div>
      </div>

      <div className="grid gap-3 grid-cols-3 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
            <div className={`${shimmer} h-4 w-16`} />
            <div className={`${shimmer} h-8 w-12`} />
          </div>
        ))}
      </div>

      <div className={`${shimmer} h-10 w-full`} />

      <div className="space-y-4">
        {[1, 2].map((course) => (
          <div key={course}>
            <div className={`${shimmer} h-5 w-36 mb-3`} />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((group) => (
                <div key={group} className="rounded-xl border bg-card p-4 space-y-3">
                  <div className={`${shimmer} h-5 w-24`} />
                  <div className={`${shimmer} h-3 w-16`} />
                  <div className="flex gap-3">
                    <div className={`${shimmer} h-3 w-12`} />
                    <div className={`${shimmer} h-3 w-16`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
