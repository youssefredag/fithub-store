import { apiRequest } from './api';

function records(result) {
  const data = result?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.categories)) return data.categories;
  if (Array.isArray(data?.subcategories)) return data.subcategories;
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

export function parsePrice(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]+/g, '');
    if (!cleaned || cleaned === '-' || cleaned === '.') return 0;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizeProduct(product) {
  const category = product.category?.name || product.category || '';
  const brand = product.brand?.name || product.brand || '';
  return {
    ...product,
    id: String(product._id || product.id),
    title: product.title || product.name || 'Untitled product',
    price: parsePrice(product.price),
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

function isClothingCategory(name) {
  return ['men\'s fashion', 'women\'s fashion'].includes(String(name || '').trim().toLowerCase());
}

function getNameSlug(item) {
  return slugify(item.name || item.title || '');
}

function productSubcategories(product) {
  const values = Array.isArray(product.subcategory) ? product.subcategory : [product.subcategory];
  return values.filter((subcategory) => subcategory && typeof subcategory === 'object');
}

export async function loadProducts() {
  return (await loadCollection('/products'))
    .map(normalizeProduct)
    .filter((product) => isClothingCategory(product.category));
}

export async function loadFeaturedProduct() {
  return (await loadProducts())[0] || null;
}

export async function loadProduct(id) {
  const result = await apiRequest(`/products/${encodeURIComponent(id)}`);
  const product = result?.data?.product || result?.data;
  const normalized = product ? normalizeProduct(product) : null;
  return normalized && isClothingCategory(normalized.category) ? normalized : null;
}

export async function loadCategories() {
  return (await loadCollection('/categories'))
    .filter((category) => isClothingCategory(category.name))
    .map(normalizeCollectionItem);
}

export async function loadCategoryDetails(categorySlug) {
  const categories = await loadCategories();
  const category = categories.find((item) => getNameSlug(item) === categorySlug);
  if (!category) return null;
  const [categoryResult, subcategoryResult, products] = await Promise.all([
    apiRequest(`/categories/${encodeURIComponent(category.id)}`),
    apiRequest(`/categories/${encodeURIComponent(category.id)}/subcategories`),
    loadProducts(),
  ]);
  const categoryDetails = categoryResult?.data?.category || categoryResult?.data || category;
  const clothingSubcategories = products
    .filter((product) => product.categoryId === category.id)
    .flatMap(productSubcategories)
    .map(normalizeCollectionItem);
  const relevantIds = new Set(clothingSubcategories.map((subcategory) => subcategory.id));
  const listedSubcategories = records(subcategoryResult)
    .map(normalizeCollectionItem)
    .filter((subcategory) => relevantIds.has(subcategory.id));
  const subcategoriesById = new Map(clothingSubcategories.map((subcategory) => [subcategory.id, subcategory]));
  listedSubcategories.forEach((subcategory) => subcategoriesById.set(subcategory.id, subcategory));
  const subcategories = [...subcategoriesById.values()];
  return { category: normalizeCollectionItem(categoryDetails), subcategories };
}

export async function loadSubcategoryDetails(subcategorySlug) {
  const categories = await loadCategories();
  const [subcategoryLists, products] = await Promise.all([Promise.all(categories.map(async (category) => {
    const result = await apiRequest(`/categories/${encodeURIComponent(category.id)}/subcategories`);
    return records(result).map((subcategory) => ({ ...normalizeCollectionItem(subcategory), categoryName: category.name }));
  })), loadProducts()]);
  const productSubcategoryDetails = products.flatMap((product) =>
    productSubcategories(product).map((subcategory) => ({
      ...normalizeCollectionItem(subcategory),
      categoryName: product.category,
    })),
  );
  const knownSubcategories = new Map(
    [...subcategoryLists.flat(), ...productSubcategoryDetails].map((item) => [item.id, item]),
  );
  const subcategory = [...knownSubcategories.values()].find((item) => getNameSlug(item) === subcategorySlug);
  if (!subcategory) return null;
  const result = await apiRequest(`/subcategories/${encodeURIComponent(subcategory.id)}`);
  const details = result?.data?.subcategory || result?.data || subcategory;
  return { ...normalizeCollectionItem(details), categoryName: subcategory.categoryName };
}

export async function loadBrands(products) {
  const clothingProducts = products || await loadProducts();
  const clothingBrandIds = new Set(clothingProducts.map((product) => product.brandId).filter(Boolean));
  return (await loadCollection('/brands'))
    .filter((brand) => clothingBrandIds.has(String(brand._id || brand.id)))
    .map(normalizeCollectionItem);
}

export async function loadBrandDetails(brandSlug) {
  const brands = await loadBrands();
  const brand = brands.find((item) => getNameSlug(item) === brandSlug);
  if (!brand) return null;
  const result = await apiRequest(`/brands/${encodeURIComponent(brand.id)}`);
  const details = result?.data?.brand || result?.data || brand;
  return normalizeCollectionItem(details);
}

export async function loadClothingReviews() {
  const firstPage = await apiRequest('/reviews?page=1&limit=50');
  const pageCount = Number(firstPage?.metadata?.numberOfPages || 1);
  const otherPages = await Promise.all(
    Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
      apiRequest(`/reviews?page=${index + 2}&limit=50`),
    ),
  );
  const reviews = [firstPage, ...otherPages].flatMap((result) => {
    const data = result?.data;
    if (Array.isArray(data)) return data;
    return data?.reviews || [];
  });
  const products = await loadProducts();
  const productsById = new Map(products.map((product) => [product.id, product]));
  return reviews.flatMap((review) => {
    const productId = String(review.product?._id || review.product?.id || review.product || '');
    const product = productsById.get(productId);
    return product ? [{ ...review, product }] : [];
  });
}

export const formatPrice = (price) => `$${parsePrice(price).toFixed(2)}`;

export const slugify = (value) => String(value || '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');
