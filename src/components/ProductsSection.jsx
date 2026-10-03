import './ProductsSection.css'
import { useEffect, useState } from 'react';
import SearchBar from './SearchBar';
import ProductsList from './ProductsList';
import { loadProducts } from '../services/catalog';

function ProductsSection() {
  const [products, setProducts] = useState([]);
  const [visableProducts, setVisableProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadProducts().then((catalog) => {
      if (!active) return;
      setProducts(catalog);
      setVisableProducts(catalog);
      setLoading(false);
    });
    return () => { active = false; };
  }, [])

  return (
    <section className="products">
      <h2 className="center-title">Products</h2>
      <div>
        <SearchBar products={products} setVisableProducts={setVisableProducts} />
      </div>
      {loading ? <p className="shop-empty">Loading equipment...</p> : <ProductsList products={visableProducts} />}
    </section>
  )
}

export default ProductsSection
