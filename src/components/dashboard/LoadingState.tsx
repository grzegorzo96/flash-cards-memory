import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function LoadingState() {
  return (
    <div className="mt-8 space-y-8">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32 shimmer" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-24 shimmer" />
          <Skeleton className="mt-2 h-4 w-64 shimmer" />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Skeleton className="h-8 w-48 shimmer" />
        {[1, 2, 3].map((i) => (
          <Card key={i} className="scale-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <CardHeader>
              <Skeleton className="h-6 w-64 shimmer" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full shimmer" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
