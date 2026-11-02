const API_BASE_URL = 'http://localhost:8080/api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  fullName: string;
  username: string;
  role: 'ADMIN' | 'CASHIER';
}

export interface ApiUser {
  id: number;
  fullName: string;
  username: string;
  role: 'ADMIN' | 'CASHIER';
  active: boolean;
}

export interface ApiCustomer {
  id: number;
  name: string;
  phone: string | null;
  totalPurchases: number | null;
  createdAt: string | null;
}

export interface CreateUserPayload {
  fullName: string;
  username: string;
  password: string;
  role: 'ADMIN' | 'CASHIER';
}

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
  customerPhone?: string;
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

function extractErrorMessage(detail: string): string | null {
  const raw = detail.trim();
  if (!raw) return null;
  try {
    const body = JSON.parse(raw) as { message?: unknown; detail?: unknown; error?: unknown };
    const message = body.message || body.detail || body.error;
    if (typeof message === 'string' && message.trim()) return message.trim();
  } catch {
    if (!raw.startsWith('{') && !raw.startsWith('[')) return raw;
  }
  return null;
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
    throw new Error(extractErrorMessage(detail) || 'No se pudo completar la operación.');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function login(credentials: LoginCredentials): Promise<AuthUser> {
  return request<AuthUser>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function getUsers(): Promise<ApiUser[]> {
  return request<ApiUser[]>('/users');
}

export function createUser(userData: CreateUserPayload): Promise<ApiUser> {
  return request<ApiUser>('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export function toggleUserStatus(id: number, currentUserId: number): Promise<ApiUser> {
  return request<ApiUser>(`/users/${id}/toggle-status?currentUserId=${currentUserId}`, {
    method: 'PATCH',
  });
}

export function searchCustomers(query: string): Promise<ApiCustomer[]> {
  return request<ApiCustomer[]>(`/customers/search?q=${encodeURIComponent(query)}`);
}

export function getCustomers(): Promise<ApiCustomer[]> {
  return request<ApiCustomer[]>('/customers');
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
