import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Check, Loader2, Circle, AlertCircle, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AnalysisStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'done' | 'skipped' | 'missing';
  result?: string;
}

interface AnalysisProgressProps {
  steps: AnalysisStep[];
  progress: number;
}

export function AnalysisProgress({ steps, progress }: AnalysisProgressProps) {
  const { t } = useTranslation();

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        {/* Header with animation */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            <div className="absolute inset-0 animate-ping opacity-20">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
          </div>
          <span className="font-display text-lg font-semibold">
            {t("platform.dashboard.aiStylist.analyzing")}
          </span>
        </div>

        {/* Progress bar */}
        <Progress value={progress} className="h-2 mb-4" />

        {/* Steps */}
        <div className="space-y-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-2 text-sm transition-all duration-300",
                step.status === 'processing' && "scale-[1.02]"
              )}
            >
              {/* Status icon */}
              {step.status === 'done' && (
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              )}
              {step.status === 'processing' && (
                <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />
              )}
              {step.status === 'pending' && (
                <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
              {step.status === 'missing' && (
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              )}
              {step.status === 'skipped' && (
                <Minus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}

              {/* Label */}
              <span
                className={cn(
                  "transition-colors",
                  step.status === 'processing' && "font-medium text-primary",
                  step.status === 'done' && "text-foreground",
                  step.status === 'pending' && "text-muted-foreground",
                  step.status === 'skipped' && "text-muted-foreground line-through",
                  step.status === 'missing' && "text-amber-600"
                )}
              >
                {step.label}
              </span>

              {/* Result */}
              {step.result && (
                <span className="ml-auto text-xs text-muted-foreground truncate max-w-[120px]">
                  → {step.result}
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
