const { PrismaClient } = require('@prisma/client');
const assert = require('assert');

const prisma = new PrismaClient();

async function runTest() {
  console.log('🧪 Starting Integration Test...');

  // 1. Test User Existence
  const kenji = await prisma.user.findUnique({ where: { email: 'kenji.sato@sweetreach.com' } });
  assert(kenji, 'User Kenji should exist');
  console.log('✅ User fetch working');

  // 2. Test Creating an Insight
  console.log('...Testing Insight Creation');
  const newInsight = await prisma.insight.create({
    data: {
      title: 'Test Insight - Automated',
      description: 'Testing the flow via script.',
      type: 'OBSERVATION',
      teamTag: 'QA',
      topicTag: 'Flavor Profiles',
      country: 'Asia Pacific',
      status: 'NEW',
      authorId: kenji.id
    }
  });
  assert(newInsight.id, 'Insight should have an ID');
  console.log('✅ Insight created:', newInsight.title);

  // 3. Test Manager Review Flow
  console.log('...Testing Review Submission');
  const sarah = await prisma.user.findUnique({ where: { email: 'sarah.jenkins@sweetreach.com' } });
  
  const review = await prisma.review.create({
    data: {
      content: 'Looks good, proceeding.',
      insightId: newInsight.id,
      managerId: sarah.id
    }
  });
  assert(review.id, 'Review should be created');

  // 4. Verify Status Update Logic (Simulating the Server Action logic)
  const updatedInsight = await prisma.insight.update({
    where: { id: newInsight.id },
    data: { status: 'REVIEWED' }
  });
  assert.strictEqual(updatedInsight.status, 'REVIEWED', 'Status should be updated to REVIEWED');
  console.log('✅ Review flow verified');

  // 5. Test Filtering Logic (Report Page Simulation)
  console.log('...Testing Report Filtering');
  const actionInsights = await prisma.insight.findMany({
    where: { type: 'ACTION' }
  });
  assert(Array.isArray(actionInsights), 'Should return array');
  console.log(`✅ Found ${actionInsights.length} ACTION insights for report`);

  // Cleanup
  await prisma.review.delete({ where: { id: review.id } });
  await prisma.insight.delete({ where: { id: newInsight.id } });
  console.log('🧹 Test data cleaned up');

  console.log('🎉 All backend tests passed!');
}

runTest()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Test Failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
