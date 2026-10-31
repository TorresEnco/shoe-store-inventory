/**
 * mockShoes.ts
 *
 * Static demo data for the Comercial Torres POS system.
 * Each `Shoe` has a flat metadata block plus a `sizes` array that
 * carries per-size stock levels. This structure mirrors the real API
 * shape so swapping the mock for a fetch() call later is trivial.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type Category = 'Casual' | 'Zapatillas' | 'Formal' | 'Botines';

export interface SizeEntry {
  size: number;      // EU numeric size
  stock: number;     // 0 = agotado
  price?: number;    // Variant-specific catalog price in PEN (optional)
  variantId?: number; // Backend product_variants id
}

export interface ColorVariant {
  color: string;
  swatchHex: string;
  sizes: SizeEntry[];
}

export interface Shoe {
  id: string;
  name: string;
  brand: string;
  color: string;
  price: number;        // in Peruvian Soles (PEN)
  category: Category;
  sizes: SizeEntry[];
  /** Hex or Tailwind-compatible color swatch for the thumbnail accent. */
  swatchHex: string;
  refCode?: string;
  subtitle?: string;
  colors?: ColorVariant[];
  status?: 'ACTIVE' | 'INACTIVE';
}

// ─── Mock catalogue ───────────────────────────────────────────────────────────

export const MOCK_SHOES: Shoe[] = [
  {
    id: 'shoe-001',
    name: 'Mocasín Artesanal',
    brand: 'Alva',
    subtitle: 'Calzados hechos a mano',
    refCode: 'ALV-201',
    color: 'Marrón Caramelo',
    price: 120.00,
    category: 'Casual',
    swatchHex: '#8B5E3C',
    sizes: [
      { size: 38, stock: 4 },
      { size: 39, stock: 2 },
      { size: 40, stock: 0 },
      { size: 41, stock: 5 },
      { size: 42, stock: 2 },
    ],
    colors: [
      {
        color: 'Marrón Caramelo',
        swatchHex: '#8B5E3C',
        sizes: [
          { size: 38, stock: 4 },
          { size: 39, stock: 2 },
          { size: 40, stock: 0 },
          { size: 41, stock: 5 },
          { size: 42, stock: 2 },
        ],
      },
      {
        color: 'Café Oscuro',
        swatchHex: '#4A2E1A',
        sizes: [
          { size: 38, stock: 0 },
          { size: 39, stock: 3 },
          { size: 40, stock: 4 },
          { size: 41, stock: 2 },
        ],
      },
      {
        color: 'Negro',
        swatchHex: '#222222',
        sizes: [
          { size: 38, stock: 2 },
          { size: 39, stock: 5 },
          { size: 40, stock: 1 },
          { size: 41, stock: 0 },
        ],
      },
    ],
  },
  {
    id: 'shoe-002',
    name: 'Zapatilla Urbana Cuero',
    brand: 'Bruma',
    subtitle: 'Línea Confort Urbano',
    refCode: 'BRU-104',
    color: 'Blanco Tiza',
    price: 145.00,
    category: 'Zapatillas',
    swatchHex: '#E8E4DD',
    sizes: [
      { size: 37, stock: 3 },
      { size: 38, stock: 6 },
      { size: 39, stock: 1 },
      { size: 40, stock: 4 },
    ],
    colors: [
      {
        color: 'Blanco Tiza',
        swatchHex: '#E8E4DD',
        sizes: [
          { size: 37, stock: 3 },
          { size: 38, stock: 6 },
          { size: 39, stock: 1 },
          { size: 40, stock: 4 },
        ],
      },
      {
        color: 'Gris Plomo',
        swatchHex: '#71717A',
        sizes: [
          { size: 37, stock: 2 },
          { size: 38, stock: 2 },
          { size: 39, stock: 3 },
          { size: 40, stock: 0 },
        ],
      },
    ],
  },
  {
    id: 'shoe-003',
    name: 'Botín Cuero Genuino',
    brand: 'Andino',
    subtitle: 'Resistencia y estilo',
    refCode: 'AND-502',
    color: 'Negro Humo',
    price: 180.00,
    category: 'Formal',
    swatchHex: '#2C2C2C',
    sizes: [
      { size: 39, stock: 2 },
      { size: 40, stock: 3 },
      { size: 41, stock: 0 },
      { size: 42, stock: 1 },
    ],
    colors: [
      {
        color: 'Negro Humo',
        swatchHex: '#2C2C2C',
        sizes: [
          { size: 39, stock: 2 },
          { size: 40, stock: 3 },
          { size: 41, stock: 0 },
          { size: 42, stock: 1 },
        ],
      },
      {
        color: 'Marrón Rústico',
        swatchHex: '#6D4C41',
        sizes: [
          { size: 39, stock: 1 },
          { size: 40, stock: 2 },
          { size: 41, stock: 3 },
          { size: 42, stock: 0 },
        ],
      },
    ],
  },
  {
    id: 'shoe-004',
    name: 'Zapato Formal Derby',
    brand: 'Alva',
    subtitle: 'Línea Ejecutiva',
    refCode: 'ALV-305',
    color: 'Café Oscuro',
    price: 160.00,
    category: 'Formal',
    swatchHex: '#4A2E1A',
    sizes: [
      { size: 38, stock: 0 },
      { size: 39, stock: 3 },
      { size: 40, stock: 4 },
      { size: 41, stock: 2 },
    ],
    colors: [
      {
        color: 'Café Oscuro',
        swatchHex: '#4A2E1A',
        sizes: [
          { size: 38, stock: 0 },
          { size: 39, stock: 3 },
          { size: 40, stock: 4 },
          { size: 41, stock: 2 },
        ],
      },
      {
        color: 'Negro Clásico',
        swatchHex: '#1F1F1F',
        sizes: [
          { size: 38, stock: 1 },
          { size: 39, stock: 2 },
          { size: 40, stock: 2 },
          { size: 41, stock: 1 },
        ],
      },
    ],
  },
];
