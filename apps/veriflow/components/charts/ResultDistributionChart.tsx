'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ResultData {
  name: string;
  value: number;
  color: string;
  [key: string]: any; // Add index signature for Recharts compatibility
}

interface ResultDistributionChartProps {
  data: Record<string, number>;
}

const resultColors = {
  GENUINE: '#107C10',
  INCONCLUSIVE: '#CA5010',
  FALSE: '#D13438',
  UNABLE_TO_VERIFY: '#605E5C',
};

export function ResultDistributionChart({ data }: ResultDistributionChartProps) {
  const chartData: ResultData[] = Object.entries(data).map(([result, count]) => ({
    name: result.charAt(0) + result.slice(1).toLowerCase().replace('_', ' '),
    value: count,
    color: resultColors[result as keyof typeof resultColors] || '#6b7280',
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No completed checks to display
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
