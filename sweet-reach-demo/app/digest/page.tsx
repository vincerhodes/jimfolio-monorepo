import { prisma } from '@/lib/prisma';
import { toggleSubscription } from '../actions';
import { Bell, Check } from 'lucide-react';

export default async function DigestPage() {
  const userEmail = 'sarah.jenkins@sweetreach.com';
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: { subscriptions: true }
  });

  if (!user) return <div>User not found</div>;

  // Get all unique topics from insights to allow subscription
  const allTopics = await prisma.insight.findMany({
    select: { topicTag: true },
    distinct: ['topicTag']
  });

  const subscribedTopics = user.subscriptions.map((s: any) => s.topic);

  // Fetch insights for subscribed topics (Last 30 days)
  const digestInsights = await prisma.insight.findMany({
    where: {
      topicTag: { in: subscribedTopics },
      date: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
    },
    orderBy: { date: 'desc' }
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Bell className="text-indigo-600" />
            Monthly Insight Digest
          </h1>
          <p className="text-gray-500 text-sm mt-1">Curated insights based on your subscriptions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: The Digest */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-gray-700 border-b border-gray-200 pb-2">Your Feed</h2>
          
          {digestInsights.length > 0 ? (
            digestInsights.map((insight: any) => (
              <div key={insight.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">{insight.topicTag}</span>
                  <span className="text-xs text-gray-400">{new Date(insight.date).toLocaleDateString()}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{insight.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{insight.description}</p>
                <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center">
                  <div className="flex gap-4">
                    <span>From: {insight.country}</span>
                    <span>Team: {insight.teamTag}</span>
                  </div>
                  <a href={`/insights/${insight.id}#feedback`} className="text-indigo-600 font-bold hover:underline">
                    Provide Feedback
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-50 p-8 text-center rounded text-gray-500">
              No new insights for your subscribed topics this month.
            </div>
          )}
        </div>

        {/* Sidebar: Manage Subscriptions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit">
          <h3 className="font-bold text-gray-800 mb-4">Manage Subscriptions</h3>
          <p className="text-xs text-gray-500 mb-4">Select topics to include in your monthly email digest.</p>
          
          <div className="space-y-2">
            {allTopics.map((t: any) => {
              const isSubscribed = subscribedTopics.includes(t.topicTag);
              return (
                <form key={t.topicTag} action={toggleSubscription}>
                  <input type="hidden" name="topic" value={t.topicTag} />
                  <input type="hidden" name="subscribed" value={String(isSubscribed)} />
                  <button 
                    className={`w-full text-left px-4 py-2 rounded text-sm font-medium flex justify-between items-center transition-colors
                      ${isSubscribed 
                        ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                  >
                    {t.topicTag}
                    {isSubscribed && <Check size={16} />}
                  </button>
                </form>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
