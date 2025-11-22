import { ArrowRight, CheckCircle, Eye, LayoutDashboard, Mail, Users } from 'lucide-react';
import Link from 'next/link';

function RequirementCard({ number, title, desc, link, linkText }: any) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded-bl">
        Req #{number}
      </div>
      <h3 className="font-bold text-indigo-900 mb-2 pr-8">{title}</h3>
      <p className="text-gray-600 text-sm mb-4 h-16">{desc}</p>
      <Link href={link} className="text-indigo-600 text-sm font-bold hover:underline flex items-center gap-1">
        {linkText} <ArrowRight size={14} />
      </Link>
    </div>
  );
}

export default function WalkthroughPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-16 py-10">
      
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="inline-block bg-indigo-100 text-indigo-800 px-4 py-1 rounded-full text-sm font-bold mb-2">
          Proof of Concept
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
          SweetReach <span className="text-indigo-600">Insight Hub</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          A centralized platform for gathering, analyzing, and distributing global market intelligence.
          Designed to replace disconnected emails with a structured, actionable database.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link href="/" className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 shadow-lg transition-transform hover:-translate-y-1">
            Launch Demo Dashboard
          </Link>
          <Link href="/app-feedback" className="bg-white text-gray-700 border border-gray-300 px-8 py-3 rounded-lg font-bold hover:bg-gray-50 shadow-sm transition-transform hover:-translate-y-1">
            Provide Feedback
          </Link>
        </div>
      </div>

      {/* The Scenario */}
      <section className="bg-slate-900 text-white p-10 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold text-indigo-300 uppercase tracking-wide">The Scenario</h2>
            <p className="text-lg leading-relaxed opacity-90">
              <strong>SweetReach Confectionery</strong> is expanding globally. Our "Outreach Officers" in key markets (Japan, Brazil, France) are the eyes and ears on the ground.
            </p>
            <p className="text-base opacity-80">
              They need a way to report on <strong>Competitor Moves</strong>, <strong>Flavor Trends</strong>, and <strong>Regulations</strong> without getting lost in email chains. The UK Board needs a consolidated view to make strategic decisions.
            </p>
          </div>
          <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/20">
            <h3 className="font-bold mb-3 flex items-center gap-2"><Users size={20} /> Key Personas</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><div className="w-2 h-2 bg-green-400 rounded-full"></div> Kenji (Officer, Japan)</li>
              <li className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-400 rounded-full"></div> Sarah (Manager, UK)</li>
              <li className="flex items-center gap-2"><div className="w-2 h-2 bg-purple-400 rounded-full"></div> David (NPD Stakeholder)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Requirements Matrix */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Requirements Delivered</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <RequirementCard 
            number="1" 
            title="Submission & Flags" 
            desc="Capture insights with Observation, ITN, or Action flags." 
            link="/insights/new" 
            linkText="Try Submitting" 
          />
          <RequirementCard 
            number="2" 
            title="Smart Tagging" 
            desc="Categorize by Team (NPD, Sales) and Topic (Flavor, Tech)." 
            link="/insights" 
            linkText="View Tags" 
          />
          <RequirementCard 
            number="3" 
            title="Action Tracking" 
            desc="Dedicated board report for 'Action Required' items filtered by team." 
            link="/report" 
            linkText="Open Report" 
          />
          <RequirementCard 
            number="4" 
            title="Tasked Insights" 
            desc="Respond to specific requests (Taskings) from core teams." 
            link="/tasking" 
            linkText="View Taskings" 
          />
          <RequirementCard 
            number="5" 
            title="Executive Dashboard" 
            desc="Visual analytics on volume, status, and trends." 
            link="/" 
            linkText="See Dashboard" 
          />
          <RequirementCard 
            number="6" 
            title="Manager Review" 
            desc="Managers provide constructive feedback and approval." 
            link="/insights" 
            linkText="Review an Insight" 
          />
          <RequirementCard 
            number="7" 
            title="Stakeholder Feedback" 
            desc="Star rating system for insight utility." 
            link="/email-preview" 
            linkText="Rate via Email" 
          />
          <RequirementCard 
            number="8" 
            title="Subscriptions & Digest" 
            desc="Personalized monthly email based on topic interests." 
            link="/email-preview" 
            linkText="Preview Email" 
          />
        </div>
      </section>

      {/* Guided Process Flow */}
      <section className="bg-gray-50 p-10 rounded-2xl border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">The Insight Lifecycle</h2>
        
        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 hidden md:block z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center group hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Eye size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">1. Identify</h3>
              <p className="text-sm text-gray-500 mb-4">Officer spots a trend in their local market.</p>
              <Link href="/insights/new" className="text-xs font-bold text-indigo-600 uppercase tracking-wide hover:underline">
                Submit Form &rarr;
              </Link>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center group hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <CheckCircle size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">2. Review</h3>
              <p className="text-sm text-gray-500 mb-4">Manager validates and assigns actions.</p>
              <Link href="/insights" className="text-xs font-bold text-blue-600 uppercase tracking-wide hover:underline">
                Manager View &rarr;
              </Link>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center group hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <LayoutDashboard size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">3. Act</h3>
              <p className="text-sm text-gray-500 mb-4">Teams track progress on board reports.</p>
              <Link href="/report" className="text-xs font-bold text-emerald-600 uppercase tracking-wide hover:underline">
                Action Report &rarr;
              </Link>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center group hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Mail size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">4. Digest</h3>
              <p className="text-sm text-gray-500 mb-4">Stakeholders get curated updates.</p>
              <Link href="/email-preview" className="text-xs font-bold text-amber-600 uppercase tracking-wide hover:underline">
                View Email &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
