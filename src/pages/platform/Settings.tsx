import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, CreditCard, Settings as SettingsIcon } from "lucide-react";
import { SubscriptionTab } from "@/components/settings/SubscriptionTab";
import { BillingTab } from "@/components/settings/BillingTab";
import { GeneralTab } from "@/components/settings/GeneralTab";

const Settings = () => {
  const { t } = useTranslation();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground">
          {t("platform.nav.settings")}
        </h1>
        <p className="font-body text-sm text-muted-foreground mt-1">
          {t("settings.subtitle", "Manage your subscription and preferences")}
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="general" className="gap-1.5 sm:gap-2 text-xs sm:text-sm py-2">
            <SettingsIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">{t("settings.tabs.general", "General")}</span>
            <span className="xs:hidden">{t("settings.tabs.generalShort", "General")}</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="gap-1.5 sm:gap-2 text-xs sm:text-sm py-2">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">{t("settings.tabs.subscription", "Subscription")}</span>
            <span className="xs:hidden">{t("settings.tabs.subscriptionShort", "Plan")}</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-1.5 sm:gap-2 text-xs sm:text-sm py-2">
            <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">{t("settings.tabs.billing", "Billing")}</span>
            <span className="xs:hidden">{t("settings.tabs.billingShort", "Billing")}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralTab />
        </TabsContent>

        <TabsContent value="subscription">
          <SubscriptionTab />
        </TabsContent>

        <TabsContent value="billing">
          <BillingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
