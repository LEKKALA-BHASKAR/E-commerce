import Skeleton from './Skeleton.jsx';
export default function RouteSkeleton() {
  return (
    <div className="container py-12 space-y-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-6 w-1/2" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
