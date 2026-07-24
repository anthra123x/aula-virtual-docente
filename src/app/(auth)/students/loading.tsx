const shimmer = 'animate-shimmer rounded'

export default function StudentsLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className={`${shimmer} h-7 w-32 mb-1`} />
        <div className={`${shimmer} h-4 w-56`} />
      </div>

      <div className="grid gap-3 grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
            <div className={`${shimmer} h-4 w-24`} />
            <div className={`${shimmer} h-8 w-12`} />
          </div>
        ))}
      </div>

      <div className={`${shimmer} h-10 w-full`} />

      {[1, 2].map((c) => (
        <div key={c} className="space-y-4">
          <div className={`${shimmer} h-5 w-36 mb-3`} />
          {[1, 2].map((g) => (
            <div key={g} className="space-y-2 ml-5">
              <div className={`${shimmer} h-4 w-24`} />
              <div className="rounded-xl border bg-card divide-y">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex items-center justify-between px-4 py-2.5">
                    <div className={`${shimmer} h-4 w-36`} />
                    <div className={`${shimmer} h-3 w-20`} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
