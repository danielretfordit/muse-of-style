import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIBadgeProps {
  text?: string;
  className?: string;
}

export function AIBadge({ text = "Подобрано для вас", className }: AIBadgeProps) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-gold/20 to-secondary/30 border border-gold/30",
      className
    )}>
      <Sparkles className="w-3.5 h-3.5 text-gold animate-sparkle" />
      <span className="font-body text-xs font-medium text-foreground">
        {text}
      </span>
    </div>
  );
}