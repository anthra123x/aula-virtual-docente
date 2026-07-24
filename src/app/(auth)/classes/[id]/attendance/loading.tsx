const shimmer = 'animate-shimmer rounded'

export default function AttendanceLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className={`${shimmer} h-7 w-40`} />
      <div className={`${shimmer} h-4 w-56`} />
      <div className={`${shimmer} h-4 w-48`} />
      <div className="rounded-xl border bg-card p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <div className={`${shimmer} h-4 w-32`} />
            <div className="flex gap-2">
              <div className={`${shimmer} h-8 w-24`} />
              <div className={`${shimmer} h-8 w-20`} />
              <div className={`${shimmer} h-8 w-20`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
