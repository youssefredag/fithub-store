import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ConsultationModal from './ConsultationModal';
import { loadFeaturedProduct } from '../services/catalog';

function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const [catalogError, setCatalogError] = useState('');

  useEffect(() => {
    let active = true;
    loadFeaturedProduct()
      .then((product) => {
        if (active) setFeaturedProduct(product);
      })
      .catch((error) => {
        if (active) setCatalogError(error.message || 'Could not load featured products.');
      });
    return () => { active = false; };
  }, []);

  return (
    <>
    <br /> <br />
      <section className="hero">
        <div className="hero-text">
          <h1>{featuredProduct ? `Discover ${featuredProduct.title}` : 'Find what you need, all in one place.'}</h1>
          <p>{featuredProduct?.description || 'Explore products from the Route store and find the right fit for you.'}</p>
          {catalogError && <p className="form-error" role="alert">{catalogError}</p>}
          <div className="cta-btns">
            <Link to="/products" className="btn btn-primary">Shop products</Link>
            <button className="btn" onClick={() => setIsModalOpen(true)}>Ask us a question</button>
          </div>
        </div>
        {featuredProduct?.image && <img src={featuredProduct.image} alt={featuredProduct.title} />}
      </section>

      <ConsultationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}

export default Hero
