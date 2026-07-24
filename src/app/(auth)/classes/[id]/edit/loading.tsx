const shimmer = 'animate-shimmer rounded'

export default function EditClassLoading() {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className={`${shimmer} h-6 w-36`} />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`${shimmer} h-10 w-full`} />
          ))}
        </div>
        <div className={`${shimmer} h-10 w-full`} />
        <div className={`${shimmer} h-10 w-full`} />
        <div className="space-y-4 border rounded-lg p-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className={`${shimmer} h-4 w-24`} />
              <div className={`${shimmer} h-16 w-full`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
