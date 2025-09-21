import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, Vessel } from "@/lib/api";
import { categorizeVessels, VesselCategories } from "@/lib/categorizeVessels";

interface CategoriesOverviewProps {
  categories?: Record<string, { count: number; vessels: string[] }>;
  vessels?: Vessel[];
  alerts?: Alert[];
  className?: string;
}

export function CategoriesOverview({ categories, vessels, alerts, className }: CategoriesOverviewProps) {
  // Use provided categories or compute them from vessels and alerts
  const computedCategories = categories || 
    (vessels && alerts ? categorizeVessels(vessels, alerts) : {});
  
  // Sort categories by count descending
  const sortedCategories = Object.entries(computedCategories)
    .sort(([, a], [, b]) => b.count - a.count);

  if (sortedCategories.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Visão Geral dos Status dos Embarques</CardTitle>
          <CardDescription>
            Agregação por categoria de impedimento/estado operacional
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-6">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-success" />
            <p>KPIs indisponíveis neste snapshot</p>
            <p className="text-xs">Nenhuma categoria encontrada</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Visão Geral dos Status dos Embarques</CardTitle>
        <CardDescription>
          Agregação por categoria de impedimento/estado operacional
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">{/* Changed from grid to vertical list */}
          {sortedCategories.map(([category, data]) => {
            const isOperationNormal = category.toLowerCase().includes('operação normal') || 
                                    category.toLowerCase().includes('operacao normal');
            
            return (
              <Link 
                key={category}
                to={`/pcs?category=${encodeURIComponent(category)}`}
                className="group block"
              >
                <div className="border rounded-lg p-3 hover:bg-muted/50 transition-colors group-hover:border-primary/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{category}</h4>
                    <StatusBadge 
                      variant={isOperationNormal ? "success" : "blocked"} 
                      size="sm"
                    >
                      {data.count}
                    </StatusBadge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {data.vessels && data.vessels.length > 0 ? (
                      <div>
                        <span className="font-medium">{data.count} → </span>
                        <span className="break-words">{data.vessels.join(", ")}</span>
                      </div>
                    ) : (
                      "—"
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        
        <p className="text-xs text-muted-foreground mt-3">
          Clique em uma categoria para filtrar na lista de embarques
        </p>
      </CardContent>
    </Card>
  );
}