const shimmer = 'animate-shimmer rounded'

export default function ImportLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className={`${shimmer} h-4 w-20`} />
      <div className={`${shimmer} h-6 w-64`} />
      <div className="rounded-xl border bg-card p-8 space-y-4">
        <div className={`${shimmer} h-40 w-full`} />
        <div className={`${shimmer} h-10 w-32`} />
      </div>
    </div>
  )
}
