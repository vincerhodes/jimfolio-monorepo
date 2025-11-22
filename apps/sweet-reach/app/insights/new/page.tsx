import { createInsight } from '../../actions';
import { Save } from 'lucide-react';

export default async function NewInsightPage({ searchParams }: { searchParams: Promise<{ taskingId?: string, team?: string }> }) {
  const { taskingId = '', team: defaultTeam = 'NPD' } = await searchParams;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Submit New Insight</h1>
      
      <div className="bg-white p-8 rounded-lg shadow border border-gray-200">
        <form action={createInsight} className="space-y-6">
          {taskingId && (
            <input type="hidden" name="taskingId" value={taskingId} />
          )}
          {taskingId && (
            <div className="bg-indigo-50 border border-indigo-200 p-3 rounded text-sm text-indigo-800 mb-4">
              Responding to tasking: <strong>{taskingId}</strong>
            </div>
          )}
          
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Insight Title</label>
            <input 
              name="title"
              type="text" 
              required
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g. Increasing demand for Matcha in Paris"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Insight Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input type="radio" name="type" value="OBSERVATION" required className="text-indigo-600" />
                <span className="text-sm font-medium">Observation</span>
              </label>
              <label className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input type="radio" name="type" value="ITN" className="text-blue-600" />
                <span className="text-sm font-medium">Information To Note</span>
              </label>
              <label className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input type="radio" name="type" value="ACTION" className="text-red-600" />
                <span className="text-sm font-medium">Action Required</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description / Findings</label>
            <textarea 
              name="description"
              required
              rows={5}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe what you observed..."
            />
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relevant Team</label>
              <select name="team" defaultValue={defaultTeam} className="w-full p-2 border border-gray-300 rounded">
                <option value="NPD">NPD</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Supply Chain">Supply Chain</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic Tag</label>
              <select name="topic" className="w-full p-2 border border-gray-300 rounded">
                <option value="Flavor Profiles">Flavor Profiles</option>
                <option value="Packaging Innovation">Packaging Innovation</option>
                <option value="Competitor Activity">Competitor Activity</option>
                <option value="Regulatory Change">Regulatory Change</option>
                <option value="Sustainability">Sustainability</option>
                <option value="Consumer Lifestyle">Consumer Lifestyle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <select name="country" className="w-full p-2 border border-gray-300 rounded">
                <option value="Asia Pacific">Asia Pacific</option>
                <option value="Europe">Europe</option>
                <option value="Africa & Middle East">Africa & Middle East</option>
                <option value="Americas">Americas</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              className="bg-indigo-600 text-white px-6 py-2 rounded shadow hover:bg-indigo-700 flex items-center gap-2"
            >
              <Save size={18} />
              Submit Insight
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
