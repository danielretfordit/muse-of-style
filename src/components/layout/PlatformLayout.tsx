 import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
 import { PlatformSidebar } from "./PlatformSidebar";
 import { PlatformMobileNav } from "./PlatformMobileNav";
 
 interface PlatformLayoutProps {
   children: React.ReactNode;
 }
 
 export function PlatformLayout({ children }: PlatformLayoutProps) {
   return (
     <ProtectedRoute>
       <div className="min-h-screen bg-background flex">
         {/* Desktop Sidebar */}
         <div className="hidden md:block">
           <PlatformSidebar />
         </div>
 
         {/* Main Content */}
         <main className="flex-1 overflow-auto pb-20 md:pb-0">
           {children}
         </main>
 
         {/* Mobile Bottom Navigation */}
         <div className="md:hidden">
           <PlatformMobileNav />
         </div>
       </div>
     </ProtectedRoute>
   );
 }