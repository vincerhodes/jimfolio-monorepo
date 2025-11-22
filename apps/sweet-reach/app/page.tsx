import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowRight, Activity, CheckSquare, TrendingUp } from 'lucide-react';
import DashboardCharts from '@/components/DashboardCharts';

// Components (Inline for speed, but usually separate)
function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4 transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-default">
      <div className={`p-3 rounded-full ${color} text-white shadow-sm`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

export default async function Dashboard() {
  // Fetch data
  const totalInsights = await prisma.insight.count();
  const actionRequired = await prisma.insight.count({ where: { type: 'ACTION' } });
  const openTasks = await prisma.tasking.count({ where: { status: 'OPEN' } });

  const recentInsights = await prisma.insight.findMany({
    take: 5,
    orderBy: { date: 'desc' },
    include: { author: true }
  });

  // Aggregations for Charts
  const insightsByTeam = await prisma.insight.groupBy({
    by: ['teamTag'],
    _count: { id: true }
  });

  const insightsByStatus = await prisma.insight.groupBy({
    by: ['status'],
    _count: { id: true }
  });

  // Timeline (approximate grouping by date)
  // SQLite doesn't support date truncation easily in Prisma groupBy, so we fetch metadata and process in JS
  const allDates = await prisma.insight.findMany({
    select: { date: true },
    where: { date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    orderBy: { date: 'asc' }
  });

  // Process timeline in JS
  const timelineMap = new Map();
  allDates.forEach((i: any) => {
    const d = i.date.toLocaleDateString();
    timelineMap.set(d, (timelineMap.get(d) || 0) + 1);
  });
  const timelineData = Array.from(timelineMap.entries()).map(([date, count]) => ({ date, count }));

  const teamData = insightsByTeam.map((i: any) => ({ name: i.teamTag, value: i._count.id }));
  const statusData = insightsByStatus.map((i: any) => ({ name: i.status, value: i._count.id }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
        <p className="text-gray-500">Welcome back, Sarah. Here's what's happening globally.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Insights"
          value={totalInsights}
          icon={Activity}
          color="bg-blue-600"
        />
        <StatCard
          title="Actions Required"
          value={actionRequired}
          icon={TrendingUp}
          color="bg-amber-500"
        />
        <StatCard
          title="Active Taskings"
          value={openTasks}
          icon={CheckSquare}
          color="bg-emerald-600"
        />
      </div>

      {/* Charts Section */}
      <DashboardCharts
        teamData={teamData}
        statusData={statusData}
        timelineData={timelineData}
      />

      {/* Recent Insights Table (Power Apps Style) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="font-semibold text-lg text-gray-800">Recent Insights</h2>
          <Link href="/insights" className="text-indigo-600 text-sm font-medium hover:underline flex items-center">
            View All <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Team</th>
                <th className="px-6 py-3">Region</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentInsights.map((insight: any) => (
                <tr key={insight.id} className="bg-white border-b hover:bg-indigo-50/50 transition-colors duration-150">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <Link href={`/insights/${insight.id}`} className="hover:text-indigo-600 transition-colors">
                      {insight.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold shadow-sm
                      ${insight.type === 'ACTION' ? 'bg-red-100 text-red-800' :
                        insight.type === 'ITN' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'}`}>
                      {insight.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">{insight.teamTag}</td>
                  <td className="px-6 py-4">{insight.country}</td>
                  <td className="px-6 py-4">{insight.date.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
