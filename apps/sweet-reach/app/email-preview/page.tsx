import { prisma } from '@/lib/prisma';
import { Mail, User } from 'lucide-react';
import Link from 'next/link';

export default async function EmailPreviewPage({ searchParams }: { searchParams: Promise<{ userId?: string }> }) {
  const { userId } = await searchParams;

  // Default to Sarah if no user selected
  const users = await prisma.user.findMany({
    take: 20 // Limit users to prevent timeout
  });

  const selectedUser = userId
    ? await prisma.user.findUnique({
      where: { id: userId },
      include: { subscriptions: true }
    })
    : await prisma.user.findUnique({
      where: { email: 'sarah.jenkins@sweetreach.com' },
      include: { subscriptions: true }
    });

  if (!selectedUser) return <div>User not found. Seed db first.</div>;

  // Fetch insights for this user's subscriptions
  const subscribedTopics = selectedUser.subscriptions.map((s: any) => s.topic);

  const insights = subscribedTopics.length > 0 ? await prisma.insight.findMany({
    where: {
      topicTag: { in: subscribedTopics },
      // In a real email, this would be "created in the last month"
    },
    orderBy: { date: 'desc' },
    take: 10 // Already limited, good
  }) : [];

  return (
    <div className="flex h-full bg-gray-100">
      {/* Sidebar for Demo Controls */}
      <div className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <User size={20} />
          Select Recipient
        </h2>
        <div className="space-y-2 overflow-y-auto flex-1">
          {users.map((u: any) => (
            <Link
              key={u.id}
              href={`/email-preview?userId=${u.id}`}
              className={`block p-2 rounded text-sm ${selectedUser.id === u.id ? 'bg-indigo-100 text-indigo-800 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
            >
              {u.name}
              <div className="text-xs font-normal opacity-75">{u.role}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Email Preview Pane */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Email Header (Outlook Style) */}
          <div className="bg-gray-50 border-b border-gray-200 p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                SR
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SweetReach Monthly Digest</h1>
                <p className="text-sm text-gray-500">To: {selectedUser.name} &lt;{selectedUser.email}&gt;</p>
                <p className="text-sm text-gray-500">Subject: Your {new Date().toLocaleString('default', { month: 'long' })} Market Insights</p>
              </div>
            </div>
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-100">
              <Mail size={16} className="inline mr-2" />
              This is a preview of the automated email sent on the 1st of every month based on your topic subscriptions.
            </div>
          </div>

          {/* Email Body */}
          <div className="p-8 space-y-8">
            <p>Hello {selectedUser.name.split(' ')[0]},</p>
            <p>Here are the top insights from our global outreach team matching your interests in <strong>{subscribedTopics.join(', ')}</strong>.</p>

            {insights.length > 0 ? (
              <div className="space-y-6">
                {insights.map((insight: any) => (
                  <div key={insight.id} className="border-l-4 border-indigo-500 pl-4 py-1">
                    <div className="text-xs font-bold text-indigo-600 uppercase mb-1">
                      {insight.topicTag} • {insight.country}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      <a href="#" className="hover:underline text-indigo-900">{insight.title}</a>
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-2">{insight.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-xs text-gray-400">
                        Submitted by {insight.teamTag} Team • {new Date(insight.date).toLocaleDateString()}
                      </div>
                      <Link href={`/insights/${insight.id}#feedback`} className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1">
                        Rate / Feedback &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded text-gray-500 italic">
                No insights found matching your current subscriptions this month.
                <br />
                <Link href="/digest" className="text-indigo-600 underline">Manage Subscriptions</Link>
              </div>
            )}

            <div className="pt-8 border-t border-gray-200 text-center">
              <a href="#" className="bg-indigo-600 text-white px-6 py-3 rounded font-bold text-sm inline-block hover:bg-indigo-700">
                View All Insights on Dashboard
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-6 text-center text-xs text-gray-400 border-t border-gray-200">
            © 2025 SweetReach Confectionery. Internal Use Only.<br />
            <a href="#" className="underline">Unsubscribe</a>
          </div>
        </div>
      </div>
    </div>
  );
}
