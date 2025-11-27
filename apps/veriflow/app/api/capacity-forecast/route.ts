import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get current capacity forecasts
    const forecasts = await prisma.capacityForecast.findMany({
      orderBy: {
        date: 'asc',
      },
    });

    // Get historical data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const historicalChecks = await prisma.verificationCheck.groupBy({
      by: ['requestedAt'],
      where: {
        requestedAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: {
        id: true,
      },
    });

    // Get current staff count
    const activeStaffCount = await prisma.staffMember.count({
      where: { isActive: true },
    });

    // Process historical data into daily format
    const historicalData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayData = historicalChecks.find(check => 
        new Date(check.requestedAt as Date).toDateString() === date.toDateString()
      );
      
      historicalData.push({
        date: date.toISOString().split('T')[0],
        actual: dayData?._count.id || 0,
        expected: activeStaffCount * 10, // 10 checks per staff
        type: 'historical',
      });
    }

    // Process forecast data
    const forecastData = forecasts.map(forecast => ({
      date: forecast.date.toISOString().split('T')[0],
      expected: forecast.expectedCapacity,
      actual: forecast.actualCapacity,
      expectedStaff: forecast.expectedStaff,
      type: 'forecast',
    }));

    // Calculate capacity metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayForecast = forecasts.find(f => 
      f.date.toDateString() === today.toDateString()
    );

    const nextWeekForecasts = forecasts.filter(f => {
      const forecastDate = new Date(f.date);
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return forecastDate <= weekFromNow;
    });

    const next30DaysForecasts = forecasts;

    const capacityMetrics = {
      currentStaff: activeStaffCount,
      dailyCapacity: Math.round(activeStaffCount * 10),
      todayExpected: todayForecast?.expectedCapacity || Math.round(activeStaffCount * 10),
      todayActual: todayForecast?.actualCapacity || 0,
      weeklyExpected: Math.round(nextWeekForecasts.reduce((sum, f) => sum + f.expectedCapacity, 0)),
      weeklyActual: Math.round(nextWeekForecasts.reduce((sum, f) => sum + (f.actualCapacity || 0), 0) * 10) / 10,
      monthlyExpected: Math.round(next30DaysForecasts.reduce((sum, f) => sum + f.expectedCapacity, 0)),
      monthlyActual: Math.round(next30DaysForecasts.reduce((sum, f) => sum + (f.actualCapacity || 0), 0) * 10) / 10,
      utilizationRate: todayForecast ? 
        Math.round(((todayForecast.actualCapacity || 0) / todayForecast.expectedCapacity) * 100) : 0,
    };

    // Staffing recommendations
    const staffingRecommendations = [];
    const avgDailyChecks = historicalData.reduce((sum, d) => sum + d.actual, 0) / historicalData.length;
    
    if (avgDailyChecks > capacityMetrics.dailyCapacity * 0.9) {
      staffingRecommendations.push({
        type: 'warning',
        message: 'Current staffing may be insufficient based on recent demand',
        recommendation: 'Consider adding 1-2 staff members',
      });
    } else if (avgDailyChecks < capacityMetrics.dailyCapacity * 0.5) {
      staffingRecommendations.push({
        type: 'info',
        message: 'Current staffing exceeds demand',
        recommendation: 'Consider optimizing staff allocation',
      });
    } else {
      staffingRecommendations.push({
        type: 'success',
        message: 'Staffing levels appear appropriate for current demand',
        recommendation: 'Maintain current staffing levels',
      });
    }

    return NextResponse.json({
      historicalData,
      forecastData,
      capacityMetrics,
      staffingRecommendations,
    });
  } catch (error) {
    console.error('Error fetching capacity forecast:', error);
    return NextResponse.json(
      { error: 'Failed to fetch capacity forecast' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, expectedStaff, notes } = body;

    // Validate required fields
    if (!date || !expectedStaff) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate expected capacity (10 checks per staff)
    const expectedCapacity = Math.round(expectedStaff * 10);

    // Find existing forecast or create new one
    const existingForecast = await prisma.capacityForecast.findFirst({
      where: {
        date: new Date(date),
      },
    });

    let forecast;
    if (existingForecast) {
      // Update existing
      forecast = await prisma.capacityForecast.update({
        where: {
          id: existingForecast.id,
        },
        data: {
          expectedStaff,
          expectedCapacity,
          notes: notes || null,
        },
      });
    } else {
      // Create new
      forecast = await prisma.capacityForecast.create({
        data: {
          date: new Date(date),
          expectedStaff,
          expectedCapacity,
          notes: notes || null,
        },
      });
    }

    return NextResponse.json(forecast);
  } catch (error) {
    console.error('Error updating capacity forecast:', error);
    return NextResponse.json(
      { error: 'Failed to update capacity forecast' },
      { status: 500 }
    );
  }
}
