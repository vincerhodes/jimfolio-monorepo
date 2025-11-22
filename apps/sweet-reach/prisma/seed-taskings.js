const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding taskings...');

    const taskings = [
        {
            title: 'Analyze Q3 Market Trends',
            description: 'Conduct a deep dive into the Q3 market trends for the APAC region, focusing on consumer electronics and software services.',
            requestingTeam: 'Strategy',
            deadline: new Date('2025-12-31'),
            status: 'OPEN',
        },
        {
            title: 'Competitor Feature Review',
            description: 'Review the latest features released by our top 3 competitors and identify gaps in our current product offering.',
            requestingTeam: 'Product',
            deadline: new Date('2025-11-30'),
            status: 'OPEN',
        },
        {
            title: 'Customer Feedback Synthesis',
            description: 'Synthesize the last month of customer feedback from the support portal to identify recurring pain points.',
            requestingTeam: 'Customer Success',
            deadline: new Date('2025-12-15'),
            status: 'OPEN',
        },
        {
            title: 'Emerging Tech Radar',
            description: 'Scout for emerging technologies in the AI space that could be leveraged for our next roadmap planning cycle.',
            requestingTeam: 'Innovation',
            deadline: new Date('2026-01-15'),
            status: 'OPEN',
        },
    ];

    for (const task of taskings) {
        const result = await prisma.tasking.create({
            data: task,
        });
        console.log(`Created tasking with id: ${result.id}`);
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
