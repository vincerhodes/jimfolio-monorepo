import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Users, BarChart3, Calendar, Shield, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">VeriFlow Solutions</h1>
                <p className="text-gray-600">Document Verification Management System</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Link href="/dashboard">
                <Button>Team Member Portal</Button>
              </Link>
              <Link href="/team-overview">
                <Button variant="outline">Management Portal</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Streamline Your Document Verification Process
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            VeriFlow Solutions provides a comprehensive platform for managing document verification 
            workflows, tracking team performance, and planning capacity for optimal efficiency.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                Verification Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Submit and track document verification requests with real-time status updates 
                and detailed result recording.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Request verification checks</li>
                <li>• Track status in real-time</li>
                <li>• Record verification results</li>
                <li>• Color-coded status indicators</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-green-600" />
                Team Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Monitor individual and team performance against daily benchmarks with 
                comprehensive analytics and reporting.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Daily performance tracking</li>
                <li>• Benchmark monitoring</li>
                <li>• Productivity analysis</li>
                <li>• Team metrics dashboard</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-purple-600" />
                Analytics & Reporting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Visual analytics for throughput trends, result distribution, and 
                capacity utilization with interactive charts.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Throughput trend analysis</li>
                <li>• Result distribution charts</li>
                <li>• Performance metrics</li>
                <li>• Real-time data updates</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-orange-600" />
                Staff Planning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Plan and optimize staff allocation with productivity tracking and 
                benchmark adjustments based on working hours.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Productivity time tracking</li>
                <li>• Benchmark adjustments</li>
                <li>• Staff utilization analysis</li>
                <li>• Performance trend monitoring</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-red-600" />
                Capacity Forecasting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Forecast capacity needs and plan staffing levels for the next 30 days 
                with predictive analytics and recommendations.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 30-day capacity planning</li>
                <li>• Staffing recommendations</li>
                <li>• Utilization forecasting</li>
                <li>• Strategic planning tools</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-indigo-600" />
                Power Platform Design
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Built with Power Platform design patterns for seamless integration 
                and familiar user experience.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Fluent UI design system</li>
                <li>• Consistent styling patterns</li>
                <li>• Accessible interface</li>
                <li>• Responsive design</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-blue-50 rounded-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-600 mb-6">
              Choose your role below to access the appropriate portal for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Member Portal
                </Button>
              </Link>
              <Link href="/team-overview">
                <Button variant="outline" size="lg" className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Management Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>VeriFlow Solutions - Document Verification Management System</p>
            <p className="mt-1">Built with Next.js, Prisma, and Power Platform design patterns</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
