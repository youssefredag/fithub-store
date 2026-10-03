import { gymProducts, gymCategories, gymBrands } from '../data/gymProducts';

const API_ROOT = 'https://dummyjson.com';

function normalizeApiProduct(product) {
  return {
    ...product,
    id: `api-${product.id}`,
    apiId: product.id,
    brand: product.brand || '',
    image: product.thumbnail || product.images?.[0] || '',
    images: product.images?.length ? product.images : [product.thumbnail].filter(Boolean),
  };
}

export const localProducts = gymProducts.map((product) => ({
  ...product,
  image: product.images[0],
}));

export { gymBrands };

export async function loadProducts() {
  return localProducts;
}

export async function loadProduct(id) {
  const local = localProducts.find((product) => String(product.id) === String(id));
  if (local) return local;
  const apiId = String(id).replace(/^api-/, '');
  if (!/^\d+$/.test(apiId)) return null;
  try {
    const response = await fetch(`${API_ROOT}/products/${apiId}`);
    if (!response.ok) return null;
    return normalizeApiProduct(await response.json());
  } catch {
    return null;
  }
}

export async function loadCategories() {
  return gymCategories.filter((category) => category !== 'All');
}

export const formatPrice = (price) => `$${Number(price || 0).toFixed(2)}`;

export const slugify = (value) => String(value || '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');