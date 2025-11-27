'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProductivityChart } from '@/components/charts/ProductivityChart';
import { Users, Clock, TrendingUp, AlertCircle, Calendar, Target } from 'lucide-react';
import Link from 'next/link';

interface StaffData {
  id: string;
  name: string;
  email: string;
  role: string;
  todayChecks: number;
  weeklyChecks: number;
  monthlyChecks: number;
  adjustedBenchmark: number;
  todayPerformance: number;
  weeklyPerformance: number;
  monthlyPerformance: number;
  avgProductiveHours: number;
  recentProductiveHours: number;
  recentTotalHours: number;
  productivityTrend: Array<{
    date: string;
    productiveHours: number;
    totalHours: number;
    benchmarkAdjustment: number;
  }>;
}

interface TeamMetrics {
  totalStaff: number;
  avgProductiveHours: number;
  totalTodayChecks: number;
  totalWeeklyChecks: number;
  totalMonthlyChecks: number;
  staffAtTarget: number;
  staffBelowTarget: number;
}

export default function StaffPlanningPage() {
  const [staffData, setStaffData] = useState<StaffData[]>([]);
  const [teamMetrics, setTeamMetrics] = useState<TeamMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<StaffData | null>(null);

  useEffect(() => {
    fetchStaffPlanningData();
  }, []);

  const fetchStaffPlanningData = async () => {
    try {
      const response = await fetch('/api/staff-planning');
      if (response.ok) {
        const data = await response.json();
        setStaffData(data.staffData);
        setTeamMetrics(data.teamMetrics);
      }
    } catch (error) {
      console.error('Error fetching staff planning data:', error);
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
        <h1 className="text-2xl font-bold text-gray-900">Staff Planning</h1>
        <div className="text-center py-8">
          <p className="text-gray-600">Loading staff planning data...</p>
        </div>
      </div>
    );
  }

  if (!teamMetrics) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Staff Planning</h1>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load staff planning data</p>
          <Button onClick={fetchStaffPlanningData} className="mt-4">
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
          <h1 className="text-2xl font-bold text-gray-900">Staff Planning</h1>
          <p className="text-gray-600">Monitor staff productivity and performance against benchmarks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchStaffPlanningData}>
            Refresh Data
          </Button>
          <Link href="/management/capacity-forecast">
            <Button>Capacity Forecast</Button>
          </Link>
        </div>
      </div>

      {/* Team Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Total Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{teamMetrics.totalStaff}</div>
            <div className="text-sm text-gray-600">
              {teamMetrics.staffAtTarget} at target
            </div>
            <div className="mt-2 text-sm text-red-600">
              {teamMetrics.staffBelowTarget} below target
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Avg Productivity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {teamMetrics.avgProductiveHours.toFixed(1)}h
            </div>
            <div className="text-sm text-gray-600">
              Per day average
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Based on 7-hour work day
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Today's Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {teamMetrics.totalTodayChecks}
            </div>
            <div className="text-sm text-gray-600">
              Checks completed
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {teamMetrics.totalWeeklyChecks} this week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              Monthly Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {teamMetrics.totalMonthlyChecks}
            </div>
            <div className="text-sm text-gray-600">
              Total this month
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {(teamMetrics.totalMonthlyChecks / teamMetrics.totalStaff).toFixed(0)} per staff
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="pp-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Role</th>
                  <th>Today</th>
                  <th>This Week</th>
                  <th>This Month</th>
                  <th>Benchmark</th>
                  <th>Productivity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffData.map((staff) => (
                  <tr key={staff.id}>
                    <td className="font-medium">{staff.name}</td>
                    <td>{staff.role.replace('_', ' ')}</td>
                    <td className={getPerformanceColor(staff.todayPerformance)}>
                      {staff.todayChecks} ({staff.todayPerformance.toFixed(0)}%)
                    </td>
                    <td className={getPerformanceColor(staff.weeklyPerformance)}>
                      {staff.weeklyChecks} ({staff.weeklyPerformance.toFixed(0)}%)
                    </td>
                    <td className={getPerformanceColor(staff.monthlyPerformance)}>
                      {staff.monthlyChecks} ({staff.monthlyPerformance.toFixed(0)}%)
                    </td>
                    <td>{staff.adjustedBenchmark.toFixed(1)}/day</td>
                    <td>{staff.recentProductiveHours}h / {staff.recentTotalHours}h</td>
                    <td>
                      <StatusBadge status={getPerformanceBadge(staff.todayPerformance)}>
                        {staff.todayPerformance >= 100 ? 'On Target' : 
                         staff.todayPerformance >= 80 ? 'Below Target' : 'Critical'}
                      </StatusBadge>
                    </td>
                    <td>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedStaff(staff)}
                      >
                        View Trend
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Staff Productivity Trend Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Productivity Trend - {selectedStaff.name}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedStaff(null)}
                >
                  Close
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {selectedStaff.avgProductiveHours.toFixed(1)}h
                    </div>
                    <div className="text-sm text-gray-600">Avg Productive Hours</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {selectedStaff.adjustedBenchmark.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Daily Benchmark</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {selectedStaff.todayPerformance.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">Today's Performance</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">7-Day Productivity Trend</h3>
                  <ProductivityChart 
                    data={selectedStaff.productivityTrend} 
                    type="bar"
                  />
                </div>

                <div className="text-sm text-gray-600">
                  <p><strong>Note:</strong> Benchmark is adjusted based on productive hours. A 7-hour productive day equals 100% benchmark (10 checks/day).</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
