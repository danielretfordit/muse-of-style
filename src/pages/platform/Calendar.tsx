import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { OutfitLogDialog } from "@/components/calendar/OutfitLogDialog";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface OutfitLog {
  id: string;
  user_id: string;
  date: string;
  wardrobe_item_ids: string[];
  photo_url: string | null;
  occasion: string;
  weather_snapshot: any;
  from_ai_suggestion: boolean;
  created_at: string;
}

export default function Calendar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [logs, setLogs] = useState<OutfitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [wardrobeItems, setWardrobeItems] = useState<any[]>([]);

  const fetchLogs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");

    const { data, error } = await supabase
      .from("outfit_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", start)
      .lte("date", end);

    if (!error && data) setLogs(data as OutfitLog[]);
    setLoading(false);
  }, [user, currentMonth]);

  const fetchWardrobe = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("wardrobe_items")
      .select("id, name, image_url, category, color")
      .eq("user_id", user.id);
    if (data) setWardrobeItems(data);
  }, [user]);

  useEffect(() => {
    fetchLogs();
    fetchWardrobe();
  }, [fetchLogs, fetchWardrobe]);

  const handleSaveLog = async (log: { date: string; wardrobe_item_ids: string[]; occasion: string }) => {
    if (!user) return;
    const existing = logs.find((l) => l.date === log.date);

    if (existing) {
      await supabase
        .from("outfit_logs")
        .update({ wardrobe_item_ids: log.wardrobe_item_ids, occasion: log.occasion })
        .eq("id", existing.id);
    } else {
      await supabase.from("outfit_logs").insert({
        user_id: user.id,
        date: log.date,
        wardrobe_item_ids: log.wardrobe_item_ids,
        occasion: log.occasion,
      });
    }
    setSelectedDate(null);
    fetchLogs();
  };

  const handleDeleteLog = async (date: string) => {
    const existing = logs.find((l) => l.date === date);
    if (existing) {
      await supabase.from("outfit_logs").delete().eq("id", existing.id);
      setSelectedDate(null);
      fetchLogs();
    }
  };

  const prevMonth = () => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <section className="space-y-1">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
          {t("platform.calendar.title")}
        </h1>
        <p className="font-body text-muted-foreground">
          {t("platform.calendar.subtitle")}
        </p>
      </section>

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prevMonth}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="font-display text-xl font-medium capitalize">
          {format(currentMonth, "LLLL yyyy")}
        </h2>
        <Button variant="ghost" size="icon" onClick={nextMonth}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <CalendarGrid
        currentMonth={currentMonth}
        logs={logs}
        loading={loading}
        onSelectDate={(d) => setSelectedDate(d)}
      />

      {selectedDate && (
        <OutfitLogDialog
          date={selectedDate}
          existingLog={logs.find((l) => l.date === format(selectedDate, "yyyy-MM-dd"))}
          wardrobeItems={wardrobeItems}
          onSave={handleSaveLog}
          onDelete={handleDeleteLog}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
