import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { OutfitLog } from "@/pages/platform/Calendar";

interface CalendarGridProps {
  currentMonth: Date;
  logs: OutfitLog[];
  loading: boolean;
  onSelectDate: (date: Date) => void;
}

export function CalendarGrid({ currentMonth, logs, loading, onSelectDate }: CalendarGridProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  const logsByDate = new Map(logs.map((l) => [l.date, l]));

  if (loading) {
    return (
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="h-16 sm:h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((d) => (
          <div key={d} className="text-center font-body text-xs text-muted-foreground py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const log = logsByDate.get(dateStr);
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(day)}
              className={cn(
                "relative h-16 sm:h-20 rounded-lg border transition-colors text-left p-1.5 sm:p-2",
                inMonth ? "bg-card hover:border-primary/50" : "bg-muted/30 text-muted-foreground",
                today && "ring-2 ring-primary/40",
                log && "border-primary/60 bg-primary/5"
              )}
            >
              <span className={cn(
                "font-body text-xs sm:text-sm",
                today && "font-semibold text-primary"
              )}>
                {format(day, "d")}
              </span>
              {log && (
                <div className="mt-0.5">
                  <div className="flex gap-0.5 flex-wrap">
                    {log.wardrobe_item_ids.slice(0, 3).map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-primary/60" />
                    ))}
                    {log.wardrobe_item_ids.length > 3 && (
                      <span className="text-[9px] text-muted-foreground">+{log.wardrobe_item_ids.length - 3}</span>
                    )}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
