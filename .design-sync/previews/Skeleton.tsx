import { Skeleton } from "vite_react_shadcn_ts";

export const ProductCardLoading = () => (
  <div className="w-[320px] rounded-lg border bg-card p-4 space-y-3">
    <Skeleton className="h-40 w-full rounded-md" />
    <Skeleton className="h-5 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="flex gap-2 pt-1">
      <Skeleton className="h-9 flex-1 rounded-md" />
      <Skeleton className="h-9 w-20 rounded-md" />
    </div>
  </div>
);

export const ListItemLoading = () => (
  <div className="flex items-center gap-3 w-[320px]">
    <Skeleton className="h-12 w-12 rounded-full" />
    <div className="space-y-2 flex-1">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  </div>
);
