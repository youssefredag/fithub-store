import { apiRequest } from './api';
import { gymBrands, gymCategories, gymProducts } from '../data/gymProducts';

export { gymBrands };

const localProducts = gymProducts.map((product) => ({
  ...product,
  image: product.images[0],
}));

function normalizeProduct(product) {
  const category = product.category?.name || product.category || '';
  const brand = product.brand?.name || product.brand || '';
  return {
    ...product,
    id: String(product._id || product.id),
    category,
    categoryId: product.category?._id || '',
    brand,
    brandId: product.brand?._id || '',
    rating: product.ratingsAverage ?? product.rating ?? 0,
    image: product.imageCover || product.thumbnail || product.images?.[0] || '',
    images: product.images?.length ? product.images : [product.imageCover || product.thumbnail].filter(Boolean),
  };
}

export async function loadProducts() {
  return localProducts;
}

export async function loadProduct(id) {
  const localProduct = localProducts.find((product) => String(product.id) === String(id));
  if (localProduct) return localProduct;

  const result = await apiRequest(`/products/${encodeURIComponent(String(id).replace(/^api-/, ''))}`);
  const product = result?.data?.product || result?.data;
  return product ? normalizeProduct(product) : null;
}

export async function loadCategories() {
  return gymCategories.filter((category) => category !== 'All').map((name) => ({
    id: name,
    name,
    slug: name.toLowerCase().replaceAll(' ', '-'),
  }));
}

export async function loadBrands() {
  return gymBrands.map((brand) => ({
    ...brand,
    id: brand.name,
    slug: brand.name.toLowerCase().replaceAll(' ', '-'),
  }));
}

export const formatPrice = (price) => `$${Number(price || 0).toFixed(2)}`;

export const slugify = (value) => String(value || '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');
