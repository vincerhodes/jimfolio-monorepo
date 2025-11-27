const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper function to generate random date within range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to generate realistic check results
function generateResult() {
  const rand = Math.random();
  if (rand < 0.78) return 'GENUINE';      // 78% genuine
  if (rand < 0.93) return 'INCONCLUSIVE'; // 15% inconclusive
  if (rand < 0.98) return 'FALSE';        // 5% false
  return 'UNABLE_TO_VERIFY';              // 2% unable
}

// Helper function to check if date is weekend
function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

async function main() {
  // Create realistic staff members with varied roles and performance levels
  const teamMembers = [
    // Team Members - varied performance levels
    { name: 'John Smith', email: 'john.smith@veriflow.com', role: 'TEAM_MEMBER', performance: 'high' },
    { name: 'Jane Doe', email: 'jane.doe@veriflow.com', role: 'TEAM_MEMBER', performance: 'average' },
    { name: 'Mike Johnson', email: 'mike.johnson@veriflow.com', role: 'TEAM_MEMBER', performance: 'high' },
    { name: 'Emily Chen', email: 'emily.chen@veriflow.com', role: 'TEAM_MEMBER', performance: 'average' },
    { name: 'Robert Taylor', email: 'robert.taylor@veriflow.com', role: 'TEAM_MEMBER', performance: 'low' },
    { name: 'Lisa Anderson', email: 'lisa.anderson@veriflow.com', role: 'TEAM_MEMBER', performance: 'high' },
    { name: 'James Wilson', email: 'james.wilson@veriflow.com', role: 'TEAM_MEMBER', performance: 'average' },
    { name: 'Maria Garcia', email: 'maria.garcia@veriflow.com', role: 'TEAM_MEMBER', performance: 'average' },
    { name: 'David Martinez', email: 'david.martinez@veriflow.com', role: 'TEAM_MEMBER', performance: 'low' },
    { name: 'Sophie Turner', email: 'sophie.turner@veriflow.com', role: 'TEAM_MEMBER', performance: 'high' },
    
    // Senior Team Members - higher productivity
    { name: 'Thomas Brown', email: 'thomas.brown@veriflow.com', role: 'TEAM_MEMBER', performance: 'senior' },
    { name: 'Amanda White', email: 'amanda.white@veriflow.com', role: 'TEAM_MEMBER', performance: 'senior' },
    
    // Team Leads - management level
    { name: 'Sarah Wilson', email: 'sarah.wilson@veriflow.com', role: 'MANAGER', performance: 'lead' },
    { name: 'Michael Davis', email: 'michael.davis@veriflow.com', role: 'MANAGER', performance: 'lead' },
    
    // Senior Management
    { name: 'David Brown', email: 'david.brown@veriflow.com', role: 'SENIOR_MANAGER', performance: 'executive' },
  ];

  const createdStaff = [];
  for (const member of teamMembers) {
    const created = await prisma.staffMember.upsert({
      where: { email: member.email },
      update: {},
      create: {
        name: member.name,
        email: member.email,
        role: member.role,
      },
    });
    createdStaff.push({ ...created, performance: member.performance });
  }

  // Generate realistic verification checks over 30 days
  const checks = [];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const teamMemberStaff = createdStaff.filter(s => s.role === 'TEAM_MEMBER');
  
  for (let i = 0; i < 280; i++) { // Generate 280 checks over 30 days
    const checkDate = randomDate(thirtyDaysAgo, new Date());
    const staffMember = teamMemberStaff[Math.floor(Math.random() * teamMemberStaff.length)];
    
    // Skip weekends for most checks (realistic work pattern)
    if (isWeekend(checkDate) && Math.random() > 0.1) continue;
    
    // Monday spike pattern
    if (checkDate.getDay() === 1 && Math.random() > 0.3) continue;
    
    const result = generateResult();
    checks.push({
      customerName: `Customer ${i + 1}`,
      documentType: ['Business License', 'Tax Certificate', 'ID Document', 'Financial Statement', 'Insurance Certificate'][Math.floor(Math.random() * 5)],
      status: 'COMPLETED',
      result: result,
      requestedBy: staffMember.email,
      requestedAt: checkDate,
      verifiedBy: staffMember.email,
      verifiedAt: new Date(checkDate.getTime() + Math.random() * 4 * 60 * 60 * 1000), // 0-4 hours later
      notes: result === 'INCONCLUSIVE' ? 'Additional documentation required' : result === 'FALSE' ? 'Document appears fraudulent' : 'Standard verification completed',
    });
  }

  // Add some recent pending checks
  for (let i = 0; i < 15; i++) {
    const staffMember = teamMemberStaff[Math.floor(Math.random() * teamMemberStaff.length)];
    checks.push({
      customerName: `Recent Customer ${i + 1}`,
      documentType: ['Business License', 'Tax Certificate', 'ID Document'][Math.floor(Math.random() * 3)],
      status: 'PENDING',
      requestedBy: staffMember.email,
      requestedAt: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000), // Last 2 hours
    });
  }

  // Generate realistic today's completed checks for better performance metrics
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (const staff of createdStaff.filter(s => s.role === 'TEAM_MEMBER')) {
    const targetChecks = {
      'low': 8,
      'average': 11,
      'high': 14,
      'senior': 16,
      'lead': 7,
    }[staff.performance] || 11;
    
    // Generate 70-90% of target for realistic performance (some still in progress)
    const completedToday = Math.round(targetChecks * (0.7 + Math.random() * 0.2));
    
    for (let i = 0; i < completedToday; i++) {
      const checkTime = new Date(today.getTime() + Math.random() * 10 * 60 * 60 * 1000); // Today's hours
      const result = generateResult();
      
      checks.push({
        customerName: `Today Customer ${staff.name.split(' ')[0]}${i + 1}`,
        documentType: ['Business License', 'Tax Certificate', 'ID Document', 'Financial Statement', 'Insurance Certificate'][Math.floor(Math.random() * 5)],
        status: 'COMPLETED',
        result: result,
        requestedBy: staff.email,
        requestedAt: new Date(checkTime.getTime() - Math.random() * 2 * 60 * 60 * 1000), // Completed within 2 hours
        verifiedBy: staff.email,
        verifiedAt: checkTime,
        notes: result === 'INCONCLUSIVE' ? 'Additional documentation required' : result === 'FALSE' ? 'Document appears fraudulent' : 'Standard verification completed',
      });
    }
  }

  // Insert checks
  for (const check of checks) {
    await prisma.verificationCheck.create({
      data: check,
    });
  }

  // Generate daily productivity data for each staff member
  for (const staff of createdStaff) {
    if (staff.role === 'SENIOR_MANAGER') continue; // Skip exec for productivity
    
    const baseProductivity = {
      'low': 10,
      'average': 13,
      'high': 16,
      'senior': 18,
      'lead': 8, // Less verification, more management
    }[staff.performance] || 13;

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Skip weekends
      if (isWeekend(date)) continue;
      
      // Add realistic variation
      const dailyVariation = Math.random() * 4 - 2; // ±2 checks
      const mondayBoost = date.getDay() === 1 ? 2 : 0;
      const fridayReduction = date.getDay() === 5 ? -1 : 0;
      
      const productiveHours = staff.performance === 'lead' ? 6 : 7 + Math.random() * 2;
      const completedChecks = Math.max(0, baseProductivity + dailyVariation + mondayBoost + fridayReduction);
      
      await prisma.dailyProductivity.create({
        data: {
          staffMemberId: staff.id,
          date: date,
          productiveHours: Math.round(productiveHours * 10) / 10,
          totalHours: staff.performance === 'lead' ? 8.0 : 8.5, // Total hours worked with 1 decimal
          benchmarkAdjustment: staff.performance === 'senior' ? 1.2 : 1.0,
        },
      });
    }
  }

  // Generate capacity forecasts for next 30 days
  const expectedStaff = 12;
  const avgCapacityPerStaff = 8.5;
  
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    // Add realistic variation to forecasts
    const seasonalVariation = Math.sin(i / 7 * Math.PI) * 0.2; // Weekly pattern
    const weekendReduction = isWeekend(date) ? 0.3 : 0;
    
    const expectedCapacity = expectedStaff * avgCapacityPerStaff * (1 + seasonalVariation - weekendReduction);
    const actualCapacity = i < 7 ? expectedCapacity * (0.8 + Math.random() * 0.4) : null; // Historical data with variance
    
    await prisma.capacityForecast.create({
      data: {
        date: date,
        expectedStaff: Math.round(isWeekend(date) ? expectedStaff * 0.5 : expectedStaff),
        expectedCapacity: Math.round(expectedCapacity),
        actualCapacity: actualCapacity ? Math.round(actualCapacity * 10) / 10 : null,
        notes: i === 0 ? 'Current capacity utilization' : i < 7 ? 'Historical data' : 'Projected capacity',
      },
    });
  }

  console.log('✅ Enhanced seed data created successfully!');
  console.log(`📊 Created ${createdStaff.length} staff members`);
  console.log(`📋 Generated ${checks.length} verification checks`);
  console.log(`📈 Added productivity data for ${createdStaff.filter(s => s.role !== 'SENIOR_MANAGER').length} team members`);
  console.log(`🔮 Generated 30-day capacity forecasts`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
