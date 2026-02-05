import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  Check, 
  Sparkles, 
  Crown, 
  Zap,
  Calendar,
  Download,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface PlanFeature {
  text: string;
  included: boolean;
}

const Settings = () => {
  const { t } = useTranslation();
  const [currentPlan] = useState<"free" | "pro" | "premium">("pro");
  
  // Mock billing data
  const mockBillingData = {
    nextBillingDate: "5 марта 2026",
    amount: "₽990",
    paymentMethod: "**** 4242",
    usage: {
      wardrobe: { used: 87, limit: 200 },
      looks: { used: 42, limit: -1 }, // -1 = unlimited
    },
  };

  const plans = [
    {
      id: "free" as const,
      icon: <Zap className="w-5 h-5" />,
      price: t("pricing.plans.free.price"),
      features: t("pricing.plans.free.features", { returnObjects: true }) as string[],
    },
    {
      id: "pro" as const,
      icon: <Sparkles className="w-5 h-5" />,
      price: t("pricing.plans.pro.price"),
      popular: true,
      features: t("pricing.plans.pro.features", { returnObjects: true }) as string[],
    },
    {
      id: "premium" as const,
      icon: <Crown className="w-5 h-5" />,
      price: t("pricing.plans.premium.price"),
      features: t("pricing.plans.premium.features", { returnObjects: true }) as string[],
    },
  ];

  const invoices = [
    { id: "INV-001", date: "5 февраля 2026", amount: "₽990", status: "paid" },
    { id: "INV-002", date: "5 января 2026", amount: "₽990", status: "paid" },
    { id: "INV-003", date: "5 декабря 2025", amount: "₽990", status: "paid" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground">
          {t("platform.nav.settings")}
        </h1>
        <p className="font-body text-sm text-muted-foreground mt-1">
          {t("settings.subtitle", "Управляйте подпиской и платёжными данными")}
        </p>
      </div>

      <Tabs defaultValue="subscription" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="subscription" className="gap-1.5 sm:gap-2 text-xs sm:text-sm py-2">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">{t("settings.tabs.subscription", "Подписка")}</span>
            <span className="xs:hidden">План</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-1.5 sm:gap-2 text-xs sm:text-sm py-2">
            <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">{t("settings.tabs.billing", "Биллинг")}</span>
            <span className="xs:hidden">Оплата</span>
          </TabsTrigger>
        </TabsList>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
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
                <Badge variant="secondary" className="text-sm px-3 py-1">
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
                      {mockBillingData.usage.wardrobe.used} / {mockBillingData.usage.wardrobe.limit}
                    </span>
                  </div>
                  <Progress 
                    value={(mockBillingData.usage.wardrobe.used / mockBillingData.usage.wardrobe.limit) * 100} 
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("settings.usage.looks", "Созданных образов")}
                    </span>
                    <span className="font-medium">
                      {mockBillingData.usage.looks.used} / ∞
                    </span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
              </div>

              <Separator />

              {/* Next Billing */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/30 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-body text-sm font-medium">
                      {t("settings.nextBilling", "Следующее списание")}
                    </p>
                    <p className="font-body text-sm text-muted-foreground">
                      {mockBillingData.nextBillingDate} • {mockBillingData.amount}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {t("settings.cancelSubscription", "Отменить")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Plans Comparison */}
          <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold">
              {t("settings.changePlan", "Сменить тариф")}
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((plan) => {
                const isCurrentPlan = plan.id === currentPlan;
                return (
                  <Card
                    key={plan.id}
                    className={cn(
                      "relative transition-all duration-200",
                      plan.popular && "border-primary shadow-md",
                      isCurrentPlan && "ring-2 ring-primary"
                    )}
                  >
                    {plan.popular && (
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
                          plan.popular ? "bg-primary/10 text-primary" : "bg-secondary/30"
                        )}>
                          {plan.icon}
                        </div>
                        <CardTitle className="font-display text-lg">
                          {t(`pricing.plans.${plan.id}.name`)}
                        </CardTitle>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-2xl font-bold">
                          {plan.price}
                        </span>
                        {plan.id !== "free" && (
                          <span className="text-sm text-muted-foreground">
                            {t("pricing.perMonth")}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-6">
                      <ul className="space-y-2 mb-4">
                        {plan.features.slice(0, 4).map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        variant={isCurrentPlan ? "secondary" : plan.popular ? "default" : "outline"}
                        className="w-full"
                        size="sm"
                        disabled={isCurrentPlan}
                      >
                        {isCurrentPlan 
                          ? t("settings.currentPlanButton", "Текущий") 
                          : t(`pricing.plans.${plan.id}.cta`)}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">
                {t("settings.paymentMethod", "Способ оплаты")}
              </CardTitle>
              <CardDescription>
                {t("settings.paymentMethodDesc", "Управляйте платёжными данными")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 rounded bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-xs font-bold">VISA</span>
                  </div>
                  <div>
                    <p className="font-body text-sm font-medium">
                      Visa •••• {mockBillingData.paymentMethod.slice(-4)}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      {t("settings.expires", "Истекает")} 12/27
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  {t("settings.change", "Изменить")}
                </Button>
              </div>
              <Button variant="outline" className="w-full sm:w-auto">
                <CreditCard className="w-4 h-4 mr-2" />
                {t("settings.addPaymentMethod", "Добавить способ оплаты")}
              </Button>
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">
                {t("settings.billingHistory", "История платежей")}
              </CardTitle>
              <CardDescription>
                {t("settings.billingHistoryDesc", "Скачайте счета за предыдущие периоды")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary/30 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-body text-sm font-medium">{invoice.id}</p>
                        <p className="font-body text-xs text-muted-foreground">{invoice.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-body text-sm font-medium">{invoice.amount}</p>
                        <Badge variant="outline" className="text-xs text-primary border-primary/20 bg-primary/5">
                          {t("settings.paid", "Оплачено")}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <CardTitle className="font-display text-lg text-destructive">
                  {t("settings.dangerZone", "Опасная зона")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-sm font-medium">
                    {t("settings.cancelSubscriptionTitle", "Отменить подписку")}
                  </p>
                  <p className="font-body text-sm text-muted-foreground">
                    {t("settings.cancelSubscriptionDesc", "Ваши данные сохранятся на бесплатном тарифе")}
                  </p>
                </div>
                <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                  {t("settings.cancelSubscription", "Отменить")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
