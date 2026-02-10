import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WearFrequencyChart } from "@/components/analytics/WearFrequencyChart";
import { CategoryPieChart } from "@/components/analytics/CategoryPieChart";
import { CostPerWearTable } from "@/components/analytics/CostPerWearTable";
import { DeadWardrobeAlert } from "@/components/analytics/DeadWardrobeAlert";
import { DollarSign, Shirt, TrendingUp, AlertTriangle } from "lucide-react";

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color: string | null;
  price: number | null;
  currency: string | null;
  season: string | null;
  image_url: string;
  created_at: string;
}

interface OutfitLog {
  wardrobe_item_ids: string[];
  date: string;
}

export default function Analytics() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [logs, setLogs] = useState<OutfitLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [itemsRes, logsRes] = await Promise.all([
      supabase.from("wardrobe_items").select("id, name, category, color, price, currency, season, image_url, created_at").eq("user_id", user.id),
      supabase.from("outfit_logs").select("wardrobe_item_ids, date").eq("user_id", user.id),
    ]);

    if (itemsRes.data) setItems(itemsRes.data as WardrobeItem[]);
    if (logsRes.data) setLogs(logsRes.data as OutfitLog[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Compute wear counts per item
  const wearCounts = new Map<string, number>();
  logs.forEach((log) => {
    log.wardrobe_item_ids.forEach((id) => {
      wearCounts.set(id, (wearCounts.get(id) || 0) + 1);
    });
  });

  // Summary stats
  const totalValue = items.reduce((sum, i) => sum + (i.price || 0), 0);
  const totalItems = items.length;
  const totalWears = Array.from(wearCounts.values()).reduce((a, b) => a + b, 0);
  const deadItems = items.filter((i) => !wearCounts.has(i.id));

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
      <section className="space-y-1">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
          {t("platform.analytics.title")}
        </h1>
        <p className="font-body text-muted-foreground">
          {t("platform.analytics.subtitle")}
        </p>
      </section>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full"><Shirt className="w-5 h-5 text-primary" /></div>
            <div>
              <p className="font-body text-xs text-muted-foreground">{t("platform.analytics.totalItems")}</p>
              <p className="font-display text-2xl font-semibold">{totalItems}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full"><DollarSign className="w-5 h-5 text-primary" /></div>
            <div>
              <p className="font-body text-xs text-muted-foreground">{t("platform.analytics.totalValue")}</p>
              <p className="font-display text-2xl font-semibold">{totalValue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full"><TrendingUp className="w-5 h-5 text-primary" /></div>
            <div>
              <p className="font-body text-xs text-muted-foreground">{t("platform.analytics.totalWears")}</p>
              <p className="font-display text-2xl font-semibold">{totalWears}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-full"><AlertTriangle className="w-5 h-5 text-destructive" /></div>
            <div>
              <p className="font-body text-xs text-muted-foreground">{t("platform.analytics.unworn")}</p>
              <p className="font-display text-2xl font-semibold">{deadItems.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">{t("platform.analytics.wearFrequency")}</CardTitle>
          </CardHeader>
          <CardContent>
            <WearFrequencyChart items={items} wearCounts={wearCounts} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">{t("platform.analytics.categoryBalance")}</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart items={items} />
          </CardContent>
        </Card>
      </div>

      {/* Dead wardrobe alert */}
      {deadItems.length > 0 && (
        <DeadWardrobeAlert items={deadItems} />
      )}

      {/* Cost per wear */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">{t("platform.analytics.costPerWear")}</CardTitle>
        </CardHeader>
        <CardContent>
          <CostPerWearTable items={items} wearCounts={wearCounts} />
        </CardContent>
      </Card>
    </div>
  );
}
