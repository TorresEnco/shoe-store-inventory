/**
 * mockMetrics.ts
 *
 * Static demo data for the Pareto (ABC) rotation dashboard.
 * Mirrors the future analytics API shape so it can be replaced by a fetch later.
 */

export type MetricClass = 'A' | 'B' | 'C';
export type StockStatus = 'healthy' | 'low' | 'critical';

export interface SizeMetric {
  size: number;
  stock: number;
}

export interface TopModelMetric {
  id: string;
  name: string;
  brand: string;
  color: string;
  abcClass: MetricClass;
  soldPairs: number;
  pairsPerDay: number;
  revenue: number;
  stock: number;
  stockStatus: StockStatus;
  stockLabel: string;
  sizes: SizeMetric[];
}

export const MOCK_METRICS_SUMMARY = {
  totalSold: 142,
  totalRevenue: 18450,
  atRiskPairs: 18,
};

export const MOCK_CLASS_COUNTS: Record<MetricClass, number> = {
  A: 8,
  B: 14,
  C: 6,
};

export const MOCK_TOP_MODELS: TopModelMetric[] = [
  {
    id: 'metric-001',
    name: 'Mocasín Artesanal',
    brand: 'Alva',
    color: 'Cuero Caramelo',
    abcClass: 'A',
    soldPairs: 48,
    pairsPerDay: 3.2,
    revenue: 5760,
    stock: 13,
    stockStatus: 'low',
    stockLabel: 'Reponer pronto - Bajo en T.39/40',
    sizes: [
      { size: 38, stock: 4 },
      { size: 39, stock: 1 },
      { size: 40, stock: 0 },
      { size: 41, stock: 5 },
      { size: 42, stock: 3 },
    ],
  },
  {
    id: 'metric-002',
    name: 'Zapatilla Urbana Cuero',
    brand: 'Bruma',
    color: 'Blanco Tiza',
    abcClass: 'A',
    soldPairs: 36,
    pairsPerDay: 2.4,
    revenue: 5220,
    stock: 22,
    stockStatus: 'healthy',
    stockLabel: 'Rotación saludable',
    sizes: [
      { size: 37, stock: 3 },
      { size: 38, stock: 6 },
      { size: 39, stock: 7 },
      { size: 40, stock: 6 },
    ],
  },
  {
    id: 'metric-003',
    name: 'Botín Cuero Genuino',
    brand: 'Andino',
    color: 'Negro Humo',
    abcClass: 'A',
    soldPairs: 24,
    pairsPerDay: 1.8,
    revenue: 4320,
    stock: 8,
    stockStatus: 'critical',
    stockLabel: 'Stock crítico',
    sizes: [
      { size: 39, stock: 2 },
      { size: 40, stock: 3 },
      { size: 41, stock: 0 },
      { size: 42, stock: 3 },
    ],
  },
];
