'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CapacityForecastChart } from '@/components/charts/CapacityForecastChart';
import { Users, TrendingUp, AlertCircle, Calendar, Target, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface CapacityData {
  date: string;
  actual?: number;
  expected: number;
  type: 'historical' | 'forecast';
}

interface CapacityMetrics {
  currentStaff: number;
  dailyCapacity: number;
  todayExpected: number;
  todayActual: number;
  weeklyExpected: number;
  weeklyActual: number;
  monthlyExpected: number;
  monthlyActual: number;
  utilizationRate: number;
}

interface StaffingRecommendation {
  type: 'warning' | 'info' | 'success';
  message: string;
  recommendation: string;
}

export default function CapacityForecastPage() {
  const [historicalData, setHistoricalData] = useState<CapacityData[]>([]);
  const [forecastData, setForecastData] = useState<CapacityData[]>([]);
  const [capacityMetrics, setCapacityMetrics] = useState<CapacityMetrics | null>(null);
  const [staffingRecommendations, setStaffingRecommendations] = useState<StaffingRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStaffingForm, setShowStaffingForm] = useState(false);
  const [staffingForm, setStaffingForm] = useState({
    date: '',
    expectedStaff: 1,
    notes: '',
  });

  useEffect(() => {
    fetchCapacityData();
  }, []);

  const fetchCapacityData = async () => {
    try {
      const response = await fetch('/api/capacity-forecast');
      if (response.ok) {
        const data = await response.json();
        setHistoricalData(data.historicalData);
        setForecastData(data.forecastData);
        setCapacityMetrics(data.capacityMetrics);
        setStaffingRecommendations(data.staffingRecommendations);
      }
    } catch (error) {
      console.error('Error fetching capacity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStaffingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/capacity-forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(staffingForm),
      });

      if (response.ok) {
        setShowStaffingForm(false);
        setStaffingForm({ date: '', expectedStaff: 1, notes: '' });
        fetchCapacityData(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating staffing:', error);
    }
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info': return <Info className="h-5 w-5 text-blue-600" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      default: return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  // Combine historical and forecast data for chart
  const combinedData = [...historicalData, ...forecastData];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Capacity Forecast</h1>
        <div className="text-center py-8">
          <p className="text-gray-600">Loading capacity forecast data...</p>
        </div>
      </div>
    );
  }

  if (!capacityMetrics) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Capacity Forecast</h1>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load capacity forecast data</p>
          <Button onClick={fetchCapacityData} className="mt-4">
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
          <h1 className="text-2xl font-bold text-gray-900">Capacity Forecast</h1>
          <p className="text-gray-600">Plan staffing levels and forecast capacity for the next 30 days</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchCapacityData}>
            Refresh Data
          </Button>
          <Button onClick={() => setShowStaffingForm(true)}>
            Update Staffing
          </Button>
        </div>
      </div>

      {/* Capacity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Current Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{capacityMetrics.currentStaff}</div>
            <div className="text-sm text-gray-600">
              {capacityMetrics.dailyCapacity} daily capacity
            </div>
            <div className="mt-2 text-sm text-gray-500">
              10 checks per staff member
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Today's Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {capacityMetrics.utilizationRate.toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">
              {capacityMetrics.todayActual} / {capacityMetrics.todayExpected} checks
            </div>
            <div className={`mt-2 text-sm ${getUtilizationColor(capacityMetrics.utilizationRate)}`}>
              {capacityMetrics.utilizationRate >= 90 ? 'High utilization' :
               capacityMetrics.utilizationRate >= 70 ? 'Moderate utilization' : 'Low utilization'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Weekly Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {capacityMetrics.weeklyExpected}
            </div>
            <div className="text-sm text-gray-600">
              Expected capacity
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {capacityMetrics.weeklyActual} actual so far
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              Monthly Outlook
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {capacityMetrics.monthlyExpected}
            </div>
            <div className="text-sm text-gray-600">
              30-day forecast
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {(capacityMetrics.monthlyExpected / 30).toFixed(0)} daily average
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staffing Recommendations */}
      {staffingRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Staffing Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {staffingRecommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  {getRecommendationIcon(rec.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{rec.message}</p>
                    <p className="text-sm text-gray-600 mt-1">{rec.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Capacity Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle>30-Day Capacity Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <CapacityForecastChart data={combinedData} />
          <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-200 rounded"></div>
              <span>Expected Capacity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Actual Capacity</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staffing Update Form Modal */}
      {showStaffingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Update Staffing Forecast</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowStaffingForm(false)}
                >
                  Cancel
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStaffingSubmit} className="space-y-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={staffingForm.date}
                    onChange={(e) => setStaffingForm(prev => ({ ...prev, date: e.target.value }))}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="pp-input"
                  />
                </div>

                <div>
                  <label htmlFor="expectedStaff" className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Staff Count
                  </label>
                  <input
                    type="number"
                    id="expectedStaff"
                    value={staffingForm.expectedStaff}
                    onChange={(e) => setStaffingForm(prev => ({ ...prev, expectedStaff: parseInt(e.target.value) }))}
                    required
                    min="1"
                    max="20"
                    className="pp-input"
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    value={staffingForm.notes}
                    onChange={(e) => setStaffingForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="pp-input"
                    placeholder="Any notes about this staffing change..."
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowStaffingForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Update Forecast
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
