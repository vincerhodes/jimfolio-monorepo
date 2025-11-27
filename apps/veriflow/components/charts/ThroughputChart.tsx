'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, BarChart } from 'recharts';

interface ThroughputData {
  date: string;
  checks: number;
  benchmark: number;
}

interface ThroughputChartProps {
  data: ThroughputData[];
  type?: 'line' | 'bar';
}

export function ThroughputChart({ data, type = 'line' }: ThroughputChartProps) {
  const ChartComponent = type === 'line' ? LineChart : BarChart;
  const DataComponent = type === 'line' ? Line : Bar;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ChartComponent data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
          }}
        />
        <DataComponent
          type="monotone"
          dataKey="benchmark"
          stroke="#6b7280"
          fill="#6b7280"
          strokeWidth={2}
          name="Benchmark"
          strokeDasharray="5 5"
        />
        <DataComponent
          type="monotone"
          dataKey="checks"
          stroke="#3b82f6"
          fill="#3b82f6"
          strokeWidth={2}
          name="Actual Checks"
        />
      </ChartComponent>
    </ResponsiveContainer>
  );
}
