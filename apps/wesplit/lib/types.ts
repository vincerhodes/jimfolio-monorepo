export type Person = 'mark' | 'bec' | 'jim' | 'stan' | 'prajna';

export const PEOPLE: Person[] = ['mark', 'bec', 'jim', 'stan', 'prajna'];

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

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
