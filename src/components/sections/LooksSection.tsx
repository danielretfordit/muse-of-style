import { LookCard } from "@/components/ui/look-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const looks = [
  {
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80",
    title: "Деловой шик",
    stylistName: "Анна М.",
    stylistAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    tags: ["Офис", "Классика", "Осень"],
    likes: 234
  },
  {
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&q=80",
    title: "Уютный кэжуал",
    stylistName: "Мария К.",
    stylistAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    tags: ["Кэжуал", "Уик-энд"],
    likes: 187
  },
  {
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80",
    title: "Вечерний выход",
    stylistName: "Елена В.",
    stylistAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
    tags: ["Вечер", "Элегантность"],
    likes: 312
  }
];

export function LooksSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="animate-fade-up">
            <span className="tag bg-primary/10 text-primary mb-4">Вдохновение</span>
            <h2 className="text-4xl md:text-5xl font-display font-semibold text-foreground mb-3">
              Образы дня
            </h2>
            <p className="font-body text-muted-foreground max-w-md">
              Готовые комплекты от наших AI-стилистов для любого случая
            </p>
          </div>
          
          <Button variant="ghost" className="mt-6 md:mt-0 group self-start md:self-auto">
            Смотреть все
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
        
        {/* Looks Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {looks.map((look, index) => (
            <LookCard key={index} {...look} />
          ))}
        </div>
      </div>
    </section>
  );
}