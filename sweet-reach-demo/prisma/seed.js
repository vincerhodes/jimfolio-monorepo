const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Start aggressive seeding ...');
  
  // 1. Users (Ensure they exist)
  const users = [
    { email: 'sarah.jenkins@sweetreach.com', name: 'Sarah Jenkins', role: 'MANAGER', team: 'Management' },
    { email: 'kenji.sato@sweetreach.com', name: 'Kenji Sato', role: 'OFFICER', team: 'Outreach - Japan' },
    { email: 'amelie.dubois@sweetreach.com', name: 'Amelie Dubois', role: 'OFFICER', team: 'Outreach - France' },
    { email: 'lucas.silva@sweetreach.com', name: 'Lucas Silva', role: 'OFFICER', team: 'Outreach - Brazil' },
    { email: 'priya.kapoor@sweetreach.com', name: 'Priya Kapoor', role: 'OFFICER', team: 'Outreach - India' },
    { email: 'david.chen@sweetreach.com', name: 'David Chen', role: 'STAKEHOLDER', team: 'NPD' },
    { email: 'maria.gonzalez@sweetreach.com', name: 'Maria Gonzalez', role: 'STAKEHOLDER', team: 'Sales' },
    { email: 'james.wilson@sweetreach.com', name: 'James Wilson', role: 'STAKEHOLDER', team: 'Supply Chain' },
    { email: 'elena.rodriguez@sweetreach.com', name: 'Elena Rodriguez', role: 'STAKEHOLDER', team: 'Marketing' },
  ];

  const userIds = [];
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, avatar: `https://i.pravatar.cc/150?u=${u.email.split('@')[0]}` },
    });
    userIds.push(user.id);
  }

  // 2. Generators
  const teams = ['NPD', 'Marketing', 'Sales', 'Supply Chain', 'HR', 'Logistics', 'Packaging'];
  const topics = ['Flavor Profiles', 'Packaging Innovation', 'Competitor Activity', 'Regulatory Change', 'Sustainability', 'Consumer Lifestyle'];
  const countries = ['Asia Pacific', 'Europe', 'Africa & Middle East', 'Americas'];
  const types = ['OBSERVATION', 'ITN', 'ACTION'];
  const statuses = ['NEW', 'REVIEWED', 'ACTIONED', 'CLOSED'];
  
  const adjs = ['Rapid', 'Surprising', 'Critical', 'Emerging', 'Declining', 'Stable', 'Viral', 'Hidden'];
  const nouns = ['Trend', 'Shift', 'Shortage', 'Opportunity', 'Risk', 'Competitor', 'Regulation', 'Demand'];
  const subjects = ['Dark Chocolate', 'Vegan Gummies', 'Spicy Chips', 'Sugar Tax', 'Plastic Wraps', 'TikTok Trends', 'Supply Chain', 'Cocoa Prices'];

  // 3. Generate 50 Random Insights
  console.log('Generating 50 random insights...');
  for (let i = 0; i < 50; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const team = teams[Math.floor(Math.random() * teams.length)];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const country = countries[Math.floor(Math.random() * countries.length)];
    const authorId = userIds[Math.floor(Math.random() * userIds.length)];
    
    const title = `${adjs[Math.floor(Math.random() * adjs.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}: ${subjects[Math.floor(Math.random() * subjects.length)]} - ${i}`;
    
    const insight = await prisma.insight.create({
      data: {
        title: title,
        description: `Detailed analysis of ${title.toLowerCase()} observed in ${country}. This has potential impact on our ${team} strategy.`,
        type: type,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        teamTag: team,
        topicTag: topic,
        country: country,
        authorId: authorId,
        date: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)) // Random date last 90 days
      }
    });

    // If ACTION, create an action 80% of the time
    if (type === 'ACTION' && Math.random() > 0.2) {
      await prisma.action.create({
        data: {
          description: `Mitigate risk or capitalize on ${title}`,
          status: ['PENDING', 'IN_PROGRESS', 'COMPLETED'][Math.floor(Math.random() * 3)],
          assignedTo: `${team} Director`,
          dueDate: new Date(Date.now() + Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
          insightId: insight.id
        }
      });
    }
    
    // Add some reviews randomly
    if (Math.random() > 0.6) {
      await prisma.review.create({
        data: {
          content: ['Excellent observation.', 'We should monitor this.', 'Agreed, adding to roadmap.', 'Good catch.'][Math.floor(Math.random() * 4)],
          managerId: userIds[0], // Sarah
          insightId: insight.id
        }
      });
    }

    // Add some feedback randomly (Stakeholders rating insights)
    if (Math.random() > 0.4) {
      // Pick a random stakeholder (indices 5-8 in our user list)
      const stakeholderId = userIds[Math.floor(Math.random() * 4) + 5];
      await prisma.feedback.create({
        data: {
          rating: Math.floor(Math.random() * 3) + 3, // 3 to 5 stars
          comment: ['Very useful.', 'Relevant to my market.', 'Thanks for sharing.', 'Need more details.'][Math.floor(Math.random() * 4)],
          userId: stakeholderId,
          insightId: insight.id
        }
      });
    }
  }
  
  // 4. Generate Subscriptions for Users
  console.log('Generating user subscriptions...');
  for (const userId of userIds) {
    // Pick 2-3 random topics
    const shuffledTopics = [...topics].sort(() => 0.5 - Math.random());
    const userTopics = shuffledTopics.slice(0, Math.floor(Math.random() * 2) + 2); // 2 or 3 topics
    
    for (const topic of userTopics) {
      // Check if exists
      const subExists = await prisma.subscription.findFirst({ where: { userId, topic } });
      if (!subExists) {
        await prisma.subscription.create({
          data: { userId, topic }
        });
      }
    }
  }
  
  console.log('Seeding completed. 50+ items added.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
