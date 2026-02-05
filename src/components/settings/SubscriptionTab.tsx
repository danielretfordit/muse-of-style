import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Check, Sparkles, Crown, Zap, Calendar, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscription, PlanType } from "@/hooks/useSubscription";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const planIcons: Record<PlanType, React.ReactNode> = {
  free: <Zap className="w-5 h-5" />,
  pro: <Sparkles className="w-5 h-5" />,
  premium: <Crown className="w-5 h-5" />,
};

const planOrder: PlanType[] = ["free", "pro", "premium"];

export function SubscriptionTab() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { 
    currentPlan, 
    currentLimits, 
    planLimits, 
    isLoading, 
    changePlan, 
    isChangingPlan 
  } = useSubscription();

  // Get usage stats
  const { data: usage } = useQuery({
    queryKey: ["usage", user?.id],
    queryFn: async () => {
      if (!user?.id) return { wardrobe: 0, looks: 0 };

      const [wardrobeRes, looksRes] = await Promise.all([
        supabase
          .from("wardrobe_items")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("looks")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

      return {
        wardrobe: wardrobeRes.count || 0,
        looks: looksRes.count || 0,
      };
    },
    enabled: !!user?.id,
  });

  const getFeatures = (planId: string): string[] => {
    return t(`pricing.plans.${planId}.features`, { returnObjects: true }) as string[];
  };

  const getPlanChangeType = (targetPlan: PlanType): "upgrade" | "downgrade" | "current" => {
    if (targetPlan === currentPlan) return "current";
    const currentIndex = planOrder.indexOf(currentPlan);
    const targetIndex = planOrder.indexOf(targetPlan);
    return targetIndex > currentIndex ? "upgrade" : "downgrade";
  };

  const handlePlanChange = (plan: PlanType) => {
    if (plan === currentPlan) return;
    changePlan(plan);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Загрузка...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const wardrobeUsage = currentLimits.wardrobe_limit === -1 
    ? 0 
    : ((usage?.wardrobe || 0) / currentLimits.wardrobe_limit) * 100;
  
  const looksUsage = currentLimits.looks_limit === -1 
    ? 0 
    : ((usage?.looks || 0) / currentLimits.looks_limit) * 100;

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-display text-lg">
                {t("settings.currentPlan", "Текущий тариф")}
              </CardTitle>
              <CardDescription>
                {t("settings.managePlan", "Управляйте вашей подпиской")}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm px-3 py-1 gap-1.5">
              {planIcons[currentPlan]}
              {t(`pricing.plans.${currentPlan}.name`)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Usage Stats */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("settings.usage.wardrobe", "Вещей в гардеробе")}
                </span>
                <span className="font-medium">
                  {usage?.wardrobe || 0} / {currentLimits.wardrobe_limit === -1 ? "∞" : currentLimits.wardrobe_limit}
                </span>
              </div>
              <Progress value={wardrobeUsage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("settings.usage.looks", "Созданных образов")}
                </span>
                <span className="font-medium">
                  {usage?.looks || 0} / {currentLimits.looks_limit === -1 ? "∞" : currentLimits.looks_limit}
                </span>
              </div>
              <Progress value={looksUsage} className="h-2" />
            </div>
          </div>

          <Separator />

          {/* Features of current plan */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Возможности вашего тарифа:
            </h4>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm">
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center",
                  currentLimits.ai_stylist_enabled ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {currentLimits.ai_stylist_enabled ? <Check className="w-3 h-3" /> : "−"}
                </div>
                <span>ИИ-стилист</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center",
                  currentLimits.priority_support ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {currentLimits.priority_support ? <Check className="w-3 h-3" /> : "−"}
                </div>
                <span>Приоритетная поддержка</span>
              </div>
            </div>
          </div>

          {currentPlan !== "free" && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/30 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-body text-sm font-medium">
                      Тестовый режим
                    </p>
                    <p className="font-body text-sm text-muted-foreground">
                      Оплата не требуется
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Plans Comparison */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-semibold">
          {t("settings.changePlan", "Сменить тариф")}
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {planOrder.map((planId) => {
            const isCurrentPlan = planId === currentPlan;
            const changeType = getPlanChangeType(planId);
            const limits = planLimits?.find((l) => l.plan === planId);
            const isPopular = planId === "pro";

            return (
              <Card
                key={planId}
                className={cn(
                  "relative transition-all duration-200",
                  isPopular && "border-primary shadow-md",
                  isCurrentPlan && "ring-2 ring-primary"
                )}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      {t("pricing.popular")}
                    </Badge>
                  </div>
                )}
                <CardHeader className="pt-6 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      isPopular ? "bg-primary/10 text-primary" : "bg-secondary/30"
                    )}>
                      {planIcons[planId]}
                    </div>
                    <CardTitle className="font-display text-lg">
                      {t(`pricing.plans.${planId}.name`)}
                    </CardTitle>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-2xl font-bold">
                      {t(`pricing.plans.${planId}.price`)}
                    </span>
                    {planId !== "free" && (
                      <span className="text-sm text-muted-foreground">
                        {t("pricing.perMonth")}
                      </span>
                    )}
                  </div>
                  {/* Limits preview */}
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    <div>
                      Гардероб: {limits?.wardrobe_limit === -1 ? "∞" : limits?.wardrobe_limit} вещей
                    </div>
                    <div>
                      Образы: {limits?.looks_limit === -1 ? "∞" : limits?.looks_limit}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-6">
                  <ul className="space-y-2 mb-4">
                    {getFeatures(planId).slice(0, 4).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={isCurrentPlan ? "secondary" : isPopular ? "default" : "outline"}
                    className={cn("w-full gap-2", isCurrentPlan && "cursor-default")}
                    size="sm"
                    disabled={isCurrentPlan || isChangingPlan}
                    onClick={() => handlePlanChange(planId)}
                  >
                    {isCurrentPlan ? (
                      t("settings.currentPlanButton", "Текущий")
                    ) : changeType === "upgrade" ? (
                      <>
                        <ArrowUp className="w-4 h-4" />
                        Улучшить
                      </>
                    ) : (
                      <>
                        <ArrowDown className="w-4 h-4" />
                        Понизить
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
