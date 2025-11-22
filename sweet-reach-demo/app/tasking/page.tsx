import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Calendar, Target, ArrowRight } from 'lucide-react';

export default async function TaskingPage() {
  const taskings = await prisma.tasking.findMany({
    where: { status: 'OPEN' },
    orderBy: { deadline: 'asc' },
    include: {
      _count: {
        select: { insights: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Target className="text-indigo-600" />
          Active Insight Taskings
        </h1>
        <p className="text-gray-500 text-sm mt-1">Specific research requests from core teams.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {taskings.map((task: any) => (
          <div key={task.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded uppercase">
                Request from {task.requestingTeam}
              </span>
              <div className="flex items-center gap-1 text-sm text-amber-600 font-medium">
                <Calendar size={14} />
                Due: {new Date(task.deadline).toLocaleDateString()}
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2">{task.title}</h2>
            <p className="text-gray-600 mb-6 flex-1">{task.description}</p>
            
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm text-gray-500">{task._count.insights} insights gathered so far</span>
              <Link 
                href={`/insights/new?taskingId=${task.id}&team=${task.requestingTeam}`}
                className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-indigo-700 flex items-center gap-2"
              >
                Submit Insight <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ))}
        
        {taskings.length === 0 && (
          <div className="col-span-2 text-center py-12 bg-white rounded border border-gray-200">
            <p className="text-gray-500">No active taskings at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
