import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        success: "border-transparent bg-status-ok text-success-foreground shadow-sm",
        pending: "border-transparent bg-status-pending text-warning-foreground shadow-sm",
        blocked: "border-transparent bg-status-blocked text-destructive-foreground shadow-sm",
        conflict: "border-transparent bg-status-conflict text-destructive-foreground shadow-sm",
        waiting: "border-transparent bg-status-waiting text-muted-foreground shadow-sm",
        secondary: "border-transparent bg-secondary text-secondary-foreground shadow-sm",
        outline: "text-foreground border-border",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
      pulse: {
        true: "animate-pulse-maritime",
        false: "",
      },
      indicator: {
        true: "pl-6 relative",
        false: "",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "default",
      pulse: false,
      indicator: false,
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  status?: string;
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ className, variant, size, pulse, indicator, status, children, ...props }, ref) => {
    // Auto-detect variant from status if not provided
    const autoVariant = React.useMemo(() => {
      if (variant) return variant;
      
      if (!status) return "secondary";
      
      const statusLower = status.toLowerCase();
      if (statusLower.includes('ok') || statusLower.includes('ativo') || statusLower.includes('completo')) {
        return "success";
      }
      if (statusLower.includes('pendente') || statusLower.includes('aguardando')) {
        return "pending";
      }
      if (statusLower.includes('bloqueado') || statusLower.includes('erro') || statusLower.includes('falha')) {
        return "blocked";
      }
      if (statusLower.includes('conflito')) {
        return "conflict";
      }
      if (statusLower.includes('waiting')) {
        return "waiting";
      }
      
      return "secondary";
    }, [variant, status]);

    return (
      <div
        className={cn(
          statusBadgeVariants({ 
            variant: autoVariant, 
            size, 
            pulse, 
            indicator 
          }),
          className
        )}
        ref={ref}
        {...props}
      >
        {indicator && (
          <span className="absolute left-2 top-1/2 -translate-y-1/2">
            <span className="status-indicator">
              <span className={cn(
                "absolute inline-flex h-full w-full rounded-full opacity-75",
                autoVariant === "success" && "bg-status-ok",
                autoVariant === "pending" && "bg-status-pending",
                autoVariant === "blocked" && "bg-status-blocked",
                autoVariant === "conflict" && "bg-status-conflict",
                autoVariant === "waiting" && "bg-status-waiting",
              )} />
              <span className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                autoVariant === "success" && "bg-status-ok",
                autoVariant === "pending" && "bg-status-pending",
                autoVariant === "blocked" && "bg-status-blocked",
                autoVariant === "conflict" && "bg-status-conflict",
                autoVariant === "waiting" && "bg-status-waiting",
              )} />
            </span>
          </span>
        )}
        {children || status}
      </div>
    );
  }
);
StatusBadge.displayName = "StatusBadge";

export { StatusBadge, statusBadgeVariants };