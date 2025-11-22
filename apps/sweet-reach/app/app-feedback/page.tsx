import { submitAppFeedback } from '../actions';
import { CheckCircle2, MessageSquarePlus, Send } from 'lucide-react';
import Link from 'next/link';

export default async function AppFeedbackPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const { success } = await searchParams;

  if (success === 'true') {
    return (
      <div className="max-w-md mx-auto mt-16 text-center p-8 bg-white rounded-lg shadow-lg border border-green-100">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h1>
        <p className="text-gray-600 mb-6">
          Your feedback on the <strong>SweetReach Demo</strong> has been recorded. We will use it to refine the final Power Apps implementation.
        </p>
        <Link href="/" className="bg-indigo-600 text-white px-6 py-2 rounded font-medium hover:bg-indigo-700">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
          <MessageSquarePlus className="text-amber-500" size={32} />
          Demo Feedback
        </h1>
        <p className="text-gray-600">
          Help us refine this prototype. What works? What's missing? <br/>
          Your input will directly shape the final production build.
        </p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        <form action={submitAppFeedback} className="space-y-6">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Overall Rating of the Concept</label>
            <div className="flex gap-6 justify-center p-4 bg-gray-50 rounded-lg">
              {[1, 2, 3, 4, 5].map((num) => (
                <label key={num} className="cursor-pointer text-center group">
                  <input type="radio" name="rating" value={num} required className="peer sr-only" />
                  <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-lg font-bold text-gray-500 peer-checked:border-amber-500 peer-checked:bg-amber-500 peer-checked:text-white transition-all group-hover:border-amber-300">
                    {num}
                  </div>
                  <span className="text-xs text-gray-400 mt-1 block">Star</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Your Name (Optional)</label>
            <input 
              name="name"
              type="text" 
              placeholder="e.g. Sarah"
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">What improvements would you suggest?</label>
            <textarea 
              name="comment"
              required
              rows={6}
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. The dashboard needs a map view, or the email digest should include..."
            />
          </div>

          <div className="pt-2">
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all">
              <Send size={20} />
              Submit Feedback
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
