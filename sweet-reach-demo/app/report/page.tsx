import { prisma } from '@/lib/prisma';
import { FileText, Filter } from 'lucide-react';

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ team?: string }> }) {
  const { team: teamFilter = '' } = await searchParams;

  // Get all insights that are type ACTION
  // Ideally we filter by the Insight's teamTag or the Action's assignedTo
  // Let's filter by Insight.teamTag for this report as requested ("filtered by team")
  
  const where: any = {
    type: 'ACTION'
  };
  
  if (teamFilter) {
    where.teamTag = teamFilter;
  }

  const actionInsights = await prisma.insight.findMany({
    where,
    include: {
      actions: true,
      author: true
    },
    orderBy: { date: 'desc' },
    take: 50 // Limit to prevent timeout
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
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-indigo-600" />
            Action Tracking Report
          </h1>
          <p className="text-gray-500 text-sm mt-1">Monthly board report for pending actions.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded shadow-sm border border-gray-200 flex items-center gap-4">
        <span className="text-sm font-bold text-gray-700">Filter Report:</span>
          <form className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <select 
              name="team" 
              defaultValue={teamFilter}
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none cursor-pointer"
            >
              <option value="">All Teams</option>
              {teams.map((t: any) => (
                <option key={t.teamTag} value={t.teamTag}>{t.teamTag}</option>
              ))}
            </select>
            <button type="submit" className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-300">Apply</button>
          </form>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden print:shadow-none print:border-none">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-white uppercase bg-slate-800">
            <tr>
              <th className="px-6 py-4">Ref ID</th>
              <th className="px-6 py-4">Insight / Action Required</th>
              <th className="px-6 py-4">Assigned Team</th>
              <th className="px-6 py-4">Action Status</th>
              <th className="px-6 py-4">Due Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {actionInsights.map((insight: any) => {
              // If no action is linked yet, show pending setup
              const action = insight.actions[0];
              
              return (
                <tr key={insight.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-xs">{insight.id.slice(-6).toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 mb-1">{insight.title}</div>
                    <div className="text-xs text-gray-500">{action ? action.description : 'No specific action defined yet.'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold">
                      {insight.teamTag}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {action ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold
                        ${action.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                          action.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 
                          'bg-amber-100 text-amber-800'}`}>
                        {action.status}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Pending Definition</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {action?.dueDate ? new Date(action.dueDate).toLocaleDateString() : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
