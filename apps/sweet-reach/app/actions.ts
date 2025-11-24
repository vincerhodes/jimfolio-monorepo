'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createInsight(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const type = formData.get('type') as string;
  const team = formData.get('team') as string;
  const topic = formData.get('topic') as string;
  const country = formData.get('country') as string;
  const taskingId = formData.get('taskingId') as string | null;

  // Hardcoded author for demo
  const authorEmail = 'kenji.sato@sweetreach.com';
  const user = await prisma.user.findUnique({ where: { email: authorEmail } });

  if (!user) {
    // Create the user if they don't exist (for demo resilience)
    await prisma.user.create({
      data: {
        email: authorEmail,
        name: 'Kenji Sato',
        role: 'OFFICER',
        team: 'Outreach - Japan',
        avatar: null
      }
    });
  }

  // Re-fetch to be sure
  const validUser = await prisma.user.findUnique({ where: { email: authorEmail } });
  if (!validUser) throw new Error('Failed to find or create user');

  await prisma.insight.create({
    data: {
      title,
      description,
      type,
      teamTag: team,
      topicTag: topic,
      country,
      status: 'NEW',
      authorId: validUser.id,
      taskingId: taskingId || undefined,
    }
  });

  revalidatePath('/insights');
  revalidatePath('/');
  redirect('/insights');
}

export async function submitReview(formData: FormData) {
  const insightId = formData.get('insightId') as string;
  const content = formData.get('content') as string;

  const managerEmail = 'sarah.jenkins@sweetreach.com';
  const manager = await prisma.user.findUnique({ where: { email: managerEmail } });

  if (!manager) {
    // Create Sarah if missing
    await prisma.user.create({
      data: {
        email: managerEmail,
        name: 'Sarah Jenkins',
        role: 'MANAGER',
        team: 'Management',
        avatar: null
      }
    });
  }

  const validManager = await prisma.user.findUnique({ where: { email: managerEmail } });
  if (!validManager) throw new Error('Manager creation failed');

  await prisma.review.create({
    data: {
      content,
      insightId,
      managerId: validManager.id
    }
  });

  // Update status to REVIEWED
  await prisma.insight.update({
    where: { id: insightId },
    data: { status: 'REVIEWED' }
  });

  revalidatePath(`/insights/${insightId}`);
}

export async function submitFeedback(formData: FormData) {
  const insightId = formData.get('insightId') as string;
  const rating = parseInt(formData.get('rating') as string);
  const comment = formData.get('comment') as string;

  // Simulating a receiver providing feedback
  const receiverEmail = 'david.chen@sweetreach.com';
  const user = await prisma.user.findUnique({ where: { email: receiverEmail } });

  if (!user) {
    await prisma.user.create({
      data: {
        email: receiverEmail,
        name: 'David Chen',
        role: 'STAKEHOLDER',
        team: 'NPD',
        avatar: null
      }
    });
  }

  const validUser = await prisma.user.findUnique({ where: { email: receiverEmail } });
  if (!validUser) throw new Error('User creation failed');

  await prisma.feedback.create({
    data: {
      rating,
      comment,
      insightId,
      userId: validUser.id
    }
  });

  revalidatePath(`/insights/${insightId}`);
}

export async function toggleSubscription(formData: FormData) {
  const topic = formData.get('topic') as string;
  const subscribed = formData.get('subscribed') === 'true';

  const userEmail = 'sarah.jenkins@sweetreach.com'; // Demo user
  const user = await prisma.user.findUnique({ where: { email: userEmail } });

  if (!user) throw new Error('User not found');

  if (subscribed) {
    // Unsubscribe
    await prisma.subscription.deleteMany({
      where: { userId: user.id, topic }
    });
  } else {
    // Subscribe
    await prisma.subscription.create({
      data: { userId: user.id, topic }
    });
  }

  revalidatePath('/digest');
}

export async function submitAppFeedback(formData: FormData) {
  const rating = parseInt(formData.get('rating') as string);
  const comment = formData.get('comment') as string;
  const name = formData.get('name') as string;

  await prisma.appFeedback.create({
    data: {
      rating,
      comment,
      name
    }
  });

  redirect('/app-feedback?success=true');
}

export async function createTasking(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const requestingTeam = formData.get('requestingTeam') as string;
  const deadline = formData.get('deadline') as string;

  await prisma.tasking.create({
    data: {
      title,
      description,
      requestingTeam,
      deadline: new Date(deadline),
      status: 'OPEN'
    }
  });

  revalidatePath('/tasking');
}

export async function createAction(formData: FormData) {
  const description = formData.get('description') as string;
  const assignedTo = formData.get('assignedTo') as string;
  const dueDate = formData.get('dueDate') as string;
  const insightId = formData.get('insightId') as string;

  await prisma.action.create({
    data: {
      description,
      assignedTo,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: 'PENDING',
      insightId
    }
  });

  revalidatePath(`/insights/${insightId}`);
}

export async function updateActionStatus(formData: FormData) {
  const actionId = formData.get('actionId') as string;
  const status = formData.get('status') as string;
  const insightId = formData.get('insightId') as string;

  await prisma.action.update({
    where: { id: actionId },
    data: { status }
  });

  revalidatePath(`/insights/${insightId}`);
}
