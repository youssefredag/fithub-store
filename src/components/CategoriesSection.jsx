import { useEffect, useState } from 'react'
import './CategoriesSection.css'
import { Link } from 'react-router-dom';
import { gymCategories } from '../data/gymProducts';

function CategoriesSection() {
    const [categories , setCategories] = useState([]); 

    useEffect(()=>{
      setCategories(gymCategories)
    } ,[])



  return (
    <>
        <h2 className="center-title">Shop by category</h2>
        <section className="categories">
            {categories.filter((category) => category !== 'All').map((category)=> {
              return (<Link to={`/categories/${category.toLowerCase().replaceAll(' ', '-')}`} key={category} className="category-card">{category}</Link>)
            })}
        </section>
    </>
  )
}

export default CategoriesSection
