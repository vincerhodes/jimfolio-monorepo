import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Calendar, Target, ArrowRight, PlusCircle } from 'lucide-react';
import { createTasking } from '../actions';

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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Target className="text-indigo-600" />
            Active Insight Taskings
          </h1>
          <p className="text-gray-500 text-sm mt-1">Specific research requests from core teams.</p>
        </div>
      </div>

      {/* Create Tasking Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <PlusCircle className="text-indigo-600" size={20} />
          Create New Tasking
        </h3>
        <form action={createTasking} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input name="title" type="text" required className="w-full border border-gray-300 rounded p-2 text-sm" placeholder="e.g., Market Trends in SE Asia" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" required className="w-full border border-gray-300 rounded p-2 text-sm" rows={3} placeholder="Describe the specific insights needed..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requesting Team</label>
            <input name="requestingTeam" type="text" required className="w-full border border-gray-300 rounded p-2 text-sm" placeholder="e.g., Product Strategy" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
            <input name="deadline" type="date" required className="w-full border border-gray-300 rounded p-2 text-sm" />
          </div>
          <div className="col-span-2">
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-indigo-700">
              Create Tasking
            </button>
          </div>
        </form>
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
