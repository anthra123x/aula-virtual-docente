const shimmer = 'animate-shimmer rounded'

export default function SettingsLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className={`${shimmer} h-7 w-40 mb-1`} />
        <div className={`${shimmer} h-4 w-64`} />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-6 space-y-4">
            <div className={`${shimmer} h-5 w-32`} />
            <div className="space-y-3">
              <div className={`${shimmer} h-10 w-full`} />
              <div className={`${shimmer} h-10 w-full`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
