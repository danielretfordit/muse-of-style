 import { useTranslation } from "react-i18next";
 import { useNavigate, useLocation } from "react-router-dom";
 import { cn } from "@/lib/utils";
 import { Home, Shirt, Sparkles, ImageIcon, User } from "lucide-react";
 
 const navItems = [
   { key: "home", icon: Home, path: "/app" },
   { key: "wardrobe", icon: Shirt, path: "/app/wardrobe" },
   { key: "stylist", icon: Sparkles, path: "/app/stylist" },
   { key: "looks", icon: ImageIcon, path: "/app/looks" },
   { key: "profile", icon: User, path: "/app/profile" },
 ];
 
 export function PlatformMobileNav() {
   const { t } = useTranslation();
   const navigate = useNavigate();
   const location = useLocation();
 
   return (
     <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-50">
       <div className="flex items-center justify-around h-16 px-2">
         {navItems.map((item) => {
           const isActive = location.pathname === item.path;
           return (
             <button
               key={item.key}
               onClick={() => navigate(item.path)}
               className={cn(
                 "flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors",
                 isActive
                   ? "text-primary"
                   : "text-muted-foreground hover:text-foreground"
               )}
             >
               <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
               <span className="font-body text-xs">
                 {t(`platform.nav.${item.key}`)}
               </span>
             </button>
           );
         })}
       </div>
     </nav>
   );
 }