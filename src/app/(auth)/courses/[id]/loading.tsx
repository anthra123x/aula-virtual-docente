const shimmer = 'animate-shimmer rounded'

export default function CourseDetailLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`${shimmer} h-5 w-5 rounded-full`} />
          <div>
            <div className={`${shimmer} h-7 w-44 mb-1`} />
            <div className={`${shimmer} h-4 w-32`} />
          </div>
        </div>
        <div className="flex gap-2">
          <div className={`${shimmer} h-9 w-20`} />
          <div className={`${shimmer} h-9 w-20`} />
          <div className={`${shimmer} h-9 w-28`} />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
            <div className={`${shimmer} h-4 w-20`} />
            <div className={`${shimmer} h-8 w-12`} />
          </div>
        ))}
      </div>

      <div className={`${shimmer} h-5 w-16 mb-3`} />
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-6 space-y-4">
            <div className="space-y-2">
              <div className={`${shimmer} h-5 w-28`} />
              <div className={`${shimmer} h-3 w-36`} />
            </div>
            <div className="space-y-1">
              <div className={`${shimmer} h-3 w-20`} />
              {[1, 2, 3].map((j) => (
                <div key={j} className={`${shimmer} h-4 w-40`} />
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <div className={`${shimmer} h-8 w-24`} />
              <div className={`${shimmer} h-8 w-20`} />
              <div className={`${shimmer} h-8 w-24 ml-auto`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
