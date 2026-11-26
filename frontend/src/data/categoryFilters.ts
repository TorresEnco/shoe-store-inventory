import type { Category } from './mockShoes';

export type FilterCategory = 'Todas' | Category;

export const CATEGORIES: FilterCategory[] = ['Todas', 'Casual', 'Zapatillas', 'Formal', 'Botines'];
