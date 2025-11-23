'use client';

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function DashboardCharts({ teamData, typeData, timelineData, statusData, actionStatusData, taskingData }: any) {
  return (
    <div className="space-y-6">
      
      {/* First Row: Insights & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Insights by Team */}
        <div className="p-6 rounded-lg shadow-sm border transition-colors" style={{
          background: 'var(--bg-primary)',
          borderColor: 'var(--border-color)'
        }}>
          <h3 className="text-lg font-bold mb-4 transition-colors" style={{ color: 'var(--text-primary)' }}>Insights by Team</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Status Breakdown */}
        <div className="p-6 rounded-lg shadow-sm border transition-colors" style={{
          background: 'var(--bg-primary)',
          borderColor: 'var(--border-color)'
        }}>
          <h3 className="text-lg font-bold mb-4 transition-colors" style={{ color: 'var(--text-primary)' }}>Action Status Breakdown</h3>
          <div className="h-64 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={actionStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {actionStatusData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Second Row: Tasking Progress & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Tasking Completion by Team */}
        <div className="p-6 rounded-lg shadow-sm border transition-colors" style={{
          background: 'var(--bg-primary)',
          borderColor: 'var(--border-color)'
        }}>
          <h3 className="text-lg font-bold mb-4 transition-colors" style={{ color: 'var(--text-primary)' }}>Tasking Progress by Team</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskingData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insight Status Breakdown */}
        <div className="p-6 rounded-lg shadow-sm border transition-colors" style={{
          background: 'var(--bg-primary)',
          borderColor: 'var(--border-color)'
        }}>
          <h3 className="text-lg font-bold mb-4 transition-colors" style={{ color: 'var(--text-primary)' }}>Insight Status Breakdown</h3>
          <div className="h-64 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Third Row: Timeline */}
      <div className="p-6 rounded-lg shadow-sm border transition-colors" style={{
        background: 'var(--bg-primary)',
        borderColor: 'var(--border-color)'
      }}>
        <h3 className="text-lg font-bold mb-4 transition-colors" style={{ color: 'var(--text-primary)' }}>Submission Trend (Last 30 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{fontSize: 12}} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} dot={{r: 4}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
