import type { UserProfile } from '../types/user';

const API_BASE_URL = '/api';

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

type Csrf = { headerName: string; token: string };
let sessionToken: Csrf | undefined;

export class ApiTransportError extends Error {
  readonly kind: 'timeout' | 'connection' | 'response';

  constructor(kind: 'timeout' | 'connection' | 'response', message: string) {
    super(message);
    this.kind = kind;
  }
}

function transportError(cause: unknown): ApiTransportError {
  if (cause instanceof DOMException && cause.name === 'TimeoutError') {
    return new ApiTransportError('timeout', 'El servidor tardó demasiado en responder. Comprueba el resultado antes de reintentar.');
  }
  if (cause instanceof SyntaxError) {
    return new ApiTransportError('response', 'La respuesta del servidor está incompleta o tiene un formato inválido. Comprueba el resultado antes de reintentar.');
  }
  return new ApiTransportError('connection', 'Se perdió la conexión con el servidor. Comprueba la conexión y el resultado antes de reintentar.');
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body) headers.set('Content-Type', 'application/json');
  if (init?.method && !['GET', 'HEAD'].includes(init.method)) {
    const csrf = sessionToken ?? await request<Csrf>('/auth/csrf');
    headers.set(csrf.headerName, csrf.token);
  }
  let response: Response;
  const timeout = AbortSignal.timeout(15000);
  try {
    response = await fetch(API_BASE_URL + path, {
      ...init, credentials: 'same-origin', headers, cache: 'no-store', signal: timeout,
    });
  } catch (cause) {
    throw transportError(timeout.aborted ? timeout.reason : cause);
  }
  if (response.status === 401) {
    sessionToken = undefined;
    if (path !== '/auth/login') window.dispatchEvent(new Event('session-expired'));
    throw new Error(path === '/auth/login' ? 'Usuario o contraseña incorrectos.' : 'Tu sesión ha caducado.');
  }
  if (response.status === 403) {
    const message = 'Acceso denegado. Comprueba tus permisos o recarga la página para renovar la sesión.';
    if (path === '/sales') throw new SaleRejectedError(message);
    throw new Error(message);
  }
  if (response.status === 429 && path === '/auth/login') {
    throw new Error('Demasiados intentos de inicio de sesión. Espera unos minutos y vuelve a intentarlo.');
  }
  if (response.status === 400 && path.endsWith('/catalog')) {
    const problem: unknown = await response.json().catch(() => null);
    if (problem && typeof problem === 'object' && 'detail' in problem && typeof problem.detail === 'string') {
      throw new Error(problem.detail);
    }
    throw new Error('Revisa los datos del catálogo antes de guardar.');
  }
  if (path === '/sales' && response.status === 400) {
    throw new SaleRejectedError('Revisa los datos del cobro antes de volver a intentarlo.');
  }
  if (response.status === 409) {
    const problem: unknown = await response.json().catch(() => null);
    if (problem && typeof problem === 'object' && 'detail' in problem && typeof problem.detail === 'string') {
      if (path === '/sales' && 'code' in problem && problem.code === 'stock_conflict') {
        throw new SaleRejectedError(problem.detail);
      }
      throw new Error(problem.detail);
    }
    throw new Error('La operación entra en conflicto con el estado actual. Actualiza los datos.');
  }
  if (!response.ok) throw new Error('El servidor rechazó la operación (' + response.status + ').');

  if (response.status === 204) {
    return undefined as T;
  }

  try {
    return (await response.json()) as T;
  } catch (cause) {
    throw transportError(timeout.aborted ? timeout.reason : cause);
  }
}

export async function getProducts(): Promise<ApiProduct[]> {
  const products = await request<ApiProduct[]>('/products');
  if (!Array.isArray(products) || products.some(product => !product || typeof product.name !== 'string'
    || !Array.isArray(product.variants) || product.variants.some(variant => !variant))) {
    throw new ApiTransportError('response', 'El catálogo recibido tiene un formato inválido. Vuelve a cargarlo.');
  }
  return products;
}

export function updateStock(variantId: number, delta: number): Promise<ApiVariant> {
  return request<ApiVariant>(`/products/variants/${variantId}/stock`, {
    method: 'PATCH',
    body: JSON.stringify({ delta }),
  });
}

export class SaleRejectedError extends Error {}

export interface CatalogPayload {
  name: string;
  description: string;
  brand: string;
  category: string;
  status: boolean;
  variants: { id?: number; color: string; size: number; catalogPrice: number; stock: number }[];
}

export function saveCatalog(payload: CatalogPayload, id?: number): Promise<ApiProduct> {
  return request<ApiProduct>(id ? `/products/${id}/catalog` : '/products/catalog', {
    method: id ? 'PUT' : 'POST', body: JSON.stringify(payload),
  });
}

export function processSale(saleData: ProcessSalePayload, key: string): Promise<ApiSale> {
  return request<ApiSale>('/sales', {
    method: 'POST',
    headers: { 'Idempotency-Key': key },
    body: JSON.stringify(saleData),
  });
}

export async function getTodaySales(): Promise<ApiSale[]> {
  const sales = await request<ApiSale[]>('/sales/today');
  if (!Array.isArray(sales) || sales.some(sale => !sale || typeof sale.createdAt !== 'string'
    || !Array.isArray(sale.items) || sale.items.some(item => !item))) {
    throw new ApiTransportError('response', 'El historial recibido tiene un formato inválido. Vuelve a cargarlo.');
  }
  return sales;
}

export function cancelSale(saleId: number): Promise<ApiSale> {
  return request<ApiSale>(`/sales/${saleId}/cancel`, {
    method: 'PATCH',
  });
}

export function getParetoReport(days: number): Promise<ParetoReport> {
  return request<ParetoReport>(`/analytics/pareto?days=${days}`);
}

export async function currentSession() {
  sessionToken = await request<Csrf>('/auth/csrf');
  return request<UserProfile>('/auth/me');
}

export async function login(username: string, password: string) {
  sessionToken = undefined;
  const profile = await request<UserProfile>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
  sessionToken = await request<Csrf>('/auth/csrf');
  return profile;
}

export async function logout() {
  await request<void>('/auth/logout', { method: 'POST' });
  sessionToken = undefined;
  // The next login fetches a token bound to its new, anonymous session.
}
