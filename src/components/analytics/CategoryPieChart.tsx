import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useTranslation } from "react-i18next";

interface Props {
  items: { category: string }[];
}

const COLORS = [
  "hsl(220, 40%, 20%)",
  "hsl(32, 38%, 71%)",
  "hsl(43, 48%, 59%)",
  "hsl(17, 52%, 82%)",
  "hsl(97, 15%, 42%)",
  "hsl(220, 40%, 40%)",
  "hsl(32, 38%, 50%)",
];

export function CategoryPieChart({ items }: Props) {
  const { t } = useTranslation();
  const counts = new Map<string, number>();
  items.forEach((i) => counts.set(i.category, (counts.get(i.category) || 0) + 1));

  const data = Array.from(counts.entries()).map(([name, value]) => ({ name, value }));

  if (data.length === 0) {
    return <p className="font-body text-sm text-muted-foreground text-center py-8">{t("platform.analytics.noData")}</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={100} paddingAngle={2} dataKey="value">
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
