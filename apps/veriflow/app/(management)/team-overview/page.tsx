'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ThroughputChart } from '@/components/charts/ThroughputChart';
import { ResultDistributionChart } from '@/components/charts/ResultDistributionChart';
import { Users, TrendingUp, FileText, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface AnalyticsData {
  overview: {
    todayTotal: number;
    todayCompleted: number;
    weeklyTotal: number;
    weeklyCompleted: number;
    dailyBenchmark: number;
    weeklyBenchmark: number;
    activeStaffCount: number;
    todayUtilization: number;
    weeklyUtilization: number;
  };
  staffPerformance: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    todayChecks: number;
    adjustedBenchmark: number;
    performancePercentage: number;
    productiveHours: number;
    totalHours: number;
    productivityPercentage: number;
  }>;
  resultDistribution: Record<string, number>;
  throughputData: Array<{
    date: string;
    checks: number;
    benchmark: number;
  }>;
}

export default function TeamOverviewPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 100) return 'genuine';
    if (percentage >= 80) return 'inconclusive';
    return 'false';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Team Overview</h1>
        <div className="text-center py-8">
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Team Overview</h1>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load analytics data</p>
          <Button onClick={fetchAnalytics} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Overview</h1>
          <p className="text-gray-600">Monitor team performance and verification metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAnalytics}>
            Refresh Data
          </Button>
          <Link href="/management/staff-planning">
            <Button>Staff Planning</Button>
          </Link>
        </div>
      </div>

      {/* Overview Metrics */}
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
              {analytics.overview.todayTotal}
            </div>
            <div className="text-sm text-gray-600">
              {analytics.overview.todayCompleted} completed
            </div>
            <div className="mt-2 text-sm">
              <span className={getPerformanceColor(analytics.overview.todayUtilization)}>
                {analytics.overview.todayUtilization.toFixed(0)}% of benchmark
              </span>
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
              {analytics.overview.weeklyTotal}
            </div>
            <div className="text-sm text-gray-600">
              {analytics.overview.weeklyCompleted} completed
            </div>
            <div className="mt-2 text-sm">
              <span className={getPerformanceColor(analytics.overview.weeklyUtilization)}>
                {analytics.overview.weeklyUtilization.toFixed(0)}% of benchmark
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Active Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {analytics.overview.activeStaffCount}
            </div>
            <div className="text-sm text-gray-600">
              {analytics.overview.dailyBenchmark} daily capacity
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {analytics.staffPerformance.filter(s => s.performancePercentage >= 100).length} at/above target
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Avg Productivity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {(analytics.staffPerformance.reduce((acc, s) => acc + s.productivityPercentage, 0) / analytics.staffPerformance.length).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">
              Team average
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Based on {analytics.overview.activeStaffCount} staff members
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>7-Day Throughput Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ThroughputChart data={analytics.throughputData} type="line" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Result Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultDistributionChart data={analytics.resultDistribution} />
          </CardContent>
        </Card>
      </div>

      {/* Staff Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Performance Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="pp-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Role</th>
                  <th>Checks Today</th>
                  <th>Adjusted Benchmark</th>
                  <th>Performance</th>
                  <th>Productivity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.staffPerformance.map((staff) => (
                  <tr key={staff.id}>
                    <td className="font-medium">{staff.name}</td>
                    <td>{staff.role.replace('_', ' ')}</td>
                    <td>{staff.todayChecks}</td>
                    <td>{staff.adjustedBenchmark.toFixed(1)}</td>
                    <td className={getPerformanceColor(staff.performancePercentage)}>
                      {staff.performancePercentage.toFixed(0)}%
                    </td>
                    <td>{staff.productiveHours}h / {staff.totalHours}h</td>
                    <td>
                      <StatusBadge status={getPerformanceBadge(staff.performancePercentage)}>
                        {staff.performancePercentage >= 100 ? 'On Target' : 
                         staff.performancePercentage >= 80 ? 'Below Target' : 'Critical'}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
