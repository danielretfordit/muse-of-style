import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import logoStilisti from "@/assets/logo-stilisti.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success(t("auth.resetEmailSent"));
    } catch (error: any) {
      toast.error(error.message || t("auth.error"));
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
                {t("auth.checkYourEmail")}
              </h1>
              <p className="font-body text-muted-foreground mb-8">
                {t("auth.resetEmailDescription")}
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/auth?mode=login")}
              >
                {t("auth.backToLogin")}
              </Button>
            </div>
          ) : (
            <>
              {/* Title */}
              <h1 className="font-display text-3xl font-semibold text-foreground mb-2">
                {t("auth.forgotPassword")}
              </h1>
              <p className="font-body text-muted-foreground mb-8">
                {t("auth.forgotPasswordDescription")}
              </p>

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
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

                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? t("auth.loading") : t("auth.sendResetLink")}
                </Button>
              </form>

              {/* Back to login */}
              <p className="mt-6 text-center font-body text-sm text-muted-foreground">
                {t("auth.rememberPassword")}{" "}
                <button
                  type="button"
                  onClick={() => navigate("/auth?mode=login")}
                  className="text-primary hover:underline font-medium"
                >
                  {t("auth.login")}
                </button>
              </p>
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
