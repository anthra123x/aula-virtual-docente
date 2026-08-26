const shimmer = 'animate-shimmer rounded'

export default function CoursesLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className={`${shimmer} h-7 w-28 mb-1`} />
          <div className={`${shimmer} h-4 w-48`} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
            <div className={`${shimmer} h-5 w-32`} />
            <div className={`${shimmer} h-3 w-full`} />
            <div className={`${shimmer} h-3 w-20`} />
          </div>
        ))}
      </div>
    </div>
  )
}
