export default function DashboardLoading() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 py-10 dark:bg-black sm:px-10">
      <div className="mx-auto w-full max-w-4xl animate-pulse">
        <div className="mb-8 space-y-2">
          <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-7 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            />
          ))}
        </div>

        <div className="mt-8 h-64 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" />
      </div>
    </div>
  );
}
