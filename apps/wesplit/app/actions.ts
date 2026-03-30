'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { verifyAppPassword, getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

function parseDateInput(dateInput: string): Date {
  const [year, month, day] = dateInput.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function parseExpenseFormData(formData: FormData) {
  const id = (formData.get('id') as string)?.trim();
  const description = (formData.get('description') as string)?.trim();
  const amountStr = formData.get('amount') as string;
  const paidBy = (formData.get('paidBy') as string)?.toLowerCase().trim();
  const date = (formData.get('date') as string)?.trim();
  const splitWith = formData.getAll('splitWith').map(value => String(value).toLowerCase().trim());

  const amount = Number.parseFloat(amountStr);

  if (!description || !paidBy || !date || !splitWith.length || Number.isNaN(amount) || amount <= 0) {
    return { error: 'Please fill in all fields correctly' };
  }

  return {
    id,
    description,
    amount,
    paidBy,
    date: parseDateInput(date),
    splitWith,
  };
}

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

  const parsed = parseExpenseFormData(formData);
  if ('error' in parsed) {
    return parsed;
  }

  await prisma.expense.create({
    data: {
      description: parsed.description,
      amount: parsed.amount,
      paidBy: parsed.paidBy,
      splitWith: JSON.stringify(parsed.splitWith),
      date: parsed.date,
    },
  });

  revalidatePath('/', 'layout');
}

export async function editExpenseAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const parsed = parseExpenseFormData(formData);
  if ('error' in parsed) {
    return parsed;
  }

  if (!parsed.id) {
    return { error: 'Missing expense id' };
  }

  await prisma.expense.update({
    where: { id: parsed.id },
    data: {
      description: parsed.description,
      amount: parsed.amount,
      paidBy: parsed.paidBy,
      splitWith: JSON.stringify(parsed.splitWith),
      date: parsed.date,
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
