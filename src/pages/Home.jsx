import Hero from '../components/Hero'
import CategoriesSection from '../components/CategoriesSection'
import ProductsSection from '../components/ProductsSection'

export default function Home() {

  return (
    <div className="page-white">
      <Hero />
      <CategoriesSection />
      <ProductsSection />
    </div>
  )
}
