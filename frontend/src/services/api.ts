const API_BASE_URL = 'http://localhost:8080/api';

export interface ApiVariant {
  id: number;
  colorId: number | null;
  colorName: string | null;
  size: number;
  catalogPrice: number;
  stock: number;
  createdAt: string | null;
}

export interface ApiProduct {
  id: number;
  name: string;
  description: string | null;
  categoryId: number | null;
  categoryName: string | null;
  brandId: number | null;
  brandName: string | null;
  status: boolean | null;
  createdAt: string | null;
  variants: ApiVariant[];
}

export type PaymentType = 'CASH' | 'YAPE_PLIN';
export type SaleStatus = 'COMPLETED' | 'CANCELLED';

export interface ProcessSaleItem {
  variantId: number;
  unitPrice: number;
  quantity: number;
}

export interface ProcessSalePayload {
  userId?: number | null;
  customerName?: string;
  paymentType: PaymentType;
  items: ProcessSaleItem[];
}

export interface ApiSaleItem {
  id: number;
  variantId: number;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface ApiSale {
  id: number;
  userId: number | null;
  customerName: string;
  total: number;
  paymentType: PaymentType;
  status: SaleStatus;
  createdAt: string;
  items: ApiSaleItem[];
}

export interface ParetoModelMetric {
  productId: number;
  productName: string;
  brandName: string | null;
  colorName: string | null;
  totalSold: number;
  revenue: number;
  velocityPerDay: number;
  currentStock: number;
  classification: 'CLASS_A' | 'CLASS_B' | 'CLASS_C';
  stockStatus: string;
  sizeBreakdown: Record<string, number>;
}

export interface ParetoReport {
  periodDays: number;
  totalSold: number;
  totalRevenue: number;
  atRiskPairs: number;
  classAPercentage: number;
  models: ParetoModelMetric[];
  liquidationSuggestions: string[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(detail || `Error ${response.status} al comunicarse con el servidor`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getProducts(): Promise<ApiProduct[]> {
  return request<ApiProduct[]>('/products');
}

export function updateStock(variantId: number, delta: number): Promise<ApiVariant> {
  return request<ApiVariant>(`/products/variants/${variantId}/stock`, {
    method: 'PATCH',
    body: JSON.stringify({ delta }),
  });
}

export function processSale(saleData: ProcessSalePayload): Promise<ApiSale> {
  return request<ApiSale>('/sales', {
    method: 'POST',
    body: JSON.stringify(saleData),
  });
}

export function getTodaySales(): Promise<ApiSale[]> {
  return request<ApiSale[]>('/sales/today');
}

export function cancelSale(saleId: number): Promise<ApiSale> {
  return request<ApiSale>(`/sales/${saleId}/cancel`, {
    method: 'PATCH',
  });
}

export function getParetoReport(days: number): Promise<ParetoReport> {
  return request<ParetoReport>(`/analytics/pareto?days=${days}`);
}
