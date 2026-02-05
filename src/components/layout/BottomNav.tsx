import { Home, ShoppingBag, Camera, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const navItems = [
  { icon: Home, labelKey: "home", id: "home" },
  { icon: ShoppingBag, labelKey: "wardrobe", id: "wardrobe" },
  { icon: Camera, labelKey: "aiStylist", id: "ai" },
  { icon: Calendar, labelKey: "looks", id: "looks" },
  { icon: User, labelKey: "profile", id: "profile" },
];

export function BottomNav() {
  const [active, setActive] = useState("home");
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border/50 shadow-[0_-2px_16px_rgba(60,36,21,0.08)] z-50">
      <div className="flex items-center justify-around h-20 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = active === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-16 py-2 transition-all duration-200",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Active Indicator */}
              {isActive && (
                <span className="absolute -top-0.5 w-1 h-1 rounded-full bg-primary" />
              )}
              
              <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
              <span className={cn(
                "font-body text-[10px]",
                isActive && "font-semibold"
              )}>
                {t(`bottomNav.${item.labelKey}`)}
              </span>
            </button>
          );
        })}
      </div>
      {/* Safe area padding for mobile */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
}