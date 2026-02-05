import { Sparkles, Shirt, Camera, Calendar, Palette, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const featureKeys = [
  { key: "aiRecommendations", icon: Sparkles, color: "from-primary/20 to-primary/5" },
  { key: "smartWardrobe", icon: Shirt, color: "from-secondary/40 to-secondary/10" },
  { key: "virtualTryOn", icon: Camera, color: "from-nude/60 to-nude/20" },
  { key: "styleCalendar", icon: Calendar, color: "from-olive/30 to-olive/10" },
  { key: "colorAnalysis", icon: Palette, color: "from-gold/30 to-gold/10" },
  { key: "instantLooks", icon: Zap, color: "from-primary/15 to-secondary/20" }
];

export function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-up">
          <span className="tag bg-secondary/30 text-foreground mb-4">{t("features.badge")}</span>
          <h2 className="text-4xl md:text-5xl font-display font-semibold text-foreground mb-4">
            {t("features.title")}
          </h2>
          <p className="font-body text-muted-foreground max-w-2xl mx-auto">
            {t("features.description")}
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {featureKeys.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className={cn(
                  "group p-8 rounded-2xl bg-gradient-to-br transition-all duration-300 cursor-pointer",
                  feature.color,
                  "hover:shadow-lg hover:-translate-y-1"
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-card shadow-sm flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {t(`features.items.${feature.key}.title`)}
                </h3>
                
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {t(`features.items.${feature.key}.description`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}