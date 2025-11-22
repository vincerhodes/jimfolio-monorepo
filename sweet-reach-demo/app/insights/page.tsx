import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Plus, Filter, Search } from 'lucide-react';

export default async function InsightsPage({ searchParams }: { searchParams: Promise<{ q?: string, team?: string }> }) {
  const { q = '', team: teamFilter = '' } = await searchParams;

  const where: any = {};
  if (q) {
    where.title = { contains: q };
  }
  if (teamFilter) {
    where.teamTag = teamFilter;
  }

  // Limit results to prevent timeout
  const insights = await prisma.insight.findMany({
    where,
    orderBy: { date: 'desc' },
    include: { author: true },
    take: 50 // Limit to 50 results
  });

  // Use hardcoded teams to avoid extra query
  const teams = [
    { teamTag: 'NPD' },
    { teamTag: 'Marketing' },
    { teamTag: 'Supply Chain' },
    { teamTag: 'Finance' },
    { teamTag: 'Operations' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Insights Browser</h1>
        <Link href="/insights/new" className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 flex items-center gap-2">
          <Plus size={18} />
          New Insight
        </Link>
      </div>

      {/* Toolbar / Filter Bar */}
      <form className="bg-white p-4 rounded shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            name="q"
            defaultValue={q}
            type="text" 
            placeholder="Search insights..." 
            className="pl-10 pr-4 py-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-500" />
          <select 
            name="team" 
            defaultValue={teamFilter}
            className="border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none"
          >
            <option value="">All Teams</option>
            {teams.map((t: any) => (
              <option key={t.teamTag} value={t.teamTag}>{t.teamTag}</option>
            ))}
          </select>
          <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-900">
            Search
          </button>
        </div>
      </form>

      {/* Data Grid */}
      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Team</th>
              <th className="px-6 py-3">Topic</th>
              <th className="px-6 py-3">Author</th>
              <th className="px-6 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {insights.map((insight: any) => (
              <tr key={insight.id} className="bg-white border-b hover:bg-gray-50 transition-colors cursor-pointer">
                <td className="px-6 py-4 font-medium text-indigo-600">
                  <Link href={`/insights/${insight.id}`}>{insight.title}</Link>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded border border-gray-200 text-xs bg-gray-50">
                    {insight.status}
                  </span>
                </td>
                <td className="px-6 py-4">{insight.teamTag}</td>
                <td className="px-6 py-4">{insight.topicTag}</td>
                <td className="px-6 py-4 flex items-center gap-2">
                   {insight.author.avatar && <img src={insight.author.avatar} alt="" className="w-6 h-6 rounded-full" />}
                   {insight.author.name}
                </td>
                <td className="px-6 py-4">{new Date(insight.date).toLocaleDateString()}</td>
              </tr>
            ))}
            {insights.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">No insights found matching your criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
