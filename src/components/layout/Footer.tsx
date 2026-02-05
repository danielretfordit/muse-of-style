import { Instagram, Send } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full border-[1.5px] border-secondary flex items-center justify-center">
                <span className="font-display text-xl font-semibold text-secondary">S</span>
              </div>
              <span className="font-display text-xl font-semibold text-background">
                Stilisti
              </span>
            </div>
            <p className="font-body text-sm text-muted-foreground max-w-sm mb-6">
              Stilisti — демократизация высокой моды через технологии искусственного интеллекта. 
              Персональный стайлинг, доступный каждому.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-card/10 flex items-center justify-center text-background hover:bg-secondary/20 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-card/10 flex items-center justify-center text-background hover:bg-secondary/20 transition-colors">
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="font-display text-lg font-semibold text-background mb-4">Продукт</h4>
            <ul className="space-y-3">
              {["Возможности", "Тарифы", "FAQ", "Блог"].map((item) => (
                <li key={item}>
                  <a href="#" className="font-body text-sm text-muted-foreground hover:text-background transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-display text-lg font-semibold text-background mb-4">Компания</h4>
            <ul className="space-y-3">
              {["О нас", "Карьера", "Контакты", "Политика конфиденциальности"].map((item) => (
                <li key={item}>
                  <a href="#" className="font-body text-sm text-muted-foreground hover:text-background transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="pt-8 border-t border-card/10">
          <p className="font-body text-sm text-muted-foreground text-center">
            © 2026 Stilisti. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}