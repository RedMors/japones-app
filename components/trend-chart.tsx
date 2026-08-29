'use client';

import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartConfig = {
  reviews: {
    label: 'Repasos',
    color: 'var(--color-chart-1)',
  },
} satisfies ChartConfig;

export function TrendChart({ data }: { data: { date: string; reviews: number }[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[180px] w-full">
      <AreaChart data={data} margin={{ left: 0, right: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={(value: string) => value.slice(5).replace('-', '/')}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) => String(value)}
              indicator="dot"
            />
          }
        />
        <defs>
          <linearGradient id="fillReviews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-reviews)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--color-reviews)" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <Area
          dataKey="reviews"
          type="monotone"
          fill="url(#fillReviews)"
          stroke="var(--color-reviews)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
