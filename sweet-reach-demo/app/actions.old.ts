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

  if (!user) throw new Error('User not found');

  await prisma.insight.create({
    data: {
      title,
      description,
      type,
      teamTag: team,
      topicTag: topic,
      country,
      status: 'NEW',
      authorId: user.id,
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

  if (!manager) throw new Error('Manager not found');

  await prisma.review.create({
    data: {
      content,
      insightId,
      managerId: manager.id
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

  if (!user) throw new Error('User not found');
  
  await prisma.feedback.create({
    data: {
      rating,
      comment,
      insightId,
      userId: user.id
    }
  });
  
  revalidatePath(`/insights/${insightId}`);
}
