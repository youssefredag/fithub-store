import { useParams } from "react-router-dom"
import { useEffect, useState } from "react";
import ProductsList from "../components/ProductsList";
import { gymProducts } from "../data/gymProducts";

export default function ProductsCategories() {
    const [prodcuts , setProdcuts] = useState([]);

    const { category } = useParams();

    useEffect(() => {
      if (!category) {
        setProdcuts(gymProducts)
        return
      }

      const cat = category.toLowerCase();
      if (cat === 'all') {
        setProdcuts(gymProducts)
      } else {
        const filtered = gymProducts.filter(p => p.category.toLowerCase() === cat)
        setProdcuts(filtered)
      }
    }, [category])

  return (
    <div>
     <h2 className="center-title">Products in category: {category}</h2>
        <ProductsList products={prodcuts}  />
    </div>
  )
}
