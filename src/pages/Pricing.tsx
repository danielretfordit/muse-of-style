import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Check, Sparkles, Crown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingPlan {
  id: string;
  icon: React.ReactNode;
  popular?: boolean;
}

const plans: PricingPlan[] = [
  { id: "free", icon: <Zap className="w-6 h-6" /> },
  { id: "pro", icon: <Sparkles className="w-6 h-6" />, popular: true },
  { id: "premium", icon: <Crown className="w-6 h-6" /> },
];

export default function Pricing() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getFeatures = (planId: string): string[] => {
    return t(`pricing.plans.${planId}.features`, { returnObjects: true }) as string[];
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <span className="tag bg-secondary/20 text-foreground mb-6 inline-block">
              {t("pricing.badge")}
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6">
              {t("pricing.title")}
            </h1>
            <p className="font-body text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("pricing.description")}
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 lg:gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    "relative rounded-2xl p-8 transition-all duration-300",
                    plan.popular
                      ? "bg-primary text-primary-foreground shadow-lg scale-105 lg:scale-110"
                      : "bg-card border border-border hover:shadow-lg"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full text-sm font-medium font-body">
                        {t("pricing.popular")}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        plan.popular
                          ? "bg-white/20"
                          : "bg-secondary/20"
                      )}
                    >
                      {plan.icon}
                    </div>
                    <h3 className="font-display text-2xl font-semibold">
                      {t(`pricing.plans.${plan.id}.name`)}
                    </h3>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-4xl font-bold">
                        {t(`pricing.plans.${plan.id}.price`)}
                      </span>
                      {plan.id !== "free" && (
                        <span
                          className={cn(
                            "font-body text-sm",
                            plan.popular ? "text-white/70" : "text-muted-foreground"
                          )}
                        >
                          {t("pricing.perMonth")}
                        </span>
                      )}
                    </div>
                    <p
                      className={cn(
                        "font-body text-sm mt-2",
                        plan.popular ? "text-white/70" : "text-muted-foreground"
                      )}
                    >
                      {t(`pricing.plans.${plan.id}.description`)}
                    </p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {getFeatures(plan.id).map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check
                          className={cn(
                            "w-5 h-5 flex-shrink-0 mt-0.5",
                            plan.popular ? "text-secondary" : "text-primary"
                          )}
                        />
                        <span className="font-body text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => navigate("/auth")}
                    className={cn(
                      "w-full",
                      plan.popular
                        ? "bg-white text-primary hover:bg-white/90"
                        : ""
                    )}
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                  >
                    {t(`pricing.plans.${plan.id}.cta`)}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-semibold text-center mb-12">
              {t("pricing.faq.title")}
            </h2>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="font-display text-lg font-medium mb-2">
                    {t(`pricing.faq.q${i}`)}
                  </h3>
                  <p className="font-body text-muted-foreground">
                    {t(`pricing.faq.a${i}`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
