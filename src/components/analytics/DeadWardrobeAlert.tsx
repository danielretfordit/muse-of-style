import { useTranslation } from "react-i18next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface Props {
  items: { id: string; name: string; image_url: string }[];
}

export function DeadWardrobeAlert({ items }: Props) {
  const { t } = useTranslation();

  return (
    <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="font-display">{t("platform.analytics.deadWardrobe")}</AlertTitle>
      <AlertDescription>
        <p className="font-body text-sm mb-3">
          {t("platform.analytics.deadWardrobeDesc", { count: items.length })}
        </p>
        <div className="flex gap-2 flex-wrap">
          {items.slice(0, 6).map((item) => (
            <div key={item.id} className="flex items-center gap-1.5 bg-card rounded-full pl-1 pr-2.5 py-1">
              <div className="w-6 h-6 rounded-full bg-muted overflow-hidden">
                <img src={item.image_url} alt="" className="w-full h-full object-cover" />
              </div>
              <span className="font-body text-xs truncate max-w-[100px]">{item.name}</span>
            </div>
          ))}
          {items.length > 6 && (
            <span className="font-body text-xs text-muted-foreground self-center">
              +{items.length - 6}
            </span>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
