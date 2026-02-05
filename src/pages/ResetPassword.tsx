import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import logoStilisti from "@/assets/logo-stilisti.png";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // Check if user has a valid recovery session
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true);
      } else if (session) {
        setIsValidSession(true);
      }
    });

    // Also check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsValidSession(true);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error(t("auth.passwordsDoNotMatch"));
      return;
    }

    if (password.length < 6) {
      toast.error(t("auth.passwordTooShort"));
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success(t("auth.passwordResetSuccess"));
      
      // Sign out and redirect to login after a short delay
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate("/auth?mode=login");
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || t("auth.error"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="flex items-center gap-2.5 justify-center mb-8">
            <img src={logoStilisti} alt="Stilisti" className="h-10 w-auto" />
            <span className="font-display text-2xl font-semibold text-foreground tracking-wide">
              Stilisti
            </span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-foreground mb-4">
            {t("auth.invalidResetLink")}
          </h1>
          <p className="font-body text-muted-foreground mb-6">
            {t("auth.invalidResetLinkDescription")}
          </p>
          <Button onClick={() => navigate("/forgot-password")}>
            {t("auth.requestNewLink")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* Back button */}
          <button
            onClick={() => navigate("/auth?mode=login")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-body text-sm">{t("auth.backToLogin")}</span>
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <img src={logoStilisti} alt="Stilisti" className="h-10 w-auto" />
            <span className="font-display text-2xl font-semibold text-foreground tracking-wide">
              Stilisti
            </span>
          </div>

          {isSuccess ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-display text-3xl font-semibold text-foreground mb-2">
                {t("auth.passwordUpdated")}
              </h1>
              <p className="font-body text-muted-foreground mb-8">
                {t("auth.passwordUpdatedDescription")}
              </p>
            </div>
          ) : (
            <>
              {/* Title */}
              <h1 className="font-display text-3xl font-semibold text-foreground mb-2">
                {t("auth.setNewPassword")}
              </h1>
              <p className="font-body text-muted-foreground mb-8">
                {t("auth.setNewPasswordDescription")}
              </p>

              {/* Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="font-body text-sm">
                    {t("auth.newPassword")}
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="font-body text-sm">
                    {t("auth.confirmPassword")}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t("auth.confirmPasswordPlaceholder")}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? t("auth.loading") : t("auth.resetPassword")}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80&fm=webp"
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
