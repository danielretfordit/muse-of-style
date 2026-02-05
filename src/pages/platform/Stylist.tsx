import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Shirt, Wand2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Stylist() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
              Персональный стилист
            </h1>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Создавайте образы из вашего гардероба
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Welcome Card */}
          <Card className="mb-8">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-semibold text-foreground mb-3">
                Ваш персональный стилист
              </h2>
              <p className="font-body text-muted-foreground max-w-md mx-auto mb-6">
                Добавьте вещи в гардероб, и я помогу создать стильные образы на любой случай
              </p>
              <Button onClick={() => navigate("/app/wardrobe")} className="gap-2">
                <Shirt className="w-4 h-4" />
                Перейти в гардероб
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid gap-4">
            <Card className="border-dashed">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center shrink-0">
                  <Wand2 className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">
                    Генерация образов
                  </h3>
                  <p className="font-body text-sm text-muted-foreground">
                    Автоматический подбор сочетаний из вашего гардероба
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">
                    Рекомендации по стилю
                  </h3>
                  <p className="font-body text-sm text-muted-foreground">
                    Персональные советы на основе ваших предпочтений
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <p className="font-body text-sm text-muted-foreground text-center mt-8">
            Функционал будет доступен после добавления вещей в гардероб
          </p>
        </div>
      </main>
    </div>
  );
}
