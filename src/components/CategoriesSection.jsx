import { useEffect, useState } from 'react'
import './CategoriesSection.css'
import { Link } from 'react-router-dom';
import { loadCategories, slugify } from '../services/catalog';

function CategoriesSection() {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
      let active = true;
      loadCategories()
        .then((result) => { if (active) setCategories(result); })
        .catch((requestError) => { if (active) setError(requestError.message || 'Could not load categories.'); });
      return () => { active = false; };
    }, []);

  return (
    <>
        <h2 className="center-title">Shop by category</h2>
        <section className="categories">
            {error && <p className="form-error" role="alert">{error}</p>}
            {categories.map((category) => {
              return (<Link to={`/categories/${slugify(category.name)}`} key={category.id} className="category-card">{category.name}</Link>)
            })}
            {!categories.length && !error && <p className="shop-empty">Loading categories...</p>}
        </section>
    </>
  )
}

export default CategoriesSection
