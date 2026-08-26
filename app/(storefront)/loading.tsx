export default function Loading() {
  return (
    <div className="container-page py-20">
      <div className="h-4 w-32 animate-pulse rounded-[2px] bg-bone-line" />
      <div className="mt-6 h-12 w-2/3 max-w-xl animate-pulse rounded-sm bg-bone-line" />
      <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded-[2px] bg-bone-line" />
      <div className="mt-2 h-4 w-3/4 max-w-xl animate-pulse rounded-[2px] bg-bone-line" />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-80 animate-pulse rounded-sm bg-bone-line" />
        ))}
      </div>
    </div>
  );
}
