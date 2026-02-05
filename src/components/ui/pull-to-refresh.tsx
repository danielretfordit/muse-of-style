import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshIndicatorProps {
  isRefreshing: boolean;
  pullProgress: number;
  className?: string;
}

export function PullToRefreshIndicator({
  isRefreshing,
  pullProgress,
  className,
}: PullToRefreshIndicatorProps) {
  if (pullProgress === 0 && !isRefreshing) return null;

  return (
    <div
      className={cn(
        "absolute left-1/2 -translate-x-1/2 z-50 flex items-center justify-center",
        "w-10 h-10 rounded-full bg-card shadow-lg border border-border",
        "transition-opacity duration-200",
        className
      )}
      style={{
        top: `${Math.max(8, pullProgress * 40)}px`,
        opacity: Math.min(pullProgress, 1),
      }}
    >
      <Loader2
        className={cn(
          "w-5 h-5 text-primary transition-transform",
          isRefreshing && "animate-spin"
        )}
        style={{
          transform: isRefreshing ? undefined : `rotate(${pullProgress * 360}deg)`,
        }}
      />
    </div>
  );
}
