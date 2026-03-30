import { ExpenseWithParsed, PEOPLE } from './types';

export interface Transfer {
  from: string;
  to: string;
  amount: number;
}

export interface PersonSummary {
  paid: number;
  owed: number;
  net: number;
}

export interface Settlement {
  transfers: Transfer[];
  summary: Record<string, PersonSummary>;
}

export function calculateSettlement(expenses: ExpenseWithParsed[]): Settlement {
  const paid: Record<string, number> = {};
  const owed: Record<string, number> = {};

  for (const p of PEOPLE) {
    paid[p] = 0;
    owed[p] = 0;
  }

  for (const expense of expenses) {
    const share = expense.amount / expense.splitWith.length;
    paid[expense.paidBy] += expense.amount;
    for (const person of expense.splitWith) {
      owed[person] += share;
    }
  }

  const summary: Record<string, PersonSummary> = {};
  const balance: Record<string, number> = {};

  for (const p of PEOPLE) {
    const net = paid[p] - owed[p];
    summary[p] = { paid: paid[p], owed: owed[p], net };
    balance[p] = net;
  }

  // Greedy min-transactions settlement
  const transfers: Transfer[] = [];

  for (let i = 0; i < 20; i++) {
    let maxCreditor = PEOPLE[0];
    let maxDebtor = PEOPLE[0];

    for (const p of PEOPLE) {
      if (balance[p] > balance[maxCreditor]) maxCreditor = p;
      if (balance[p] < balance[maxDebtor]) maxDebtor = p;
    }

    if (balance[maxCreditor] < 0.01 || balance[maxDebtor] > -0.01) break;

    const amount = Math.min(balance[maxCreditor], -balance[maxDebtor]);
    const rounded = Math.round(amount * 100) / 100;
    if (rounded <= 0) break;

    transfers.push({ from: maxDebtor, to: maxCreditor, amount: rounded });
    balance[maxDebtor] += amount;
    balance[maxCreditor] -= amount;
  }

  return { transfers, summary };
}
