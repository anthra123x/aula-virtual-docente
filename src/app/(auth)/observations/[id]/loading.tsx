const shimmer = 'animate-shimmer rounded'

export default function ObservationDetailLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className={`${shimmer} h-4 w-16 mb-2`} />
      <div className="flex items-start justify-between">
        <div className={`${shimmer} h-7 w-36`} />
        <div className="flex gap-2">
          <div className={`${shimmer} h-9 w-20`} />
          <div className={`${shimmer} h-9 w-28`} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 space-y-3">
          <div className={`${shimmer} h-5 w-24`} />
          <div className={`${shimmer} h-5 w-40`} />
          <div className={`${shimmer} h-4 w-36`} />
        </div>
        <div className="rounded-xl border bg-card p-6 space-y-3">
          <div className={`${shimmer} h-5 w-20`} />
          <div className={`${shimmer} h-5 w-28`} />
          <div className={`${shimmer} h-4 w-44`} />
        </div>
      </div>
      <div className="rounded-xl border bg-card p-6 space-y-3">
        <div className={`${shimmer} h-5 w-24`} />
        <div className={`${shimmer} h-24 w-full`} />
      </div>
    </div>
  )
}
