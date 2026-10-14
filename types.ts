
export enum Category {
  Food = 'Food',
  Travel = 'Travel',
  Online = 'Online',
  Subscription = 'Subscription',
  Misc = 'Misc',
  
}

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string;
}

export interface Budget {
  category: Category;
  limit: number;
}

export interface LeakInsight {
  type: 'leak' | 'warning' | 'info';
  title: string;
  message: string;
  potentialSaving?: number;
}
