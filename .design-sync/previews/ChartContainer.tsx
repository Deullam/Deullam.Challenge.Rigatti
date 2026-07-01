import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "vite_react_shadcn_ts";
import { Bar, BarChart, XAxis, CartesianGrid } from "recharts";

const config = {
  vendas: { label: "Vendas", color: "hsl(262 83% 58%)" },
};

const data = [
  { mes: "Jan", vendas: 1280 },
  { mes: "Fev", vendas: 1540 },
  { mes: "Mar", vendas: 1320 },
  { mes: "Abr", vendas: 1890 },
  { mes: "Mai", vendas: 2210 },
  { mes: "Jun", vendas: 2480 },
];

export const VendasMensais = () => (
  <div className="w-full max-w-[480px]">
    <ChartContainer config={config}>
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="mes" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="vendas" fill="var(--color-vendas)" radius={4} />
      </BarChart>
    </ChartContainer>
  </div>
);
