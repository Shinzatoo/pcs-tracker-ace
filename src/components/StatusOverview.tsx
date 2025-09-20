import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Alert } from "@/lib/api";
import { Link } from "react-router-dom";

interface StatusOverviewProps {
  alerts: Alert[];
  className?: string;
}

export function StatusOverview({ alerts, className }: StatusOverviewProps) {
  // Aggregate alerts by type
  const alertCounts = alerts.reduce((acc, alert) => {
    acc[alert.type] = (acc[alert.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = Object.values(alertCounts).reduce((sum, count) => sum + count, 0);
  
  // Sort by count descending, then by label alphabetically
  const sortedEntries = Object.entries(alertCounts)
    .sort(([aLabel, aCount], [bLabel, bCount]) => {
      if (bCount !== aCount) return bCount - aCount;
      return aLabel.localeCompare(bLabel);
    });

  if (sortedEntries.length === 0) {
    return (
      <div className={className}>
        <p className="text-sm text-muted-foreground">
          KPIs indisponíveis neste snapshot
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {sortedEntries.map(([type, count]) => {
          const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
          const displayLabel = type.replace(/([A-Z])/g, ' $1').trim();
          
          return (
            <Link
              key={type}
              to={`/pcs?alert=${encodeURIComponent(type)}`}
              className="group"
            >
              <div className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-muted/50 transition-colors group-hover:border-primary/50">
                <StatusBadge variant="blocked" size="sm">
                  {displayLabel}
                </StatusBadge>
                <div className="flex items-center space-x-1">
                  <span className="font-bold text-lg">{count}</span>
                  <span className="text-xs text-muted-foreground">
                    ({percentage}%)
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      {total > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          Total de {total} alert{total > 1 ? 's' : ''} • Clique para filtrar na lista
        </p>
      )}
    </div>
  );
}