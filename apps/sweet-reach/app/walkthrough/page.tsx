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
          Demo Walkthrough
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          From Scattered Insights to <span className="text-indigo-600">Strategic Intelligence</span>
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          SweetReach transforms how global teams capture, validate, and act on market intelligence.
          This walkthrough demonstrates the complete insight lifecycle - from field observation to strategic action.
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
              "Market insights lost in email chains and spreadsheets",
              "No systematic way to request specific intelligence from field teams",
              "Manual compilation of board reports wastes valuable time",
              "Stakeholders miss relevant insights due to information overload",
              "No feedback loop to improve insight quality"
            ]}
          />
          <ComparisonBox
            title="Future State (SweetReach)"
            isGood={true}
            items={[
              "Centralized, searchable intelligence database with structured categorization",
              "Proactive tasking system aligns field research with strategic priorities",
              "Automated action tracking reports for board meetings",
              "Personalized topic subscriptions ensure relevant distribution",
              "Continuous feedback loops improve submission quality over time"
            ]}
          />
        </div>
      </section>

      {/* The Process & Feature Walkthrough */}
      <section className="relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">The Complete Workflow</h2>
          <p className="text-gray-500 mt-2">Follow the journey of an insight through the system - from capture to strategic action</p>
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
                <strong>Outreach Officers</strong> submit market insights using a structured form. 
                They categorize each insight as <strong>Observation</strong> (general market intelligence), 
                <strong>ITN</strong> (Information To Note - important but not urgent), or <strong>Action Required</strong> (needs immediate team response). 
                Each insight is tagged by relevant team and topic for easy filtering.
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
                desc="Submit insights with structured categorization. Choose insight type (Observation/ITN/Action), assign to relevant teams, and tag by topic for intelligent routing and filtering."
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
                title="Manager Review System"
                desc="Managers review submitted insights, provide constructive feedback to improve quality, and validate data accuracy. This ensures only high-quality intelligence reaches decision-makers."
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
                <strong>Regional Managers</strong> review incoming insights from their teams. 
                They provide feedback on submission quality, validate findings, and ensure insights are properly categorized. 
                This quality control step maintains the integrity of the intelligence database.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <Users size={16} />
                <span>Persona: Regional Manager</span>
              </div>
            </div>
          </div>

          {/* Step 3: Monthly Board Meetings - Action Tracking */}
          <div className="bg-gradient-to-r from-emerald-50 to-rose-50 -mx-6 px-6 py-12 rounded-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Monthly Team Board Meetings</h2>
              <p className="text-gray-600">The heart of the process: where insights drive action and new intelligence needs are identified</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Part A: Action Tracking */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <TrendingUp size={28} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Step 3</span>
                    <h3 className="text-xl font-bold text-gray-900">Action Tracking</h3>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Each core team (NPD, Marketing, Supply Chain, etc.) holds monthly board meetings. 
                  The <strong>Action Tracking Report</strong> is the key agenda item - showing all insights flagged as "Action Required" for that team. 
                  Team leads review progress on previously agreed actions, update statuses, and ensure strategic responses to market intelligence.
                </p>
                <FeatureCard
                  step="3"
                  title="Action Board Report"
                  desc="Team-filtered report showing all action-required insights. Used monthly to track progress and maintain accountability."
                  link="/report"
                  linkText="View Action Board"
                  icon={LayoutDashboard}
                  colorClass="bg-emerald-500"
                />
              </div>

              {/* Part B: Tasking */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                    <Database size={28} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Step 4</span>
                    <h3 className="text-xl font-bold text-gray-900">Proactive Tasking</h3>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">
                  At the same monthly meetings, teams identify intelligence gaps and create <strong>taskings</strong> - specific research requests for outreach officers. 
                  For example: "Gather feedback on sustainable packaging in European markets by Q2". 
                  These taskings ensure field teams gather targeted intelligence aligned with strategic priorities agreed at board level.
                </p>
                <FeatureCard
                  step="4"
                  title="Proactive Insight Tasking"
                  desc="Create and track research requests for field teams. Taskings are agreed at monthly boards to align intelligence gathering with business needs."
                  link="/tasking"
                  linkText="View Taskings"
                  icon={CheckCircle}
                  colorClass="bg-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Step 5: Digest */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <FeatureCard
                step="5"
                title="Subscription & Monthly Digest"
                desc="Users subscribe to topics of interest and receive a personalized monthly digest. View the digest page to see curated insights and manage your topic subscriptions."
                link="/digest"
                linkText="View Digest"
                icon={Mail}
                colorClass="bg-amber-500"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-4">
              <div className="inline-block p-3 bg-amber-50 text-amber-600 rounded-xl mb-2">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">5. Personalized Distribution</h3>
              <p className="text-gray-600 leading-relaxed">
                <strong>Stakeholders</strong> subscribe to specific topics (e.g., "Flavor Profiles", "Sustainability") and receive a monthly email digest with relevant insights. 
                This ensures everyone receives intelligence tailored to their interests without information overload. 
                Users can provide feedback directly on insights to help refine future submissions.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <Users size={16} />
                <span>Persona: All Stakeholders</span>
              </div>
            </div>
          </div>

          {/* Step 6: Analyze Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="lg:text-right space-y-4">
              <div className="inline-block p-3 bg-purple-50 text-purple-600 rounded-xl mb-2">
                <TrendingUp size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">6. Analyse Trends</h3>
              <p className="text-gray-600 leading-relaxed">
                <strong>Strategy Teams</strong> use the executive dashboard to identify patterns across regions, teams, and topics. 
                Visual analytics show insight volume trends, team distribution, and status breakdowns. 
                This bird's-eye view helps leadership spot emerging opportunities and allocate resources effectively.
              </p>
              <div className="flex items-center justify-end gap-2 text-sm text-gray-500 font-medium">
                <Users size={16} />
                <span>Persona: Strategy / Leadership</span>
              </div>
            </div>
            <div>
              <FeatureCard
                step="6"
                title="Dashboard Analytics"
                desc="Executive dashboard with real-time metrics, trend charts, and recent insights. Track total insights, actions required, and active taskings at a glance."
                link="/"
                linkText="View Dashboard"
                icon={LayoutDashboard}
                colorClass="bg-purple-500"
              />
            </div>
          </div>

          {/* Step 7: Feedback Loop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="lg:text-right space-y-4">
              <div className="inline-block p-3 bg-teal-50 text-teal-600 rounded-xl mb-2">
                <Eye size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">7. Continuous Improvement</h3>
              <p className="text-gray-600 leading-relaxed">
                <strong>Insight Receivers</strong> provide star ratings and feedback on what was useful or not useful about each insight. 
                This feedback loop helps outreach officers understand what intelligence is most valuable, improving submission quality over time. 
                The system also includes a demo feedback mechanism for stakeholders to provide input on the platform itself.
              </p>
              <div className="flex items-center justify-end gap-2 text-sm text-gray-500 font-medium">
                <Users size={16} />
                <span>Persona: All Stakeholders</span>
              </div>
            </div>
            <div>
              <FeatureCard
                step="7"
                title="Feedback Mechanisms"
                desc="Two-way feedback system: receivers rate insight usefulness (helping field teams improve), and stakeholders provide feedback on the platform itself for continuous refinement."
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
