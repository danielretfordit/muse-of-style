 import { useTranslation } from "react-i18next";
 import { useNavigate, useLocation } from "react-router-dom";
 import { cn } from "@/lib/utils";
 import { useAuth } from "@/hooks/useAuth";
 import logoStilisti from "@/assets/logo-stilisti.png";
import {
  Home,
  Shirt,
  Sparkles,
  ImageIcon,
  CalendarDays,
  BarChart3,
  Settings,
  LogOut,
  User,
  ChevronLeft,
} from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { Separator } from "@/components/ui/separator";
 import { useState } from "react";
 
const navItems = [
  { key: "home", icon: Home, path: "/app" },
  { key: "wardrobe", icon: Shirt, path: "/app/wardrobe" },
  { key: "stylist", icon: Sparkles, path: "/app/stylist" },
  { key: "looks", icon: ImageIcon, path: "/app/looks" },
  { key: "calendar", icon: CalendarDays, path: "/app/calendar" },
  { key: "analytics", icon: BarChart3, path: "/app/analytics" },
];
 
 const bottomItems = [
   { key: "settings", icon: Settings, path: "/app/settings" },
 ];
 
 export function PlatformSidebar() {
   const { t } = useTranslation();
   const navigate = useNavigate();
   const location = useLocation();
   const { user, signOut } = useAuth();
   const [collapsed, setCollapsed] = useState(false);
 
   const handleSignOut = async () => {
     await signOut();
     navigate("/");
   };
 
   const userInitials = user?.user_metadata?.full_name
     ?.split(" ")
     .map((n: string) => n[0])
     .join("")
     .toUpperCase() || user?.email?.[0].toUpperCase() || "U";
 
   return (
     <aside
       className={cn(
         "h-screen bg-card border-r border-border flex flex-col transition-all duration-300",
         collapsed ? "w-20" : "w-64"
       )}
     >
       {/* Logo */}
       <div className="p-4 flex items-center justify-between">
         <div className="flex items-center gap-2.5">
           <img src={logoStilisti} alt="Stilisti" className="h-8 w-auto" />
           {!collapsed && (
             <span className="font-display text-xl font-semibold text-foreground tracking-wide">
               Stilisti
             </span>
           )}
         </div>
         <Button
           variant="ghost"
           size="icon"
           className="h-8 w-8"
           onClick={() => setCollapsed(!collapsed)}
         >
           <ChevronLeft
             className={cn(
               "w-4 h-4 transition-transform",
               collapsed && "rotate-180"
             )}
           />
         </Button>
       </div>
 
       <Separator />
 
       {/* Main Navigation */}
       <nav className="flex-1 p-3 space-y-1">
         {navItems.map((item) => {
           const isActive = location.pathname === item.path;
           return (
             <Button
               key={item.key}
               variant={isActive ? "secondary" : "ghost"}
               className={cn(
                 "w-full justify-start gap-3",
                 collapsed && "justify-center px-2"
               )}
               onClick={() => navigate(item.path)}
             >
               <item.icon className="w-5 h-5 shrink-0" />
               {!collapsed && (
                 <span className="font-body">{t(`platform.nav.${item.key}`)}</span>
               )}
             </Button>
           );
         })}
       </nav>
 
       {/* Bottom Section */}
       <div className="p-3 space-y-1">
         {bottomItems.map((item) => {
           const isActive = location.pathname === item.path;
           return (
             <Button
               key={item.key}
               variant={isActive ? "secondary" : "ghost"}
               className={cn(
                 "w-full justify-start gap-3",
                 collapsed && "justify-center px-2"
               )}
               onClick={() => navigate(item.path)}
             >
               <item.icon className="w-5 h-5 shrink-0" />
               {!collapsed && (
                 <span className="font-body">{t(`platform.nav.${item.key}`)}</span>
               )}
             </Button>
           );
         })}
 
         <Separator className="my-2" />
 
         {/* User Section */}
         <div
           className={cn(
             "flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors",
             collapsed && "justify-center"
           )}
           onClick={() => navigate("/app/profile")}
         >
           <Avatar className="h-9 w-9">
             <AvatarImage src={user?.user_metadata?.avatar_url} />
             <AvatarFallback className="bg-primary/10 text-primary font-medium">
               {userInitials}
             </AvatarFallback>
           </Avatar>
           {!collapsed && (
             <div className="flex-1 min-w-0">
               <p className="font-body text-sm font-medium text-foreground truncate">
                 {user?.user_metadata?.full_name || t("platform.nav.profile")}
               </p>
               <p className="font-body text-xs text-muted-foreground truncate">
                 {user?.email}
               </p>
             </div>
           )}
         </div>
 
         <Button
           variant="ghost"
           className={cn(
             "w-full justify-start gap-3 text-muted-foreground hover:text-destructive",
             collapsed && "justify-center px-2"
           )}
           onClick={handleSignOut}
         >
           <LogOut className="w-5 h-5 shrink-0" />
           {!collapsed && <span className="font-body">{t("platform.nav.logout")}</span>}
         </Button>
       </div>
     </aside>
   );
 }