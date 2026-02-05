import { ClothingCard } from "@/components/ui/clothing-card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight } from "lucide-react";

const clothingItems = [
  {
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80",
    brand: "Max Mara",
    name: "Кашемировый свитер оверсайз",
    price: "₽45,900"
  },
  {
    image: "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=400&q=80",
    brand: "Theory",
    name: "Шёлковая блуза с бантом",
    price: "₽28,500"
  },
  {
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80",
    brand: "Totême",
    name: "Широкие брюки из шерсти",
    price: "₽52,000"
  },
  {
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80",
    brand: "The Row",
    name: "Пальто из кашемира",
    price: "₽189,000"
  }
];

export function WardrobeSection() {
  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="animate-fade-up">
            <span className="tag bg-secondary/50 text-foreground mb-4">Коллекция</span>
            <h2 className="text-4xl md:text-5xl font-display font-semibold text-foreground mb-3">
              Ваш гардероб
            </h2>
            <p className="font-body text-muted-foreground max-w-md">
              Добавляйте вещи и создавайте идеальные комбинации с помощью AI
            </p>
          </div>
          
          <div className="flex gap-3 mt-6 md:mt-0">
            <Button variant="soft" size="sm" className="group">
              <Plus className="w-4 h-4" />
              Добавить
            </Button>
            <Button variant="ghost" size="sm" className="group">
              Весь гардероб
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
        
        {/* Clothing Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 stagger-children">
          {clothingItems.map((item, index) => (
            <ClothingCard key={index} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}