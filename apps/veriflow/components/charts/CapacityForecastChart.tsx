'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface CapacityData {
  date: string;
  actual?: number;
  expected: number;
  type: 'historical' | 'forecast';
}

interface CapacityForecastChartProps {
  data: CapacityData[];
}

export function CapacityForecastChart({ data }: CapacityForecastChartProps) {
  // Format dates for display
  const formattedData = data.map(item => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="displayDate" 
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
          formatter={(value: any, name: string) => {
            if (name === 'expected') return [`${value} checks`, 'Expected Capacity'];
            if (name === 'actual') return [`${value} checks`, 'Actual Capacity'];
            return [value, name];
          }}
        />
        <Area
          type="monotone"
          dataKey="expected"
          stroke="#3b82f6"
          fill="#93bbfc"
          strokeWidth={2}
          name="expected"
        />
        {data.some(d => d.actual !== undefined) && (
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981' }}
            name="actual"
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
