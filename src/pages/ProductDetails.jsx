import { useEffect, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice, loadProduct } from '../services/catalog';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    loadProduct(id)
      .then((result) => { if (active) setProduct(result); })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Could not load this product.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) return <div className="shop-empty detail-loading">Loading product...</div>;
  if (error) return <section className="shop-page shop-empty-page"><p className="form-error" role="alert">{error}</p><Link className="button" to="/products">Back to products</Link></section>;
  if (!product) return <section className="shop-page shop-empty-page"><h1>Product not found</h1><Link className="button" to="/products">Back to products</Link></section>;

  const image = product.image || product.images?.[0];
  return (
    <section className="shop-page">
      <div className="detail-layout">
        <div className="detail-image"><img src={image} alt={product.title} /></div>
        <div className="detail-copy">
          <p className="shop-eyebrow">{product.brand || product.category}</p>
          <h1>{product.title}</h1>
          <p className="shop-rating"><FaStar /> {Number(product.rating).toFixed(1)}</p>
          <strong className="detail-price">{formatPrice(product.price)}</strong>
          <p className="detail-description">{product.description}</p>
          <p className="detail-category">Category <Link to={`/categories/${product.category?.toLowerCase().replaceAll(' ', '-')}`}>{product.category}</Link></p>
          <button className="button" type="button" onClick={() => addToCart({ ...product, image })}>Add to cart</button>
        </div>
      </div>
    </section>
  );
}
