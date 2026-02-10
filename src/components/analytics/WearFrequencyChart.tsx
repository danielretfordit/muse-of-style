import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";

interface Props {
  items: { id: string; name: string }[];
  wearCounts: Map<string, number>;
}

export function WearFrequencyChart({ items, wearCounts }: Props) {
  const { t } = useTranslation();

  const data = items
    .map((item) => ({
      name: item.name.length > 15 ? item.name.slice(0, 15) + "…" : item.name,
      wears: wearCounts.get(item.id) || 0,
    }))
    .sort((a, b) => b.wears - a.wears)
    .slice(0, 10);

  if (data.length === 0) {
    return <p className="font-body text-sm text-muted-foreground text-center py-8">{t("platform.analytics.noData")}</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
        <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="wears" fill="hsl(220, 40%, 20%)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
