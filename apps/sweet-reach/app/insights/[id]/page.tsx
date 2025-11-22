import { prisma } from '@/lib/prisma';
import { submitReview, submitFeedback, createAction, updateActionStatus } from '../../actions';
import { ActionStatusSelect } from './ActionStatusSelect';
import { CheckCircle, MessageSquare, Star, User as UserIcon, PlayCircle, Clock, CheckSquare } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function InsightDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const insight = await prisma.insight.findUnique({
    where: { id: params.id },
    include: {
      author: true,
      reviews: { include: { manager: true } },
      feedbacks: { include: { user: true } },
      actions: true
    }
  });

  if (!insight) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                ${insight.type === 'ACTION' ? 'bg-red-100 text-red-800' :
                  insight.type === 'ITN' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'}`}>
                {insight.type}
              </span>
              <span className="text-gray-500 text-sm">{new Date(insight.date).toLocaleDateString()}</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{insight.status}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{insight.title}</h1>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Country: <span className="font-medium text-gray-800">{insight.country}</span></p>
            <p>Team: <span className="font-medium text-gray-800">{insight.teamTag}</span></p>
          </div>
        </div>

        <div className="prose max-w-none text-gray-800 mt-4 p-4 bg-gray-50 rounded border border-gray-100">
          <p>{insight.description}</p>
        </div>

        <div className="mt-6 flex items-center gap-3 pt-4 border-t border-gray-100">
          {insight.author.avatar ? (
            <img src={insight.author.avatar} alt="" className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
              <UserIcon size={20} />
            </div>
          )}
          <div>
            <p className="font-medium text-sm text-gray-900">{insight.author.name}</p>
            <p className="text-xs text-gray-500">Outreach Officer</p>
          </div>
        </div>
      </div>

      {/* Actions & Next Steps Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <PlayCircle className="text-indigo-600" size={20} />
          Actions & Next Steps
        </h3>

        <div className="space-y-4 mb-6">
          {insight.actions.length > 0 ? (
            insight.actions.map((action: any) => (
              <div key={action.id} className="flex items-start justify-between bg-gray-50 p-4 rounded border border-gray-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                      ${action.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        action.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-200 text-gray-700'}`}>
                      {action.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">Assigned to: {action.assignedTo}</span>
                  </div>
                  <p className="text-gray-800 font-medium">{action.description}</p>
                  {action.dueDate && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <Clock size={12} /> Due: {new Date(action.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <ActionStatusSelect
                  actionId={action.id}
                  insightId={insight.id}
                  status={action.status}
                />
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic text-sm">No actions recorded yet.</p>
          )}
        </div>

        {/* Create Action Form */}
        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-sm font-bold text-gray-700 mb-3">Assign New Action</h4>
          <form action={createAction} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="hidden" name="insightId" value={insight.id} />
            <div className="col-span-2">
              <input
                name="description"
                type="text"
                required
                placeholder="Action description..."
                className="w-full border border-gray-300 rounded p-2 text-sm"
              />
            </div>
            <div>
              <input
                name="assignedTo"
                type="text"
                required
                placeholder="Assign to (Team/Person)..."
                className="w-full border border-gray-300 rounded p-2 text-sm"
              />
            </div>
            <div>
              <input
                name="dueDate"
                type="date"
                className="w-full border border-gray-300 rounded p-2 text-sm"
              />
            </div>
            <div className="col-span-2">
              <button className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
                <CheckSquare size={16} /> Create Action
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Manager Reviews Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <CheckCircle className="text-indigo-600" size={20} />
          Manager Reviews
        </h3>

        <div className="space-y-4">
          {insight.reviews.length > 0 ? (
            insight.reviews.map((review: any) => (
              <div key={review.id} className="bg-indigo-50 p-4 rounded border border-indigo-100">
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-indigo-900">{review.manager.name}</span>
                  <span className="text-xs text-indigo-700">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-indigo-800">{review.content}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic text-sm">No reviews yet.</p>
          )}
        </div>

        {/* Add Review Form (Demo: Assuming current user is Manager) */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h4 className="text-sm font-bold text-gray-700 mb-2">Add Review (Manager)</h4>
          <form action={submitReview} className="flex gap-2">
            <input type="hidden" name="insightId" value={insight.id} />
            <input
              name="content"
              type="text"
              required
              placeholder="Constructive feedback..."
              className="flex-1 border border-gray-300 rounded p-2 text-sm"
            />
            <button className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-indigo-700">
              Submit Review
            </button>
          </form>
        </div>
      </div>

      {/* Feedback Section */}
      <div id="feedback" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Star className="text-amber-500" size={20} />
          Stakeholder Feedback
        </h3>

        <div className="space-y-4">
          {insight.feedbacks.map((fb: any) => (
            <div key={fb.id} className="border-b border-gray-100 pb-3 last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < fb.rating ? "currentColor" : "none"} />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-700">{fb.user.name}</span>
              </div>
              <p className="text-sm text-gray-600">{fb.comment}</p>
            </div>
          ))}
        </div>

        {/* Add Feedback Form */}
        <div className="mt-6 pt-6 border-t border-gray-100 bg-gray-50 p-4 rounded">
          <h4 className="text-sm font-bold text-gray-700 mb-2">Was this insight useful?</h4>
          <form action={submitFeedback} className="space-y-3">
            <input type="hidden" name="insightId" value={insight.id} />
            <div>
              <label className="text-xs text-gray-500 block mb-1">Rating (1-5)</label>
              <select name="rating" className="border border-gray-300 rounded p-1 text-sm w-20">
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            <div className="flex gap-2">
              <input
                name="comment"
                type="text"
                placeholder="Comments..."
                className="flex-1 border border-gray-300 rounded p-2 text-sm"
              />
              <button className="bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-900">
                Rate
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
