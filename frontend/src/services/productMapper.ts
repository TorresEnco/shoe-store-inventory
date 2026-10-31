import type { ApiProduct, ApiVariant } from './api';
import type { Category, ColorVariant, Shoe, SizeEntry } from '../data/mockShoes';

const KNOWN_CATEGORIES: Category[] = ['Casual', 'Zapatillas', 'Formal', 'Botines'];

const COLOR_SWATCHES: Record<string, string> = {
  'Marrón Caramelo': '#8B5E3C',
  'Blanco Tiza': '#E8E4DD',
  'Negro Humo': '#2C2C2C',
  'Café Oscuro': '#4A2E1A',
  'Negro': '#222222',
  'Gris Plomo': '#71717A',
  'Negro Clásico': '#1F1F1F',
  'Marrón Rústico': '#6D4C41',
};

function toCategory(name: string | null): Category {
  return name && (KNOWN_CATEGORIES as string[]).includes(name) ? (name as Category) : 'Casual';
}

function toSizeEntry(variant: ApiVariant): SizeEntry {
  return {
    size: variant.size,
    stock: variant.stock,
    price: Number(variant.catalogPrice),
    variantId: variant.id,
  };
}

export function mapProductToShoe(product: ApiProduct): Shoe {
  const variants = product.variants ?? [];
  const groups = new Map<string, ColorVariant>();

  for (const variant of variants) {
    const colorName = variant.colorName ?? 'Sin color';
    const group = groups.get(colorName) ?? {
      color: colorName,
      swatchHex: COLOR_SWATCHES[colorName] ?? '#8B5E3C',
      sizes: [],
    };
    group.sizes.push(toSizeEntry(variant));
    groups.set(colorName, group);
  }

  const colors = [...groups.values()];
  const primary = colors[0] ?? { color: '', swatchHex: '#8B5E3C', sizes: [] };

  return {
    id: String(product.id),
    name: product.name,
    brand: product.brandName ?? '',
    color: primary.color,
    price: Number(variants[0]?.catalogPrice ?? 0),
    category: toCategory(product.categoryName),
    sizes: primary.sizes,
    swatchHex: primary.swatchHex,
    colors,
    status: product.status === false ? 'INACTIVE' : 'ACTIVE',
  };
}
