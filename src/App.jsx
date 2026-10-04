import { Route, Routes } from 'react-router-dom'
import './App.css'
import './responsive.css'
import './commerce.css'
import Home from './pages/Home'
import About from './pages/About'
import Layout from './pages/Layout'
import NotFound from './pages/NotFound'
import TitleUpdater from './pages/TitleUpdater'
import CartPage from './pages/CartPage'
import {
  AccountPage,
  AddressesPage,
  CatalogPage,
  CheckoutPage,
  OrdersPage,
  ProfilePage,
  ProductDetailsPage,
  ReviewsPage,
  WishlistPage,
} from './pages/CommercePages'

function App() {


  return (
    <Routes>
      <Route path='/' element={<Layout />}>  
        <Route path='/' element={<Home />}   />
        <Route path='/products' element={<CatalogPage />} />
        <Route path='/products/:id' element={<ProductDetailsPage />} />
        <Route path='/reviews' element={<ReviewsPage />} />
        <Route path='/subcategories/:subcategory' element={<CatalogPage mode='subcategory-detail' />} />
        <Route path='/brands' element={<CatalogPage mode='brands' />} />
        <Route path='/brands/:brand' element={<CatalogPage mode='brand-detail' />} />
        <Route path='/categories' element={<CatalogPage mode='categories' />} />
        <Route path='/categories/:category' element={<CatalogPage mode='category-detail' />} />
        <Route path='/products-category/:category' element={<CatalogPage mode='category-detail' />} />
        <Route path='/prodcuts-category/:category' element={<CatalogPage mode='category-detail' />} />
        <Route path='/cart' element={<CartPage />} />
        <Route path='/wishlist' element={<WishlistPage />} />
        <Route path='/login' element={<AccountPage mode='login' />} />
        <Route path='/register' element={<AccountPage mode='register' />} />
        <Route path='/forgot-password' element={<AccountPage mode='forgot' />} />
        <Route path='/change-password' element={<AccountPage mode='change' />} />
        <Route path='/checkout' element={<CheckoutPage />} />
        <Route path='/orders' element={<OrdersPage />} />
        <Route path='/addresses' element={<AddressesPage />} />
        <Route path='/profile' element={<ProfilePage />} />
        <Route path='/about' element={<About />} />
        <Route path='/titleupdate' element={<TitleUpdater />} />

        <Route path='*' element={<NotFound />}   />
      </Route>
    </Routes>
  ) 
}

export default App
