import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Download, AlertCircle } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

export function BillingTab() {
  const { t } = useTranslation();
  const { currentPlan, changePlan, isChangingPlan } = useSubscription();

  // Mock billing data - will be replaced with real Stripe data
  const mockBillingData = {
    paymentMethod: "**** 4242",
    expires: "12/27",
  };

  const invoices = [
    { id: "INV-001", date: "5 февраля 2026", amount: "₽990", status: "paid" },
    { id: "INV-002", date: "5 января 2026", amount: "₽990", status: "paid" },
    { id: "INV-003", date: "5 декабря 2025", amount: "₽990", status: "paid" },
  ];

  const handleCancelSubscription = () => {
    if (currentPlan !== "free") {
      changePlan("free");
    }
  };

  return (
    <div className="space-y-6">
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
                  {t("settings.expires", "Истекает")} {mockBillingData.expires}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              {t("settings.change", "Изменить")}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            * Тестовый режим — оплата не требуется
          </p>
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
          <p className="text-xs text-muted-foreground mt-4">
            * Тестовые данные
          </p>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {currentPlan !== "free" && (
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
              <Button 
                variant="outline" 
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={handleCancelSubscription}
                disabled={isChangingPlan}
              >
                {t("settings.cancelSubscription", "Отменить")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
