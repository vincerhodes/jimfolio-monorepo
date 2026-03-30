export type Person = 'mark' | 'bec' | 'jim' | 'stan' | 'prajna';

export const PEOPLE: Person[] = ['mark', 'bec', 'jim', 'stan', 'prajna'];

export const DEFAULT_SPLIT_WITH: Person[] = ['mark', 'jim'];

export interface ExpenseWithParsed {
  id: string;
  description: string;
  amount: number;
  currency: string;
  paidBy: Person;
  splitWith: Person[];
  date: Date;
  createdAt: Date;
}

export interface ExpenseFormInitial {
  id?: string;
  description: string;
  amount: number;
  paidBy: Person;
  splitWith: Person[];
  date: string;
}

export function parseExpense(expense: {
  id: string;
  description: string;
  amount: number;
  currency: string;
  paidBy: string;
  splitWith: string;
  date: Date;
  createdAt: Date;
}): ExpenseWithParsed {
  return {
    ...expense,
    paidBy: expense.paidBy as Person,
    splitWith: JSON.parse(expense.splitWith) as Person[],
  };
}

export function toDateInputValue(date: string | Date): string {
  const value = typeof date === 'string' ? new Date(date) : date;
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
