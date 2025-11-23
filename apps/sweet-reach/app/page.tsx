import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowRight, Activity, CheckSquare, TrendingUp, Star, MessageSquare, Target, CheckCircle2 } from 'lucide-react';
import DashboardCharts from '@/components/DashboardCharts';

// Components (Inline for speed, but usually separate)
function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="p-6 rounded-lg shadow-sm border flex items-center gap-4 transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-default" style={{
      background: 'var(--bg-primary)',
      borderColor: 'var(--border-color)'
    }}>
      <div className={`p-3 rounded-full ${color} text-white shadow-sm`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium uppercase tracking-wide transition-colors" style={{ color: 'var(--text-secondary)' }}>{title}</p>
        <p className="text-3xl font-bold transition-colors" style={{ color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </div>
  );
}

export default async function Dashboard() {
  // Fetch data
  const totalInsights = await prisma.insight.count();
  const actionRequired = await prisma.insight.count({ where: { type: 'ACTION' } });
  const openTasks = await prisma.tasking.count({ where: { status: 'OPEN' } });

  // Additional metrics for demo
  const completedActions = await prisma.action.count({ where: { status: 'COMPLETED' } });
  const inProgressActions = await prisma.action.count({ where: { status: 'IN_PROGRESS' } });
  const totalActions = await prisma.action.count();
  
  // Mock data for feedback and reviews (for demo purposes)
  const avgInsightRating = 4.2; // Mock average rating
  const totalFeedback = 47; // Mock feedback count
  const managerReviews = 23; // Mock review count

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

  // Action status breakdown for charts
  const actionStatusData = [
    { name: 'Completed', value: completedActions },
    { name: 'In Progress', value: inProgressActions },
    { name: 'Pending', value: totalActions - completedActions - inProgressActions }
  ].filter(item => item.value > 0);

  // Mock tasking completion data
  const taskingData = [
    { name: 'NPD', completed: 8, pending: 3 },
    { name: 'Marketing', completed: 5, pending: 2 },
    { name: 'Supply Chain', completed: 4, pending: 1 },
    { name: 'Sales', completed: 6, pending: 2 }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold transition-colors" style={{ color: 'var(--text-primary)' }}>Executive Dashboard</h1>
        <p className="transition-colors" style={{ color: 'var(--text-secondary)' }}>Welcome back, Sarah. Here's what's happening globally.</p>
      </div>

      {/* Stats Grid - Primary Metrics */}
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
          icon={Target}
          color="bg-emerald-600"
        />
      </div>

      {/* Secondary Metrics - Actions & Engagement */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Completed Actions"
          value={completedActions}
          icon={CheckCircle2}
          color="bg-green-600"
        />
        <StatCard
          title="In Progress"
          value={inProgressActions}
          icon={CheckSquare}
          color="bg-blue-500"
        />
        <StatCard
          title="Avg Rating"
          value={avgInsightRating.toFixed(1)}
          icon={Star}
          color="bg-yellow-500"
        />
        <StatCard
          title="Manager Reviews"
          value={managerReviews}
          icon={MessageSquare}
          color="bg-purple-600"
        />
      </div>

      {/* Charts Section */}
      <DashboardCharts
        teamData={teamData}
        statusData={statusData}
        timelineData={timelineData}
        actionStatusData={actionStatusData}
        taskingData={taskingData}
      />

      {/* Recent Insights Table (Power Apps Style) */}
      <div className="rounded-lg shadow-sm border overflow-hidden transition-colors" style={{
        background: 'var(--bg-primary)',
        borderColor: 'var(--border-color)'
      }}>
        <div className="p-4 border-b flex justify-between items-center transition-colors" style={{
          borderColor: 'var(--border-color)',
          background: 'var(--bg-secondary)'
        }}>
          <h2 className="font-semibold text-lg transition-colors" style={{ color: 'var(--text-primary)' }}>Recent Insights</h2>
          <Link href="/insights" className="text-sm font-medium hover:underline flex items-center transition-colors" style={{ color: 'var(--accent-primary)' }}>
            View All <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase transition-colors" style={{
              color: 'var(--text-secondary)',
              background: 'var(--bg-secondary)'
            }}>
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
                <tr key={insight.id} className="border-b transition-colors hover:opacity-80" style={{
                  background: 'var(--bg-primary)',
                  borderColor: 'var(--border-color)'
                }}>
                  <td className="px-6 py-4 font-medium transition-colors" style={{ color: 'var(--text-primary)' }}>
                    <Link href={`/insights/${insight.id}`} className="hover:underline transition-colors" style={{ color: 'var(--accent-primary)' }}>
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
                  <td className="px-6 py-4 transition-colors" style={{ color: 'var(--text-secondary)' }}>{insight.teamTag}</td>
                  <td className="px-6 py-4 transition-colors" style={{ color: 'var(--text-secondary)' }}>{insight.country}</td>
                  <td className="px-6 py-4 transition-colors" style={{ color: 'var(--text-secondary)' }}>{insight.date.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
