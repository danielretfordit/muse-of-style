import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Props {
  items: { id: string; name: string; price: number | null; currency: string | null; image_url: string }[];
  wearCounts: Map<string, number>;
}

export function CostPerWearTable({ items, wearCounts }: Props) {
  const { t } = useTranslation();

  const rows = items
    .filter((i) => i.price && i.price > 0)
    .map((i) => {
      const wears = wearCounts.get(i.id) || 0;
      const cpw = wears > 0 ? Math.round(i.price! / wears) : null;
      return { ...i, wears, cpw };
    })
    .sort((a, b) => {
      if (a.cpw === null) return 1;
      if (b.cpw === null) return -1;
      return a.cpw - b.cpw;
    })
    .slice(0, 15);

  if (rows.length === 0) {
    return <p className="font-body text-sm text-muted-foreground text-center py-6">{t("platform.analytics.noPriceData")}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("platform.analytics.item")}</TableHead>
            <TableHead className="text-right">{t("platform.analytics.price")}</TableHead>
            <TableHead className="text-right">{t("platform.analytics.wears")}</TableHead>
            <TableHead className="text-right">{t("platform.analytics.cpw")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-muted overflow-hidden shrink-0">
                    <img src={row.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-body text-sm truncate max-w-[150px]">{row.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-body text-sm">{row.price?.toLocaleString()} {row.currency}</TableCell>
              <TableCell className="text-right font-body text-sm">{row.wears}</TableCell>
              <TableCell className="text-right font-body text-sm font-medium">
                {row.cpw !== null ? `${row.cpw.toLocaleString()} ${row.currency}` : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
