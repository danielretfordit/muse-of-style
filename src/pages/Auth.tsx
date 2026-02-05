import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import logoStilisti from "@/assets/logo-stilisti.png";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") === "login");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const didAutoOauthRef = useRef(false);
 
   useEffect(() => {
     const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
       if (session) {
          navigate("/app");
       }
     });
 
     supabase.auth.getSession().then(({ data: { session } }) => {
       if (session) {
          navigate("/app");
       }
     });
 
     return () => subscription.unsubscribe();
   }, [navigate]);

    // Auto-start OAuth when opened in a new tab from the editor iframe (Safari workaround)
    useEffect(() => {
      const autoOauth = searchParams.get("auto_oauth");
      if (autoOauth !== "google") return;
      if (didAutoOauthRef.current) return;
      didAutoOauthRef.current = true;

      // Defer to next tick so the click→new tab gesture is not required here.
      setTimeout(() => {
        handleGoogleSignIn();
      }, 0);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
 
   const handleEmailAuth = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsLoading(true);
 
     try {
       if (isLogin) {
         const { error } = await supabase.auth.signInWithPassword({
           email,
           password,
         });
         if (error) throw error;
         toast.success(t("auth.loginSuccess"));
       } else {
         const { error } = await supabase.auth.signUp({
           email,
           password,
           options: {
            emailRedirectTo: `${window.location.origin}/app`,
             data: {
               full_name: fullName,
             },
           },
         });
         if (error) throw error;
         toast.success(t("auth.checkEmail"));
       }
     } catch (error: any) {
       toast.error(error.message || t("auth.error"));
     } finally {
       setIsLoading(false);
     }
   };
 
  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    const isInIframe = (() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    })();

    const ua = navigator.userAgent;
    const isSafari = /Safari/i.test(ua) && !/Chrome|Chromium|Edg|OPR/i.test(ua);

    try {
      // Safari + iframe often breaks OAuth (blank popup / blocked storage in 3rd-party context).
      // Reliable workaround: open Auth in a NEW TAB (top-level context) and auto-start Google OAuth there.
      if (isInIframe && isSafari) {
        const url = new URL(`${window.location.origin}/auth`);
        url.searchParams.set("mode", "login");
        url.searchParams.set("auto_oauth", "google");

        window.open(url.toString(), "_blank", "noopener,noreferrer");
        toast.success("Открыл вход в новой вкладке");
        return;
      }

      const result = await lovable.auth.signInWithOAuth("google", {
        // Always come back to /auth so this page can finish navigation to /app
        redirect_uri: `${window.location.origin}/auth`,
        extraParams: {
          prompt: "select_account",
        },
      });

      if (result.error) throw result.error;
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      toast.error(error.message || t("auth.googleError"));
    } finally {
      setIsLoading(false);
    }
  };
 
   return (
     <div className="min-h-screen bg-background flex">
       {/* Left side - Form */}
       <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20">
         <div className="mx-auto w-full max-w-md">
           {/* Back button */}
           <button
             onClick={() => navigate("/")}
             className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
           >
             <ArrowLeft className="w-4 h-4" />
             <span className="font-body text-sm">{t("auth.backToHome")}</span>
           </button>
 
           {/* Logo */}
           <div className="flex items-center gap-2.5 mb-8">
             <img src={logoStilisti} alt="Stilisti" className="h-10 w-auto" />
             <span className="font-display text-2xl font-semibold text-foreground tracking-wide">
               Stilisti
             </span>
           </div>
 
           {/* Title */}
           <h1 className="font-display text-3xl font-semibold text-foreground mb-2">
             {isLogin ? t("auth.welcomeBack") : t("auth.createAccount")}
           </h1>
           <p className="font-body text-muted-foreground mb-8">
             {isLogin ? t("auth.loginSubtitle") : t("auth.signupSubtitle")}
           </p>
 
           {/* Google Sign In */}
           <Button
             variant="outline"
             size="lg"
             className="w-full mb-6"
             onClick={handleGoogleSignIn}
             disabled={isLoading}
           >
             <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
               <path
                 fill="currentColor"
                 d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
               />
               <path
                 fill="currentColor"
                 d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
               />
               <path
                 fill="currentColor"
                 d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
               />
               <path
                 fill="currentColor"
                 d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
               />
             </svg>
             {t("auth.continueWithGoogle")}
           </Button>
 
           <div className="relative mb-6">
             <Separator />
             <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 font-body text-sm text-muted-foreground">
               {t("auth.orContinueWith")}
             </span>
           </div>
 
           {/* Email Form */}
           <form onSubmit={handleEmailAuth} className="space-y-4">
             {!isLogin && (
               <div className="space-y-2">
                 <Label htmlFor="fullName" className="font-body text-sm">
                   {t("auth.fullName")}
                 </Label>
                 <div className="relative">
                   <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <Input
                     id="fullName"
                     type="text"
                     placeholder={t("auth.fullNamePlaceholder")}
                     value={fullName}
                     onChange={(e) => setFullName(e.target.value)}
                     className="pl-10"
                     required={!isLogin}
                   />
                 </div>
               </div>
             )}
 
             <div className="space-y-2">
               <Label htmlFor="email" className="font-body text-sm">
                 {t("auth.email")}
               </Label>
               <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                 <Input
                   id="email"
                   type="email"
                   placeholder={t("auth.emailPlaceholder")}
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="pl-10"
                   required
                 />
               </div>
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="password" className="font-body text-sm">
                 {t("auth.password")}
               </Label>
               <div className="relative">
                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                 <Input
                   id="password"
                   type={showPassword ? "text" : "password"}
                   placeholder={t("auth.passwordPlaceholder")}
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="pl-10 pr-10"
                   required
                   minLength={6}
                 />
                 <button
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                 >
                   {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                 </button>
               </div>
             </div>
 
             <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
               {isLoading
                 ? t("auth.loading")
                 : isLogin
                 ? t("auth.login")
                 : t("auth.signup")}
             </Button>
           </form>
 
           {/* Toggle */}
           <p className="mt-6 text-center font-body text-sm text-muted-foreground">
             {isLogin ? t("auth.noAccount") : t("auth.haveAccount")}{" "}
             <button
               type="button"
               onClick={() => setIsLogin(!isLogin)}
               className="text-primary hover:underline font-medium"
             >
               {isLogin ? t("auth.signup") : t("auth.login")}
             </button>
           </p>
         </div>
       </div>
 
       {/* Right side - Image */}
       <div className="hidden lg:block lg:w-1/2 relative">
         <img
           src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80"
           alt="Fashion"
           className="absolute inset-0 w-full h-full object-cover"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent" />
         <div className="absolute bottom-12 left-12 right-12 text-primary-foreground">
           <h2 className="font-display text-3xl font-semibold mb-4">
             {t("auth.sideTitle")}
           </h2>
           <p className="font-body text-primary-foreground/80">
             {t("auth.sideDescription")}
           </p>
         </div>
       </div>
     </div>
   );
 }