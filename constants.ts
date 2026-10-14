
import { Category } from './types';

export const CATEGORIES = [
  Category.Food,
  Category.Travel,
  Category.Online,
  Category.Subscription,
  Category.Misc,
];

export const CATEGORY_COLORS: Record<string, string> = {
  [Category.Food]: '#f87171',
  [Category.Travel]: '#60a5fa',
  [Category.Online]: '#c084fc',
  [Category.Subscription]: '#fbbf24',
  [Category.Misc]: '#94a3b8'
};

export const INITIAL_EXPENSES = [
  { id: '1', amount: 45, category: Category.Food, description: 'Afternoon Tea', date: new Date().toISOString() },
  { id: '2', amount: 1200, category: Category.Online, description: 'Amazon shopping', date: new Date().toISOString() },
  { id: '3', amount: 499, category: Category.Subscription, description: 'Netflix', date: new Date().toISOString() },
];
