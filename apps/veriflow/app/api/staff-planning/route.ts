import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get staff productivity data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const staffMembers = await prisma.staffMember.findMany({
      where: { isActive: true },
      include: {
        productivity: {
          where: {
            date: {
              gte: thirtyDaysAgo,
            },
          },
          orderBy: {
            date: 'desc',
          },
        },
        checks: {
          where: {
            requestedAt: {
              gte: thirtyDaysAgo,
            },
          },
        },
      },
    });

    // Calculate planning metrics with proper rounding
    const staffPlanningData = staffMembers.map((member: any) => {
      const recentProductivity = member.productivity[0]; // Most recent day
      const avgProductiveHours = member.productivity.length > 0 
        ? Math.round((member.productivity.reduce((sum: any, p: any) => sum + p.productiveHours, 0) / member.productivity.length) * 10) / 10
        : 7.0;

      const recentChecks = member.checks.filter((check: any) => 
        check.requestedAt >= new Date(new Date().setHours(0, 0, 0, 0))
      ).length;

      const weeklyChecks = member.checks.filter((check: any) =>
        check.requestedAt >= new Date(new Date().setDate(new Date().getDate() - 7))
      ).length;

      const monthlyChecks = member.checks.length;

      const adjustedBenchmark = recentProductivity 
        ? Math.round(10 * recentProductivity.benchmarkAdjustment)
        : 10;

      const todayPerformance = Math.round((recentChecks / adjustedBenchmark) * 100);
      const weeklyPerformance = Math.round((weeklyChecks / (adjustedBenchmark * 7)) * 100);
      const monthlyPerformance = Math.round((monthlyChecks / (adjustedBenchmark * 30)) * 100);

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        todayChecks: recentChecks,
        weeklyChecks,
        monthlyChecks,
        adjustedBenchmark,
        todayPerformance,
        weeklyPerformance,
        monthlyPerformance,
        avgProductiveHours,
        recentProductiveHours: Math.round((recentProductivity?.productiveHours || 7) * 10) / 10,
        recentTotalHours: Math.round((recentProductivity?.totalHours || 7) * 10) / 10,
        productivityTrend: member.productivity.slice(0, 7).reverse().map((p: any) => ({
          date: p.date.toISOString().split('T')[0],
          productiveHours: Math.round(p.productiveHours * 10) / 10,
          totalHours: Math.round(p.totalHours * 10) / 10,
          benchmarkAdjustment: Math.round(p.benchmarkAdjustment * 10) / 10,
        })),
      };
    });

    // Team aggregates with proper rounding
    const teamMetrics = {
      totalStaff: staffMembers.length,
      avgProductiveHours: Math.round((staffPlanningData.reduce((sum: any, s: any) => sum + s.avgProductiveHours, 0) / staffPlanningData.length) * 10) / 10,
      totalTodayChecks: staffPlanningData.reduce((sum: any, s: any) => sum + s.todayChecks, 0),
      totalWeeklyChecks: staffPlanningData.reduce((sum: any, s: any) => sum + s.weeklyChecks, 0),
      totalMonthlyChecks: staffPlanningData.reduce((sum: any, s: any) => sum + s.monthlyChecks, 0),
      staffAtTarget: staffPlanningData.filter((s: any) => s.todayPerformance >= 100).length,
      staffBelowTarget: staffPlanningData.filter((s: any) => s.todayPerformance < 80).length,
    };

    return NextResponse.json({
      staffData: staffPlanningData,
      teamMetrics,
    });
  } catch (error) {
    console.error('Error fetching staff planning data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff planning data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { staffMemberId, date, productiveHours, totalHours } = body;

    // Validate required fields
    if (!staffMemberId || !date || productiveHours === undefined || totalHours === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate benchmark adjustment
    const benchmarkAdjustment = productiveHours / 7; // Based on 7-hour work day

    // Create or update productivity record
    const productivity = await prisma.dailyProductivity.upsert({
      where: {
        staffMemberId_date: {
          staffMemberId,
          date: new Date(date),
        },
      },
      update: {
        productiveHours,
        totalHours,
        benchmarkAdjustment,
      },
      create: {
        staffMemberId,
        date: new Date(date),
        productiveHours,
        totalHours,
        benchmarkAdjustment,
      },
    });

    return NextResponse.json(productivity);
  } catch (error) {
    console.error('Error updating productivity:', error);
    return NextResponse.json(
      { error: 'Failed to update productivity' },
      { status: 500 }
    );
  }
}
