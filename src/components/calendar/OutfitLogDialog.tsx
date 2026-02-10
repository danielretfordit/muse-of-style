import { useState } from "react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import type { OutfitLog } from "@/pages/platform/Calendar";

interface OutfitLogDialogProps {
  date: Date;
  existingLog?: OutfitLog;
  wardrobeItems: { id: string; name: string; image_url: string; category: string; color: string | null }[];
  onSave: (log: { date: string; wardrobe_item_ids: string[]; occasion: string }) => void;
  onDelete: (date: string) => void;
  onClose: () => void;
}

const occasions = ["casual", "work", "evening", "sport", "vacation", "date"];

export function OutfitLogDialog({ date, existingLog, wardrobeItems, onSave, onDelete, onClose }: OutfitLogDialogProps) {
  const { t } = useTranslation();
  const dateStr = format(date, "yyyy-MM-dd");
  const [selectedItems, setSelectedItems] = useState<string[]>(existingLog?.wardrobe_item_ids || []);
  const [occasion, setOccasion] = useState(existingLog?.occasion || "casual");

  const toggleItem = (id: string) => {
    setSelectedItems((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {format(date, "d MMMM yyyy")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="font-body text-sm text-muted-foreground mb-1.5 block">
              {t("platform.calendar.occasion")}
            </label>
            <Select value={occasion} onValueChange={setOccasion}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {occasions.map((o) => (
                  <SelectItem key={o} value={o}>
                    {t(`platform.calendar.occasions.${o}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="font-body text-sm text-muted-foreground mb-1.5 block">
              {t("platform.calendar.selectItems")} ({selectedItems.length})
            </label>
            <ScrollArea className="h-60 border rounded-lg p-2">
              {wardrobeItems.length === 0 ? (
                <p className="font-body text-sm text-muted-foreground text-center py-8">
                  {t("platform.calendar.noItems")}
                </p>
              ) : (
                <div className="space-y-1">
                  {wardrobeItems.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/30 cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => toggleItem(item.id)}
                      />
                      <div className="w-8 h-8 rounded bg-muted overflow-hidden shrink-0">
                        <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-body text-sm truncate">{item.name}</p>
                        <p className="font-body text-xs text-muted-foreground">{item.category}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          {existingLog && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(dateStr)} className="mr-auto">
              <Trash2 className="w-4 h-4 mr-1" />
              {t("platform.calendar.delete")}
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            {t("platform.calendar.cancel")}
          </Button>
          <Button
            onClick={() => onSave({ date: dateStr, wardrobe_item_ids: selectedItems, occasion })}
            disabled={selectedItems.length === 0}
          >
            {t("platform.calendar.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
