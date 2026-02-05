import { ClothingCard } from "@/components/ui/clothing-card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const clothingData = [
  {
    key: "cashmere",
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80",
    brand: "Max Mara",
    price: "₽45,900"
  },
  {
    key: "silkBlouse",
    image: "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=400&q=80",
    brand: "Theory",
    price: "₽28,500"
  },
  {
    key: "woolPants",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80",
    brand: "Totême",
    price: "₽52,000"
  },
  {
    key: "cashmereCoat",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80",
    brand: "The Row",
    price: "₽189,000"
  }
];

export function WardrobeSection() {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="animate-fade-up">
            <span className="tag bg-secondary/50 text-foreground mb-4">{t("wardrobe.badge")}</span>
            <h2 className="text-4xl md:text-5xl font-display font-semibold text-foreground mb-3">
              {t("wardrobe.title")}
            </h2>
            <p className="font-body text-muted-foreground max-w-md">
              {t("wardrobe.description")}
            </p>
          </div>
          
          <div className="flex gap-3 mt-6 md:mt-0">
            <Button variant="soft" size="sm" className="group">
              <Plus className="w-4 h-4" />
              {t("wardrobe.add")}
            </Button>
            <Button variant="ghost" size="sm" className="group">
              {t("wardrobe.viewAll")}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
        
        {/* Clothing Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 stagger-children">
          {clothingData.map((item, index) => (
            <ClothingCard 
              key={index} 
              image={item.image}
              brand={item.brand}
              name={t(`wardrobe.items.${item.key}`)}
              price={item.price}
            />
          ))}
        </div>
      </div>
    </section>
  );
}