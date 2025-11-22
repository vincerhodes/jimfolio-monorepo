import {
  ArrowRight,
  CheckCircle,
  Eye,
  LayoutDashboard,
  Mail,
  Users,
  XCircle,
  Database,
  Globe,
  TrendingUp,
  FileText,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

function FeatureCard({ step, title, desc, link, linkText, icon: Icon, colorClass }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${colorClass}`}></div>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${colorClass.replace('bg-', 'bg-opacity-10 bg-').replace('border-l-4', '')} text-gray-700`}>
          <Icon size={24} className={colorClass.replace('bg-', 'text-').replace('border-l-4', '')} />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Step {step}</span>
      </div>
      <h3 className="font-bold text-lg text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-6 leading-relaxed">{desc}</p>
      <Link href={link} className={`inline-flex items-center gap-2 text-sm font-bold ${colorClass.replace('bg-', 'text-').replace('border-l-4', '')} hover:underline`}>
        {linkText} <ArrowRight size={16} />
      </Link>
    </div>
  );
}

function ComparisonBox({ title, items, isGood }: { title: string, items: string[], isGood: boolean }) {
  return (
    <div className={`flex-1 p-8 rounded-2xl ${isGood ? 'bg-indigo-50 border border-indigo-100' : 'bg-gray-50 border border-gray-200'}`}>
      <div className="flex items-center gap-3 mb-6">
        {isGood ? <CheckCircle className="text-indigo-600" size={28} /> : <XCircle className="text-gray-400" size={28} />}
        <h3 className={`text-xl font-bold ${isGood ? 'text-indigo-900' : 'text-gray-500'}`}>{title}</h3>
      </div>
      <ul className="space-y-4">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isGood ? 'bg-indigo-400' : 'bg-gray-300'}`}></span>
            <span className={`${isGood ? 'text-indigo-800 font-medium' : 'text-gray-500'}`}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function WalkthroughPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-24 py-16 px-6">

      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium border border-indigo-100">
          Proof of Concept Walkthrough
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          From Scattered Insights to <span className="text-indigo-600">Structured Intelligence</span>
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          SweetReach provides a centralised system for gathering, analysing, and acting on global market insights.
          This walkthrough demonstrates how an insight moves through the platform.
        </p>
      </div>

      {/* The Vision: Old vs New */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">The Challenge</h2>
          <p className="text-gray-500 mt-2">What we're addressing</p>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <ComparisonBox
            title="Current State (The Problem)"
            isGood={false}
            items={[
              "Insights buried in endless email chains",
              "No structured data for analysis or trends",
              "Manual, time-consuming report compilation",
              "Lack of visibility for stakeholders"
            ]}
          />
          <ComparisonBox
            title="Future State (SweetReach)"
            isGood={true}
            items={[
              "Centralized, searchable insight database",
              "Real-time tagging and trend analysis",
              "Automated workflows and board reporting",
              "Personalized digests for every stakeholder"
            ]}
          />
        </div>
      </section>

      {/* The Process & POC Mapping */}
      <section className="relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">The Process & POC Support</h2>
          <p className="text-gray-500 mt-2">Follow the journey of an insight through the application</p>
        </div>

        {/* Vertical Line */}
        <div className="absolute left-1/2 top-32 bottom-0 w-0.5 bg-gray-100 -translate-x-1/2 hidden lg:block -z-10"></div>

        <div className="space-y-12">

          {/* Step 1: Identify */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="lg:text-right space-y-4">
              <div className="inline-block p-3 bg-blue-50 text-blue-600 rounded-xl mb-2">
                <Globe size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">1. Identify & Capture</h3>
              <p className="text-gray-600 leading-relaxed">
                <strong>Kenji (Outreach Officer, Japan)</strong> spots a new matcha-flavored kit-kat competitor.
                Instead of sending an email, he submits a structured observation.
              </p>
              <div className="flex items-center justify-end gap-2 text-sm text-gray-500 font-medium">
                <Users size={16} />
                <span>Persona: Outreach Officer</span>
              </div>
            </div>
            <div>
              <FeatureCard
                step="1"
                title="Smart Submission Form"
                desc="Try submitting a new insight. Notice the 'Smart Tags' for effortless categorization and the ability to flag items for immediate action."
                link="/insights/new"
                linkText="Submit an Insight"
                icon={FileText}
                colorClass="bg-blue-500"
              />
            </div>
          </div>

          {/* Step 2: Review */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <FeatureCard
                step="2"
                title="Manager Dashboard"
                desc="Visit the insights feed. As a manager, you can filter by region, review incoming submissions, and assign 'Action Required' status."
                link="/insights"
                linkText="Review Insights"
                icon={CheckCircle}
                colorClass="bg-indigo-500"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-4">
              <div className="inline-block p-3 bg-indigo-50 text-indigo-600 rounded-xl mb-2">
                <Database size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">2. Review & Validate</h3>
              <p className="text-gray-600 leading-relaxed">
                <strong>Sarah (Regional Manager, UK)</strong> reviews Kenji's submission.
                She validates the data, adds internal notes, and tags it for the NPD team's attention.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <Users size={16} />
                <span>Persona: Regional Manager</span>
              </div>
            </div>
          </div>

          {/* Step 3: Act */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="lg:text-right space-y-4">
              <div className="inline-block p-3 bg-emerald-50 text-emerald-600 rounded-xl mb-2">
                <TrendingUp size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">3. Strategic Action</h3>
              <p className="text-gray-600 leading-relaxed">
                The <strong>NPD Team</strong> sees the flagged insight on their board report.
                They initiate a project to explore matcha flavors, tracking progress directly linked to the original insight.
              </p>
              <div className="flex items-center justify-end gap-2 text-sm text-gray-500 font-medium">
                <Users size={16} />
                <span>Persona: NPD / Strategy Team</span>
              </div>
            </div>
            <div>
              <FeatureCard
                step="3"
                title="Action Board Report"
                desc="Check the Report page. This is a filtered view for executives showing only high-priority items that require strategic decisions."
                link="/report"
                linkText="View Action Board"
                icon={LayoutDashboard}
                colorClass="bg-emerald-500"
              />
            </div>
          </div>

          {/* Step 4: Digest */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <FeatureCard
                step="4"
                title="Automated Digest"
                desc="Preview the email digest. This system automatically compiles relevant insights into a weekly email for stakeholders."
                link="/email-preview"
                linkText="Preview Email"
                icon={Mail}
                colorClass="bg-amber-500"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-4">
              <div className="inline-block p-3 bg-amber-50 text-amber-600 rounded-xl mb-2">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">4. Distribute Knowledge</h3>
              <p className="text-gray-600 leading-relaxed">
                <strong>David (Stakeholder)</strong> receives his weekly "Flavour Trends" digest.
                He can click through to view full details and provide feedback on the insights.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <Users size={16} />
                <span>Persona: Executive Stakeholder</span>
              </div>
            </div>
          </div>

          {/* Step 5: Analyze Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="lg:text-right space-y-4">
              <div className="inline-block p-3 bg-purple-50 text-purple-600 rounded-xl mb-2">
                <TrendingUp size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">5. Analyse Trends</h3>
              <p className="text-gray-600 leading-relaxed">
                <strong>Analytics Team</strong> uses the dashboard to identify patterns across regions and categories.
                Smart tags enable filtering by product type, market, or strategic priority.
              </p>
              <div className="flex items-center justify-end gap-2 text-sm text-gray-500 font-medium">
                <Users size={16} />
                <span>Persona: Analytics / Strategy</span>
              </div>
            </div>
            <div>
              <FeatureCard
                step="5"
                title="Dashboard Analytics"
                desc="Explore the main dashboard. Filter insights by tags, regions, and time periods to spot emerging trends and patterns."
                link="/"
                linkText="View Dashboard"
                icon={LayoutDashboard}
                colorClass="bg-purple-500"
              />
            </div>
          </div>

          {/* Step 6: Task Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <FeatureCard
                step="6"
                title="Task Tracking"
                desc="See how insights connect to actionable tasks. Track follow-up actions and ensure nothing falls through the cracks."
                link="/tasking"
                linkText="View Tasks"
                icon={CheckCircle}
                colorClass="bg-rose-500"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-4">
              <div className="inline-block p-3 bg-rose-50 text-rose-600 rounded-xl mb-2">
                <Database size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">6. Track Actions</h3>
              <p className="text-gray-600 leading-relaxed">
                <strong>Project Managers</strong> assign tasks based on insights and monitor progress.
                Each task links back to the original insight, maintaining clear traceability.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <Users size={16} />
                <span>Persona: Project Manager</span>
              </div>
            </div>
          </div>

          {/* Step 7: Feedback Loop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="lg:text-right space-y-4">
              <div className="inline-block p-3 bg-teal-50 text-teal-600 rounded-xl mb-2">
                <Eye size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">7. Close the Loop</h3>
              <p className="text-gray-600 leading-relaxed">
                <strong>All Users</strong> can rate insights and provide feedback on their usefulness.
                This data helps refine the system and improve future submissions.
              </p>
              <div className="flex items-center justify-end gap-2 text-sm text-gray-500 font-medium">
                <Users size={16} />
                <span>Persona: All Stakeholders</span>
              </div>
            </div>
            <div>
              <FeatureCard
                step="7"
                title="Feedback System"
                desc="Rate insights and provide feedback. Help improve the quality and relevance of future submissions."
                link="/app-feedback"
                linkText="Provide Feedback"
                icon={MessageSquare}
                colorClass="bg-teal-500"
              />
            </div>
          </div>

        </div>
      </section>

      {/* Call to Action */}
      <div className="bg-slate-900 rounded-2xl p-12 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/30 to-purple-900/30 z-0"></div>
        <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold">Explore the Platform</h2>
          <p className="text-indigo-200">
            View the dashboard to see the complete picture of global insights.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/" className="bg-white text-slate-900 px-8 py-3 rounded-lg font-medium hover:bg-indigo-50 transition-colors">
              View Dashboard
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
