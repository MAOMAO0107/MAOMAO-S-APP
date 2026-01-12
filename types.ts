
export type TransactionType = 'income' | 'expense' | 'savings';

export type Language = 'en' | 'zh';
export type Theme = 'light' | 'dark' | 'gray';

export interface Transaction {
  id: string;
  date: string; // ISO string
  description: string;
  amount: number;
  category: string;
  type: TransactionType;
}

export interface MonthlyStats {
  income: number;
  expense: number;
  savings: number;
}

export interface ClassificationResult {
  category: string;
  type: TransactionType;
}

export interface AppSettings {
  language: Language;
  theme: Theme;
}
