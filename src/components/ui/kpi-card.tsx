import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

const kpiCardVariants = cva(
  "group cursor-pointer transition-all duration-300",
  {
    variants: {
      variant: {
        default: "hover:shadow-maritime",
        success: "border-status-ok/20 bg-gradient-to-br from-success/5 to-success/10 hover:shadow-lg hover:shadow-success/20",
        warning: "border-status-pending/20 bg-gradient-to-br from-warning/5 to-warning/10 hover:shadow-lg hover:shadow-warning/20",
        danger: "border-status-blocked/20 bg-gradient-to-br from-destructive/5 to-destructive/10 hover:shadow-lg hover:shadow-destructive/20",
        info: "border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-lg hover:shadow-primary/20",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface KpiCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof kpiCardVariants> {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive?: boolean;
  };
  loading?: boolean;
}

const KpiCard = React.forwardRef<HTMLDivElement, KpiCardProps>(
  ({
    className,
    variant,
    size,
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    loading = false,
    onClick,
    ...props
  }, ref) => {
    return (
      <Card
        className={cn(
          kpiCardVariants({ variant, size }),
          onClick && "cursor-pointer hover:scale-[1.02]",
          className
        )}
        onClick={onClick}
        ref={ref}
        {...props}
      >
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {title}
              </p>
              
              {loading ? (
                <div className="space-y-2">
                  <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                  {subtitle && <div className="h-4 w-16 bg-muted animate-pulse rounded" />}
                </div>
              ) : (
                <>
                  <div className="flex items-baseline space-x-2">
                    <h3 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                      {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
                    </h3>
                    {trend && (
                      <span className={cn(
                        "text-xs font-medium",
                        trend.isPositive ? "text-success" : "text-destructive"
                      )}>
                        {trend.isPositive ? '+' : ''}{trend.value}%
                      </span>
                    )}
                  </div>
                  
                  {subtitle && (
                    <p className="text-xs text-muted-foreground">
                      {subtitle}
                    </p>
                  )}
                </>
              )}
            </div>
            
            {Icon && (
              <div className={cn(
                "shrink-0 p-2.5 rounded-lg transition-all duration-300",
                variant === "success" && "bg-success/10 text-success group-hover:bg-success/20",
                variant === "warning" && "bg-warning/10 text-warning group-hover:bg-warning/20",
                variant === "danger" && "bg-destructive/10 text-destructive group-hover:bg-destructive/20",
                variant === "info" && "bg-primary/10 text-primary group-hover:bg-primary/20",
                variant === "default" && "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
              )}>
                <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);
KpiCard.displayName = "KpiCard";

export { KpiCard, kpiCardVariants };