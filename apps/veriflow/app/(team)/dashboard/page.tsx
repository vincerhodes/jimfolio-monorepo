import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PlusCircle, FileText, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';

// Mock data - will be replaced with Prisma calls
const mockStats = {
  todayChecks: 7,
  dailyBenchmark: 10,
  weeklyProgress: 45,
  weeklyBenchmark: 50,
  productiveHours: 6,
  totalHours: 7,
};

const mockChecks = [
  {
    id: '1',
    customerName: 'Acme Corporation',
    documentType: 'Business License',
    status: 'completed',
    result: 'genuine',
    completedAt: '2024-01-15 10:30 AM',
  },
  {
    id: '2',
    customerName: 'TechStart Inc',
    documentType: 'Tax Certificate',
    status: 'completed',
    result: 'inconclusive',
    completedAt: '2024-01-15 09:45 AM',
  },
  {
    id: '3',
    customerName: 'Global Enterprises',
    documentType: 'ID Document',
    status: 'in-progress',
    result: null,
    completedAt: null,
  },
];

export default function TeamDashboard() {
  const todayPercentage = (mockStats.todayChecks / mockStats.dailyBenchmark) * 100;
  const weeklyPercentage = (mockStats.weeklyProgress / mockStats.weeklyBenchmark) * 100;
  const productivityPercentage = (mockStats.productiveHours / mockStats.totalHours) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Dashboard</h1>
          <p className="text-gray-600">Welcome back, John Smith</p>
        </div>
        <Link href="/team/request-check">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Request New Check
          </Button>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Today's Checks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {mockStats.todayChecks}/{mockStats.dailyBenchmark}
            </div>
            <div className="text-sm text-gray-600">
              {todayPercentage.toFixed(0)}% of daily benchmark
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${Math.min(todayPercentage, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {mockStats.weeklyProgress}/{mockStats.weeklyBenchmark}
            </div>
            <div className="text-sm text-gray-600">
              {weeklyPercentage.toFixed(0)}% of weekly benchmark
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${Math.min(weeklyPercentage, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Productivity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {mockStats.productiveHours}h / {mockStats.totalHours}h
            </div>
            <div className="text-sm text-gray-600">
              {productivityPercentage.toFixed(0)}% productive time
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full"
                style={{ width: `${productivityPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Adjusted Benchmark
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {(mockStats.dailyBenchmark * productivityPercentage / 100).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">
              Based on productivity time
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Scaled from {mockStats.dailyBenchmark} checks/day
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Checks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Verification Checks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="pp-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Document Type</th>
                  <th>Status</th>
                  <th>Result</th>
                  <th>Completed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockChecks.map((check) => (
                  <tr key={check.id}>
                    <td className="font-medium">{check.customerName}</td>
                    <td>{check.documentType}</td>
                    <td>
                      <StatusBadge 
                        status={check.status === 'completed' ? 'completed' : 'in-progress'}
                      >
                        {check.status === 'completed' ? 'Completed' : 'In Progress'}
                      </StatusBadge>
                    </td>
                    <td>
                      {check.result && (
                        <StatusBadge status={check.result as 'genuine' | 'inconclusive' | 'false' | 'unable'}>
                          {check.result.charAt(0).toUpperCase() + check.result.slice(1)}
                        </StatusBadge>
                      )}
                      {!check.result && (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td>{check.completedAt || '-'}</td>
                    <td>
                      <Link href={`/team/my-checks/${check.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Link href="/team/my-checks">
              <Button variant="outline">View All Checks</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
