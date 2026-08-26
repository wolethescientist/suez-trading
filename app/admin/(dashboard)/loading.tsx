export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-56 rounded-sm bg-bone-line" />
      <div className="mt-3 h-4 w-96 max-w-full rounded-[2px] bg-bone-line" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-sm bg-bone-line" />
        ))}
      </div>
      <div className="mt-6 h-96 rounded-sm bg-bone-line" />
    </div>
  );
}
