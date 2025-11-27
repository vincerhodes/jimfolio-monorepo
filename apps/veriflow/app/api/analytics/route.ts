import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get team performance metrics
    const staffMembers = await prisma.staffMember.findMany({
      where: { isActive: true },
      include: {
        checks: {
          where: {
            requestedAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)), // Today
            },
          },
        },
        productivity: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)), // Today
            },
          },
        },
      },
    });

    // Get today's check metrics
    const todayChecks = await prisma.verificationCheck.findMany({
      where: {
        requestedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    // Get weekly metrics
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weeklyChecks = await prisma.verificationCheck.findMany({
      where: {
        requestedAt: {
          gte: weekStart,
        },
      },
    });

    // Calculate metrics with proper rounding
    const todayTotal = todayChecks.length;
    const todayCompleted = todayChecks.filter(c => c.status === 'COMPLETED').length;
    const weeklyTotal = weeklyChecks.length;
    const weeklyCompleted = weeklyChecks.filter(c => c.status === 'COMPLETED').length;

    // Daily benchmark (10 checks per staff member)
    const activeStaffCount = staffMembers.length;
    const dailyBenchmark = Math.round(activeStaffCount * 10);
    const weeklyBenchmark = Math.round(dailyBenchmark * 7);

    // Staff performance with proper rounding
    const staffPerformance = staffMembers.map(member => {
      const todayCheckCount = member.checks.length;
      const productivity = member.productivity[0];
      const productiveHours = Math.round((productivity?.productiveHours || 7) * 10) / 10;
      const benchmarkAdjustment = productivity?.benchmarkAdjustment || 1;
      const adjustedBenchmark = Math.round(10 * benchmarkAdjustment);
      const performancePercentage = Math.round((todayCheckCount / adjustedBenchmark) * 100);

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        todayChecks: todayCheckCount,
        adjustedBenchmark,
        performancePercentage,
        productiveHours,
        totalHours: Math.round((productivity?.totalHours || 7) * 10) / 10,
        productivityPercentage: Math.round((productiveHours / (productivity?.totalHours || 7)) * 100),
      };
    });

    // Result distribution
    const resultDistribution = todayChecks.reduce((acc, check) => {
      if (check.result) {
        acc[check.result] = (acc[check.result] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Throughput data for last 7 days
    const throughputData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayChecks = await prisma.verificationCheck.count({
        where: {
          requestedAt: {
            gte: date,
            lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      });

      throughputData.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        checks: dayChecks,
        benchmark: dailyBenchmark,
      });
    }

    const analytics = {
      overview: {
        todayTotal,
        todayCompleted,
        weeklyTotal,
        weeklyCompleted,
        dailyBenchmark,
        weeklyBenchmark,
        activeStaffCount,
        todayUtilization: Math.round((todayTotal / dailyBenchmark) * 100),
        weeklyUtilization: Math.round((weeklyTotal / weeklyBenchmark) * 100),
      },
      staffPerformance,
      resultDistribution,
      throughputData,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
