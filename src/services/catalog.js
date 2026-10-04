import { apiRequest } from './api';

function records(result) {
  const data = result?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.categories)) return data.categories;
  if (Array.isArray(data?.brands)) return data.brands;
  return [];
}

async function loadCollection(endpoint) {
  const firstPage = await apiRequest(`${endpoint}?page=1&limit=50`);
  const pages = Number(firstPage?.metadata?.numberOfPages || 1);
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(0, pages - 1) }, (_, index) =>
      apiRequest(`${endpoint}?page=${index + 2}&limit=50`),
    ),
  );
  return [firstPage, ...remainingPages].flatMap(records);
}

export function normalizeProduct(product) {
  const category = product.category?.name || product.category || '';
  const brand = product.brand?.name || product.brand || '';
  return {
    ...product,
    id: String(product._id || product.id),
    title: product.title || product.name || 'Untitled product',
    price: Number(product.price || 0),
    category,
    categoryId: product.category?._id || '',
    brand,
    brandId: product.brand?._id || '',
    rating: Number(product.ratingsAverage ?? product.rating ?? 0),
    image: product.imageCover || product.thumbnail || product.images?.[0] || '',
    images: product.images?.length ? product.images : [product.imageCover || product.thumbnail].filter(Boolean),
  };
}

function normalizeCollectionItem(item) {
  return { ...item, id: String(item._id || item.id) };
}

export async function loadProducts() {
  return (await loadCollection('/products')).map(normalizeProduct);
}

export async function loadFeaturedProduct() {
  const result = await apiRequest('/products?page=1&limit=1');
  const product = records(result)[0];
  return product ? normalizeProduct(product) : null;
}

export async function loadProduct(id) {
  const result = await apiRequest(`/products/${encodeURIComponent(id)}`);
  const product = result?.data?.product || result?.data;
  return product ? normalizeProduct(product) : null;
}

export async function loadCategories() {
  return (await loadCollection('/categories')).map(normalizeCollectionItem);
}

export async function loadBrands() {
  return (await loadCollection('/brands')).map(normalizeCollectionItem);
}

export const formatPrice = (price) => `$${Number(price || 0).toFixed(2)}`;

export const slugify = (value) => String(value || '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');
