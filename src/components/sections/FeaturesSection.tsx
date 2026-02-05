import { Sparkles, Shirt, Camera, Calendar, Palette, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Sparkles,
    title: "AI-рекомендации",
    description: "Персональный подбор образов на основе вашего стиля и предпочтений",
    color: "from-primary/20 to-primary/5"
  },
  {
    icon: Shirt,
    title: "Умный гардероб",
    description: "Оцифруйте свой гардероб и создавайте бесконечные комбинации",
    color: "from-secondary/40 to-secondary/10"
  },
  {
    icon: Camera,
    title: "Виртуальная примерка",
    description: "Примеряйте вещи перед покупкой с помощью AR-технологий",
    color: "from-nude/60 to-nude/20"
  },
  {
    icon: Calendar,
    title: "Календарь стиля",
    description: "Планируйте образы заранее и никогда не повторяйтесь",
    color: "from-olive/30 to-olive/10"
  },
  {
    icon: Palette,
    title: "Анализ цветотипа",
    description: "Определите идеальные цвета для вашей внешности",
    color: "from-gold/30 to-gold/10"
  },
  {
    icon: Zap,
    title: "Мгновенные образы",
    description: "Получайте рекомендации на любой случай за секунды",
    color: "from-primary/15 to-secondary/20"
  }
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-up">
          <span className="tag bg-secondary/30 text-foreground mb-4">Возможности</span>
          <h2 className="text-4xl md:text-5xl font-display font-semibold text-foreground mb-4">
            Всё для идеального стиля
          </h2>
          <p className="font-body text-muted-foreground max-w-2xl mx-auto">
            Передовые технологии AI и ML для создания персонального гардероба вашей мечты
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {features.map((feature, index) => {
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
                  {feature.title}
                </h3>
                
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}