const shimmer = 'animate-shimmer rounded'

export default function EditObservationLoading() {
  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className={`${shimmer} h-6 w-36`} />
        <div className={`${shimmer} h-10 w-full`} />
        <div className={`${shimmer} h-4 w-24`} />
        <div className={`${shimmer} h-24 w-full`} />
      </div>
    </div>
  )
}
