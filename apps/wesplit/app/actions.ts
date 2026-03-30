'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { verifyAppPassword, getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function loginAction(_prevState: unknown, formData: FormData) {
  const username = (formData.get('username') as string)?.toLowerCase().trim();
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Please fill in all fields' };
  }

  if (!verifyAppPassword(password)) {
    return { error: 'Wrong entry password, please try again' };
  }

  const cookieStore = await cookies();
  cookieStore.set('wesplit_session', username, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 14,
    path: '/',
  });

  redirect('/expenses');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('wesplit_session');
  redirect('/login');
}

export async function addExpenseAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const description = (formData.get('description') as string)?.trim();
  const amountStr = formData.get('amount') as string;
  const paidBy = formData.get('paidBy') as string;
  const splitWith = formData.getAll('splitWith') as string[];

  const amount = parseFloat(amountStr);

  if (!description || !paidBy || isNaN(amount) || amount <= 0 || splitWith.length === 0) {
    return { error: 'Please fill in all fields correctly' };
  }

  await prisma.expense.create({
    data: {
      description,
      amount,
      paidBy,
      splitWith: JSON.stringify(splitWith),
    },
  });

  revalidatePath('/', 'layout');
}

export async function deleteExpenseAction(id: string) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  await prisma.expense.delete({ where: { id } });

  revalidatePath('/', 'layout');
}
