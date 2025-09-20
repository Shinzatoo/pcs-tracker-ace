import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LucideIcon, Package, AlertCircle, Search, RefreshCw } from "lucide-react";

const emptyStateVariants = cva(
  "flex flex-col items-center justify-center text-center p-8 space-y-4",
  {
    variants: {
      variant: {
        default: "text-muted-foreground",
        error: "text-destructive",
        search: "text-muted-foreground",
        loading: "text-muted-foreground",
      },
      size: {
        default: "min-h-[200px]",
        sm: "min-h-[150px] p-6",
        lg: "min-h-[300px] p-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  loading?: boolean;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, variant, size, icon, title, description, action, loading = false, ...props }, ref) => {
    // Auto-select icon based on variant if not provided
    const Icon = icon || (() => {
      switch (variant) {
        case 'error':
          return AlertCircle;
        case 'search':
          return Search;
        case 'loading':
          return RefreshCw;
        default:
          return Package;
      }
    })();

    return (
      <div
        className={cn(emptyStateVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        <div className={cn(
          "rounded-full p-4 mb-2",
          variant === "error" && "bg-destructive/10 text-destructive",
          variant === "search" && "bg-muted text-muted-foreground",
          variant === "loading" && "bg-primary/10 text-primary",
          variant === "default" && "bg-muted text-muted-foreground"
        )}>
          <Icon 
            className={cn(
              "h-8 w-8",
              loading && "animate-spin"
            )} 
          />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {title}
          </h3>
          {description && (
            <p className="text-sm max-w-sm mx-auto leading-relaxed">
              {description}
            </p>
          )}
        </div>
        
        {action && (
          <Button
            onClick={action.onClick}
            variant={variant === "error" ? "destructive" : "default"}
            className="mt-4"
          >
            {action.label}
          </Button>
        )}
      </div>
    );
  }
);
EmptyState.displayName = "EmptyState";

export { EmptyState, emptyStateVariants };