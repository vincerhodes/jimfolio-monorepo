import { prisma } from '@/lib/prisma';
import { MessageSquare, Star, Calendar } from 'lucide-react';

export default async function AdminFeedbackPage() {
    const feedbacks = await prisma.appFeedback.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <MessageSquare className="text-indigo-600" />
                    Admin: App Feedback
                </h1>
                <p className="text-gray-500 text-sm mt-1">Review feedback submitted by users about the demo.</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-900 font-bold border-b border-gray-200">
                        <tr>
                            <th className="p-4">Date</th>
                            <th className="p-4">User</th>
                            <th className="p-4">Rating</th>
                            <th className="p-4">Comment</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {feedbacks.map((fb) => (
                            <tr key={fb.id} className="hover:bg-gray-50">
                                <td className="p-4 whitespace-nowrap flex items-center gap-2">
                                    <Calendar size={14} className="text-gray-400" />
                                    {new Date(fb.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-4 font-medium text-gray-900">
                                    {fb.name || <span className="text-gray-400 italic">Anonymous</span>}
                                </td>
                                <td className="p-4">
                                    <div className="flex text-amber-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} fill={i < fb.rating ? "currentColor" : "none"} />
                                        ))}
                                    </div>
                                </td>
                                <td className="p-4 max-w-md truncate" title={fb.comment}>
                                    {fb.comment}
                                </td>
                            </tr>
                        ))}
                        {feedbacks.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500 italic">
                                    No feedback submitted yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
