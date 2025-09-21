import { Badge } from "@/components/ui/badge";

interface CategoriesOverviewProps {
  categories: Record<string, { count: number; vessels?: string[] }>;
  className?: string;
}

export function CategoriesOverview({ categories, className }: CategoriesOverviewProps) {
  // Sort categories by count descending
  const sortedEntries = Object.entries(categories || {})
    .sort(([, a], [, b]) => b.count - a.count);

  if (sortedEntries.length === 0) {
    return (
      <div className={className}>
        <p className="text-sm text-muted-foreground">
          Sem categorias disponíveis neste momento
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-3">
        {sortedEntries.map(([category, data]) => (
          <div key={category} className="flex items-start justify-between p-3 rounded-lg border bg-card">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{category}</span>
                <Badge variant="secondary">{data.count}</Badge>
              </div>
              {data.vessels && data.vessels.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {data.vessels.join(", ")}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}