'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface ProductivityData {
  date: string;
  productiveHours: number;
  totalHours: number;
  benchmarkAdjustment: number;
}

interface ProductivityChartProps {
  data: ProductivityData[];
  type?: 'bar' | 'line';
}

export function ProductivityChart({ data, type = 'bar' }: ProductivityChartProps) {
  const ChartComponent = type === 'line' ? LineChart : BarChart;
  const DataComponent = type === 'line' ? Line : Bar;

  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    productivityPercentage: (item.productiveHours / item.totalHours) * 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <ChartComponent data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
          }}
          formatter={(value: any, name: string) => {
            if (name === 'productiveHours' || name === 'totalHours') {
              return [`${value}h`, name === 'productiveHours' ? 'Productive' : 'Total Hours'];
            }
            if (name === 'productivityPercentage') {
              return [`${value.toFixed(0)}%`, 'Productivity'];
            }
            return [value, name];
          }}
        />
        <DataComponent
          dataKey="productiveHours"
          fill="#10b981"
          name="productiveHours"
        />
        <DataComponent
          dataKey="totalHours"
          fill="#6b7280"
          name="totalHours"
        />
      </ChartComponent>
    </ResponsiveContainer>
  );
}
