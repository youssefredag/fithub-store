import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaStar } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { apiRequest, jsonBody } from '../services/api';
import {
  formatPrice,
  loadBrandDetails,
  loadBrands,
  loadCategories,
  loadCategoryDetails,
  loadClothingReviews,
  loadProduct,
  loadProducts,
  loadSubcategoryDetails,
  slugify,
} from '../services/catalog';

function useCatalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    loadProducts()
      .then(async (nextProducts) => {
        const [nextCategories, nextBrands] = await Promise.all([
          loadCategories(),
          loadBrands(nextProducts),
        ]);
        if (!active) return;
        setProducts(nextProducts);
        setCategories(nextCategories);
        setBrands(nextBrands);
        setLoading(false);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError.message || 'Could not load the catalog.');
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return { products, categories, brands, loading, error };
}

function hasSubcategory(product, targetSlug) {
  const subcategories = Array.isArray(product.subcategory) ? product.subcategory : [product.subcategory];
  return subcategories.some((subcategory) => slugify(subcategory?.name || subcategory || '') === targetSlug);
}

function ProductTile({ product }) {
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const saved = wishlist.some((item) => item.id === product.id);
  const image = product.image || product.images?.[0];

  return (
    <article className="shop-product">
      <Link className="shop-product-image" to={`/products/${product.id}`}>
        <img src={image} alt={product.title} loading="lazy" />
      </Link>
      <button className="icon-button shop-favorite" type="button" aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'} onClick={() => toggleWishlist(product)}>
        {saved ? <FaHeart /> : <FaRegHeart />}
      </button>
      <div className="shop-product-copy">
        <p className="shop-eyebrow">{product.brand || product.category}</p>
        <h2><Link to={`/products/${product.id}`}>{product.title}</Link></h2>
        <p className="shop-product-description">{product.description || 'See the product page for details.'}</p>
        <p className="shop-rating">{product.rating ? <><FaStar /> {Number(product.rating).toFixed(1)}</> : 'Not rated yet'}</p>
        <div className="shop-product-footer">
          <strong>{formatPrice(product.price)}</strong>
          <button className="button button-small" type="button" onClick={() => addToCart({ ...product, image })}>Add to cart</button>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, loading }) {
  if (loading) return <div className="shop-empty">Loading the collection...</div>;
  if (!products.length) return <div className="shop-empty">No products in this list yet. <Link to="/products">Browse clothing</Link></div>;
  return <div className="shop-grid">{products.map((product) => <ProductTile key={product.id} product={product} />)}</div>;
}

export function CatalogPage({ mode = 'products' }) {
  const { products, categories, brands, loading, error } = useCatalog();
  const { brand, category, subcategory } = useParams();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');
  const [collectionDetails, setCollectionDetails] = useState(null);
  const [detailsError, setDetailsError] = useState('');
  const title = mode === 'brand-detail' ? 'Brand collection' : mode === 'category-detail' ? 'Category collection' : 'Shop clothing';
  const detailSlug = brand || category || subcategory;

  useEffect(() => {
    if (!detailSlug || !['brand-detail', 'category-detail', 'subcategory-detail'].includes(mode)) return undefined;
    let active = true;
    setCollectionDetails(null);
    setDetailsError('');
    const request = mode === 'brand-detail'
      ? loadBrandDetails(detailSlug)
      : mode === 'category-detail'
        ? loadCategoryDetails(detailSlug)
        : loadSubcategoryDetails(detailSlug);
    request
      .then((details) => { if (active) setCollectionDetails(details); })
      .catch((requestError) => { if (active) setDetailsError(requestError.message || 'Could not load this collection.'); });
    return () => { active = false; };
  }, [detailSlug, mode]);

  if (mode === 'brands' || mode === 'categories') {
    const values = mode === 'brands' ? brands : categories;
    return (
      <section className="shop-page">
        <div className="shop-page-heading"><p className="shop-eyebrow">FitHub / Explore</p><h1>{mode === 'brands' ? 'Brands' : 'Categories'}</h1><p>{mode === 'brands' ? 'Clothing brands currently stocked in the shop.' : 'Browse clothing by type.'}</p></div>
        <div className="collection-grid">
          {loading && <p className="shop-empty">Loading collections...</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
          {values.map((value) => {
            const name = value.name;
            const to = `/${mode}/${slugify(name)}`;
            const count = products.filter((product) => slugify(mode === 'brands' ? product.brand : product.category) === slugify(name)).length;
            return <Link className="collection-tile" key={value.id} to={to}><span>{mode === 'brands' ? 'BRAND' : 'CATEGORY'}</span><strong>{name}</strong>{value.image && <img src={value.image} alt="" loading="lazy" />}<small>{count} {count === 1 ? 'item' : 'items'} <span aria-hidden="true">↗</span></small></Link>;
          })}
          {!values.length && !loading && <div className="shop-empty">{mode === 'brands' ? 'Brand names have not been added to the current product data.' : 'No categories are available.'} <Link to="/products">Browse equipment</Link></div>}
        </div>
      </section>
    );
  }

  let visible = products;
  if (mode === 'brand-detail') visible = visible.filter((product) => slugify(product.brand) === detailSlug);
  if (mode === 'category-detail') visible = visible.filter((product) => slugify(product.category) === detailSlug);
  if (mode === 'subcategory-detail') visible = visible.filter((product) => hasSubcategory(product, detailSlug));
  const collectionTitle = decodeURIComponent(detailSlug || '')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
  const query = search.trim().toLowerCase();
  if (query) visible = visible.filter((product) => `${product.title} ${product.category} ${product.brand}`.toLowerCase().includes(query));
  visible = [...visible].sort((a, b) => sort === 'price-low' ? a.price - b.price : sort === 'price-high' ? b.price - a.price : 0);

  return (
    <section className="shop-page">
      <div className="shop-page-heading"><p className="shop-eyebrow">FitHub / {mode === 'products' ? 'Catalog' : mode === 'brand-detail' ? 'Brands' : 'Categories'}</p><h1>{mode === 'products' ? title : collectionDetails?.name || collectionTitle}</h1><p>{mode === 'products' ? 'Explore clothing products currently available in the Route store.' : mode === 'brand-detail' ? 'Products from this clothing brand.' : mode === 'subcategory-detail' ? 'Products in this clothing subcategory.' : 'Products available in this clothing category.'}</p></div>
      {detailsError && <p className="form-error" role="alert">{detailsError}</p>}
      {mode === 'category-detail' && collectionDetails?.subcategories?.length > 0 && <nav className="subcategory-list" aria-label="Subcategories">{collectionDetails.subcategories.map((item) => <Link className="subcategory-chip" key={item.id} to={`/subcategories/${slugify(item.name)}`}>{item.name}</Link>)}</nav>}
      {mode === 'subcategory-detail' && collectionDetails?.name && <p className="account-note">Category: <Link to={`/categories/${slugify(collectionDetails.categoryName)}`}>{collectionDetails.categoryName}</Link></p>}
      <div className="catalog-toolbar"><label className="catalog-search"><span>Search</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search clothing" /></label><label className="catalog-sort"><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <ProductGrid products={visible} loading={loading} />
    </section>
  );
}

export function WishlistPage() {
  const { wishlist, user, authReady } = useCart();
  return <section className="shop-page"><div className="shop-page-heading"><p className="shop-eyebrow">Your account / Saved</p><h1>Wishlist</h1><p>{wishlist.length} saved {wishlist.length === 1 ? 'item' : 'items'}.</p></div>{!user ? <div className="shop-empty">Sign in to view your saved products. <Link to="/login">Sign in</Link></div> : !authReady ? <div className="shop-empty">Loading your wishlist...</div> : <ProductGrid products={wishlist} />}</section>;
}

export function ProfilePage() {
  const { user, updateProfile, authReady } = useCart();
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!user) return <section className="shop-page shop-empty-page"><h1>Sign in to manage your profile</h1><Link className="button" to="/login">Sign in</Link></section>;
  if (!authReady) return <section className="shop-page"><p role="status">Loading your account...</p></section>;

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setNotice('');
    const data = new FormData(event.currentTarget);
    try {
      const updated = await updateProfile({
        name: String(data.get('name') || '').trim(),
        email: String(data.get('email') || '').trim(),
        phone: String(data.get('phone') || '').trim(),
      });
      if (updated) setNotice('Your profile was updated.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="shop-page">
      <div className="shop-page-heading"><p className="shop-eyebrow">Your account</p><h1>Profile</h1><p>Update the contact information saved to your Route account.</p></div>
      <form className="shop-form address-form profile-form" onSubmit={submit}>
        <label>Name<input name="name" defaultValue={user.name || ''} autoComplete="name" required /></label>
        <label>Email<input name="email" type="email" defaultValue={user.email || ''} autoComplete="email" required /></label>
        <label>Phone<input name="phone" type="tel" defaultValue={user.phone || ''} autoComplete="tel" required /></label>
        <button className="button" type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save profile'}</button>
        {notice && <p className="form-message" role="status">{notice}</p>}
      </form>
    </section>
  );
}

export function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    loadClothingReviews()
      .then((result) => { if (active) setReviews(result); })
      .catch((requestError) => { if (active) setError(requestError.message || 'Could not load reviews.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <section className="shop-page">
      <div className="shop-page-heading"><p className="shop-eyebrow">Clothing / Customer feedback</p><h1>Reviews</h1><p>Reviews for products currently listed in the clothing store.</p></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {loading ? <p className="shop-empty">Loading reviews...</p> : reviews.length ? <div className="review-list">
        {reviews.map((review) => {
          const product = review.product || {};
          const productId = String(product._id || product.id || '');
          return <article className="review-entry" key={review._id || review.id}>
            <p className="shop-rating"><FaStar /> {review.rating} / 5</p>
            <p>{review.review}</p>
            <small>{review.user?.name || 'Customer'}</small>
            {productId && <p><Link to={`/products/${productId}`}>{product.title || product.name || 'View product'}</Link></p>}
          </article>;
        })}
      </div> : !error && <p className="shop-empty">No clothing reviews yet.</p>}
    </section>
  );
}

export function AccountPage({ mode }) {
  const { signIn, user, authReady } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetStep, setResetStep] = useState('email');
  const [resetEmail, setResetEmail] = useState('');

  async function submit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setNotice('');
    setError('');
    const form = new FormData(formElement);
    const email = String(form.get('email') || '').trim();
    const name = String(form.get('name') || '').trim();
    setSubmitting(true);

    try {
      if (mode === 'forgot') {
        if (resetStep === 'email') {
          await apiRequest('/auth/forgotPasswords', { method: 'POST', body: jsonBody({ email }) });
          setResetEmail(email);
          setResetStep('code');
          setNotice('A reset code was requested. Check your email, then enter the code here.');
        } else if (resetStep === 'code') {
          await apiRequest('/auth/verifyResetCode', {
            method: 'POST',
            body: jsonBody({ resetCode: String(form.get('resetCode') || '').trim() }),
          });
          setResetStep('password');
          setNotice('Reset code verified. Choose a new password.');
        } else if (resetStep === 'password') {
          await apiRequest('/auth/resetPassword', {
            method: 'PUT',
            body: jsonBody({ email: resetEmail, newPassword: String(form.get('newPassword') || '') }),
          });
          setResetStep('done');
          setNotice('Your password was reset. You can now sign in.');
        }
        return;
      }

      if (mode === 'change') {
        if (!user?.token) throw new Error('Please sign in to change your password.');
        const password = String(form.get('password') || '');
        const rePassword = String(form.get('rePassword') || '');
        if (password !== rePassword) throw new Error('Passwords do not match.');
        const result = await apiRequest('/users/changeMyPassword', {
          method: 'PUT',
          token: user?.token,
          body: jsonBody({
            currentPassword: String(form.get('currentPassword') || ''),
            password: String(form.get('password') || ''),
            rePassword: String(form.get('rePassword') || ''),
          }),
        });
        const account = result?.data || result;
        signIn({ ...(account.user || user), token: account.token || user.token });
        setNotice('Your password was updated.');
        formElement.reset();
        return;
      }

      if (mode === 'register') {
        const password = String(form.get('password') || '');
        const rePassword = String(form.get('rePassword') || '');
        if (password !== rePassword) throw new Error('Passwords do not match.');
        const result = await apiRequest('/auth/signup', {
          method: 'POST',
          body: jsonBody({
            name,
            email,
            password,
            rePassword,
            phone: String(form.get('phone') || '').trim(),
          }),
        });
        let account = result?.data || result;
        if (!account.token) {
          const signInResult = await apiRequest('/auth/signin', {
            method: 'POST',
            body: jsonBody({ email, password }),
          });
          account = signInResult?.data || signInResult;
        }
        if (!account.token) throw new Error('Your account was created, but the server did not return a sign-in token. Please sign in.');
        signIn({ ...(account.user || account), token: account.token });
      } else {
        const result = await apiRequest('/auth/signin', {
          method: 'POST',
          body: jsonBody({ email, password: String(form.get('password') || '') }),
        });
        const account = result?.data || result;
        if (!account.token) throw new Error('The server did not return a sign-in token.');
        signIn({ ...(account.user || account), token: account.token });
      }
      navigate(location.state?.from || '/');
    } catch (requestError) {
      setError(requestError.message || 'The account request failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const title = mode === 'register' ? 'Create account' : mode === 'forgot' ? 'Reset password' : mode === 'change' ? 'Change password' : 'Welcome back';
  const showEmail = mode === 'login' || mode === 'register' || (mode === 'forgot' && resetStep === 'email');
  if (!authReady) return <section className="account-shell"><div className="account-panel"><p role="status">Checking your session...</p></div></section>;
  if (mode === 'change' && !user?.token) {
    return <section className="account-shell"><div className="account-panel"><p className="shop-eyebrow">FitHub / Account</p><h1>Sign in required</h1><p className="account-note">Sign in to change your account password.</p><Link className="button" to="/login">Sign in</Link></div></section>;
  }
  return (
    <section className="account-shell">
      <div className="account-panel"><p className="shop-eyebrow">FitHub / Account</p><h1>{title}</h1><p className="account-note">{mode === 'login' ? 'Sign in to manage your cart and orders.' : mode === 'register' ? 'Create an account to shop and manage your orders.' : mode === 'forgot' ? 'Follow the steps to reset your account password.' : 'Update the password for your account.'}</p>
        <form className="shop-form" onSubmit={submit}>
          {mode === 'register' && <label>Full name<input name="name" autoComplete="name" required disabled={submitting} /></label>}
          {mode === 'register' && <label>Phone<input type="tel" name="phone" autoComplete="tel" required disabled={submitting} /></label>}
          {showEmail && <label>Email<input type="email" name="email" autoComplete="email" required disabled={submitting} /></label>}
          {(mode === 'login' || mode === 'register') && <label>Password<input type="password" name="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength="6" required disabled={submitting} /></label>}
          {mode === 'register' && <label>Confirm password<input type="password" name="rePassword" autoComplete="new-password" minLength="6" required disabled={submitting} /></label>}
          {mode === 'change' && <><label>Current password<input type="password" name="currentPassword" autoComplete="current-password" required disabled={submitting} /></label><label>New password<input type="password" name="password" autoComplete="new-password" minLength="6" required disabled={submitting} /></label><label>Confirm new password<input type="password" name="rePassword" autoComplete="new-password" minLength="6" required disabled={submitting} /></label></>}
          {mode === 'forgot' && resetStep === 'code' && <label>Reset code<input name="resetCode" inputMode="numeric" autoComplete="one-time-code" required disabled={submitting} /></label>}
          {mode === 'forgot' && resetStep === 'password' && <label>New password<input type="password" name="newPassword" autoComplete="new-password" minLength="6" required disabled={submitting} /></label>}
          {notice && <p className="form-message" role="status">{notice}</p>}{error && <p className="form-error" role="alert">{error}</p>}
          {!(mode === 'forgot' && resetStep === 'done') && <button className="button" type="submit" disabled={submitting}>{submitting ? 'Please wait...' : mode === 'register' ? 'Create account' : mode === 'forgot' ? resetStep === 'email' ? 'Send reset code' : resetStep === 'code' ? 'Verify code' : 'Reset password' : mode === 'change' ? 'Update password' : 'Sign in'}</button>}
        </form>
        <nav className="account-links">{mode === 'login' && <><Link to="/register">Create an account</Link><Link to="/forgot-password">Forgot password?</Link></>}{mode === 'register' && <Link to="/login">Already registered? Sign in</Link>}{mode === 'forgot' && <Link to="/login">Back to sign in</Link>}{mode === 'change' && <span>{user?.email}</span>}</nav>
        {mode === 'forgot' && <p className="demo-disclaimer">Reset instructions are sent by the Route API to the email address on your account.</p>}
      </div>
    </section>
  );
}

export function AddressesPage() {
  const { addresses, saveAddress, updateAddress, getAddress, removeAddress, user } = useCart();
  const [notice, setNotice] = useState('');
  const [editingAddress, setEditingAddress] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    setSubmitting(true);
    try {
      const address = Object.fromEntries(formData.entries());
      const saved = editingAddress
        ? await updateAddress(editingAddress.id, address)
        : await saveAddress(address);
      if (!saved) return;
      formElement.reset();
      setEditingAddress(null);
      setNotice(editingAddress ? 'Address updated.' : 'Address saved to your account.');
    } finally {
      setSubmitting(false);
    }
  }

  async function editAddress(id) {
    const address = await getAddress(id);
    if (address) {
      setEditingAddress(address);
      setNotice('');
    }
  }

  return (
    <section className="shop-page"><div className="shop-page-heading"><p className="shop-eyebrow">Your account / Delivery</p><h1>Addresses</h1><p>Manage the places where your orders can be delivered.</p><nav className="account-links"><Link to="/orders">View orders</Link><Link to="/change-password">Change password</Link></nav></div>
      {!user ? <div className="shop-empty">Sign in to manage your delivery addresses. <Link to="/login">Sign in</Link></div> : <div className="account-layout"><form className="shop-form address-form" key={editingAddress?.id || 'new-address'} onSubmit={submit}><h2>{editingAddress ? 'Edit delivery address' : 'Add a delivery address'}</h2>{[['full-name', 'Name'], ['phone', 'Phone'], ['street-address', 'Street address'], ['city', 'City'], ['postal-code', 'Postal code']].map(([name, label]) => <label key={name}>{label}<input name={name} defaultValue={editingAddress?.[name] || ''} required /></label>)}<button className="button" type="submit" disabled={submitting}>{submitting ? 'Saving...' : editingAddress ? 'Update address' : 'Save address'}</button>{editingAddress && <button className="text-button" type="button" onClick={() => setEditingAddress(null)}>Cancel</button>}{notice && <p className="form-message" role="status">{notice}</p>}</form>
        <div className="address-list">{addresses.map((address) => <article className="address-entry" key={address.id}><h2>{address['full-name']}</h2><p>{address['street-address']}</p><p>{address.city}, {address['postal-code']}</p><p>{address.phone}</p><div className="account-links"><button className="text-button" type="button" onClick={() => editAddress(address.id)}>Edit address</button><button className="text-button" type="button" onClick={() => removeAddress(address.id)}>Remove address</button></div></article>)}{!addresses.length && <p className="shop-empty">No saved addresses yet.</p>}</div>
      </div>}
    </section>
  );
}

export function CheckoutPage() {
  const {
    items, addresses, saveAddress, placeOrder, user,
    cartTotal, cartTotalAfterDiscount, appliedCoupon,
  } = useCart();
  const navigate = useNavigate();
  const [payment, setPayment] = useState('cash');
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const calculatedTotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const subtotal = cartTotal || calculatedTotal;
  const total = cartTotalAfterDiscount < subtotal ? cartTotalAfterDiscount : subtotal;
  if (!user) return <section className="shop-page shop-empty-page"><h1>Sign in to check out</h1><p>Your cart and orders are managed by your Route account.</p><Link className="button" to="/login">Sign in</Link></section>;
  if (!items.length) return <section className="shop-page shop-empty-page"><h1>Your cart is empty</h1><Link className="button" to="/products">Browse equipment</Link></section>;

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    const data = new FormData(event.currentTarget);
    try {
      let address = addresses.find((saved) => saved.id === data.get('saved-address')) || Object.fromEntries(['full-name', 'phone', 'street-address', 'city', 'postal-code'].map((key) => [key, data.get(key)]));
      if (!address.id) {
        const saved = await saveAddress(address);
        if (!saved) return;
        if (saved !== true) address = saved;
      }
      const order = await placeOrder({ address, paymentMethod: payment });
      if (order && !order.redirecting) navigate('/orders', { state: { placed: true } });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="shop-page"><div className="shop-page-heading"><p className="shop-eyebrow">FitHub / Checkout</p><h1>Delivery & payment</h1><p>Choose a delivery address and complete your order.</p></div>
      <form className="checkout-layout" onSubmit={submit}>
        <div className="checkout-fields"><fieldset className="checkout-fieldset"><legend>Delivery address</legend>{addresses.length > 0 && <label className="saved-address-select">Saved address<select name="saved-address" value={selectedAddressId} onChange={(event) => setSelectedAddressId(event.target.value)}><option value="">Enter a new address</option>{addresses.map((address) => <option key={address.id} value={address.id}>{address['full-name']} — {address.city}</option>)}</select></label>}<div className="checkout-address-grid">{[['full-name', 'Full name'], ['phone', 'Phone'], ['street-address', 'Street address'], ['city', 'City'], ['postal-code', 'Postal code']].map(([name, label]) => <label key={name}>{label}<input name={name} required={!selectedAddressId} disabled={Boolean(selectedAddressId)} /></label>)}</div></fieldset>
          <fieldset className="checkout-fieldset"><legend>Payment method</legend><label className="payment-choice"><input type="radio" name="payment" checked={payment === 'cash'} onChange={() => setPayment('cash')} /><span><strong>Cash on delivery</strong><small>Pay when your order arrives</small></span></label><label className="payment-choice"><input type="radio" name="payment" checked={payment === 'online'} onChange={() => setPayment('online')} /><span><strong>Online payment</strong><small>Pay securely through the Route checkout</small></span></label></fieldset>
        </div>
        <aside className="checkout-summary"><h2>Order summary</h2>{items.map((item) => <p className="summary-row" key={item.id}><span>{item.title} × {item.qty}</span><strong>{formatPrice(item.price * item.qty)}</strong></p>)}{appliedCoupon && <p className="form-message">Coupon applied: {appliedCoupon}</p>}{total < subtotal && <p className="summary-row"><span>Discount</span><strong>−{formatPrice(subtotal - total)}</strong></p>}<p className="summary-total"><span>Total</span><strong>{formatPrice(total)}</strong></p><button className="button" type="submit" disabled={submitting}>{submitting ? 'Processing...' : payment === 'online' ? 'Continue to payment' : 'Place order'}</button></aside>
      </form>
    </section>
  );
}

export function OrdersPage() {
  const { orders, user, authReady } = useCart();
  return <section className="shop-page"><div className="shop-page-heading"><p className="shop-eyebrow">Your account / Purchases</p><h1>Orders</h1><p>Track your orders from the Route store.</p><nav className="account-links"><Link to="/addresses">Manage addresses</Link><Link to="/change-password">Change password</Link></nav></div>{!user ? <div className="shop-empty">Sign in to view your orders. <Link to="/login">Sign in</Link></div> : !authReady ? <div className="shop-empty">Loading your orders...</div> : orders.length ? <div className="order-list">{orders.map((order) => <article className="order-entry" key={order.id}><div className="order-entry-heading"><div><p className="shop-eyebrow">Order {order.id}</p><h2>{new Date(order.createdAt).toLocaleDateString()}</h2></div><span className="order-status">{order.status}</span></div><p>{order.items.reduce((sum, item) => sum + item.qty, 0)} items · {order.paymentMethod === 'cash' ? 'Cash on delivery' : 'Online payment'}</p><p>Delivering to {order.address?.['full-name']}, {order.address?.city}</p><ul>{order.items.map((item) => <li key={item.id}>{item.title} × {item.qty}</li>)}</ul><strong>{formatPrice(order.total)}</strong></article>)}</div> : <div className="shop-empty">No orders yet. <Link to="/products">Explore products</Link></div>}</section>;
}

export function ProductDetailsPage() {
  const { id } = useParams();
  const { addToCart, wishlist, toggleWishlist, user } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');
  const [reviewsError, setReviewsError] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState('5');
  const [editingReview, setEditingReview] = useState(null);
  const [savingReview, setSavingReview] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    loadProduct(id)
      .then((data) => {
        if (active) { setProduct(data); setLoading(false); }
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError.message || 'Could not load this product.');
        setLoading(false);
      });
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    let active = true;
    setReviewsError('');
    apiRequest(`/products/${encodeURIComponent(id)}/reviews`)
      .then((result) => {
        if (!active) return;
        const data = result?.data;
        setReviews(Array.isArray(data) ? data : data?.reviews || []);
      })
      .catch((requestError) => {
        if (active) setReviewsError(requestError.message || 'Could not load product reviews.');
      });
    return () => { active = false; };
  }, [id]);

  async function submitReview(event) {
    event.preventDefault();
    if (!user?.token) return;
    setSavingReview(true);
    setReviewsError('');
    try {
      const payload = { rating: Number(reviewRating), review: reviewText.trim() };
      await apiRequest(
        editingReview ? `/reviews/${encodeURIComponent(editingReview.id)}` : `/products/${encodeURIComponent(id)}/reviews`,
        {
          method: editingReview ? 'PUT' : 'POST',
          token: user.token,
          body: jsonBody(payload),
        },
      );
      const result = await apiRequest(`/products/${encodeURIComponent(id)}/reviews`);
      const data = result?.data;
      setReviews(Array.isArray(data) ? data : data?.reviews || []);
      setReviewText('');
      setReviewRating('5');
      setEditingReview(null);
    } catch (requestError) {
      setReviewsError(requestError.message || 'Could not save your review.');
    } finally {
      setSavingReview(false);
    }
  }

  async function deleteReview(reviewId) {
    setReviewsError('');
    try {
      await apiRequest(`/reviews/${encodeURIComponent(reviewId)}`, { method: 'DELETE', token: user.token });
      setReviews((previous) => previous.filter((review) => String(review._id || review.id) !== String(reviewId)));
    } catch (requestError) {
      setReviewsError(requestError.message || 'Could not delete your review.');
    }
  }

  if (loading) return <div className="shop-empty detail-loading">Loading product...</div>;
  if (error) return <section className="shop-page shop-empty-page"><p className="form-error" role="alert">{error}</p><Link className="button" to="/products">Back to products</Link></section>;
  if (!product) return <section className="shop-page shop-empty-page"><h1>Product not found</h1><Link className="button" to="/products">Back to equipment</Link></section>;
  const saved = wishlist.some((item) => item.id === product.id);
  const image = product.image || product.images?.[0];
  return (
    <section className="shop-page">
      <div className="detail-layout">
        <div className="detail-image"><img src={image} alt={product.title} /></div>
        <div className="detail-copy">
          <p className="shop-eyebrow">{product.brand || product.category}</p>
          <h1>{product.title}</h1>
          <p className="shop-rating">{product.rating ? <><FaStar /> {Number(product.rating).toFixed(1)}</> : 'Not rated yet'}</p>
          <strong className="detail-price">{formatPrice(product.price)}</strong>
          <p className="detail-description">{product.description || 'See the product details before choosing this item.'}</p>
          <p className="detail-category">Category <Link to={`/categories/${slugify(product.category)}`}>{product.category}</Link></p>
          <div className="detail-actions">
            <div className="quantity-stepper">
              <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((current) => Math.max(1, current - 1))}>−</button>
              <span>{quantity}</span>
              <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((current) => current + 1)}>+</button>
            </div>
            <button className="button" type="button" onClick={async () => { const result = await addToCart({ ...product, image, qty: quantity }); if (result) setAdded(true); }}>Add to cart</button>
            <button className="icon-button detail-save" type="button" aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'} onClick={() => toggleWishlist({ ...product, image })}>{saved ? <FaHeart /> : <FaRegHeart />}</button>
          </div>
          {added && <p className="form-message" role="status">Added to your cart.</p>}
        </div>
      </div>
      <section className="reviews-section">
        <div className="shop-page-heading"><p className="shop-eyebrow">Customer feedback</p><h2>Reviews</h2><Link to="/reviews">See all clothing reviews</Link></div>
        {reviewsError && <p className="form-error" role="alert">{reviewsError}</p>}
        {user?.token ? (
          <form className="shop-form review-form" onSubmit={submitReview}>
            <h3>{editingReview ? 'Edit your review' : 'Write a review'}</h3>
            <label>Rating<select value={reviewRating} onChange={(event) => setReviewRating(event.target.value)}>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}</select></label>
            <label>Your review<textarea value={reviewText} onChange={(event) => setReviewText(event.target.value)} required rows="4" /></label>
            <button className="button" type="submit" disabled={savingReview}>{savingReview ? 'Saving...' : editingReview ? 'Update review' : 'Submit review'}</button>
            {editingReview && <button className="text-button" type="button" onClick={() => { setEditingReview(null); setReviewText(''); }}>Cancel edit</button>}
          </form>
        ) : <p className="account-note"><Link to="/login">Sign in</Link> to write a review.</p>}
        <div className="review-list">
          {reviews.map((review) => {
            const reviewId = String(review._id || review.id);
            const ownerId = review.user?._id || review.user?.id;
            const isOwner = user?._id && String(ownerId) === String(user._id);
            return (
              <article className="review-entry" key={reviewId}>
                <p className="shop-rating"><FaStar /> {review.rating} / 5</p>
                <p>{review.review || review.comment}</p>
                <small>{review.user?.name || 'Customer'}</small>
                {isOwner && <div className="account-links">
                      <button className="text-button" type="button" onClick={async () => {
                        try {
                          const result = await apiRequest(`/reviews/${encodeURIComponent(reviewId)}`, { token: user.token });
                          const fullReview = result?.data?.review || result?.data || review;
                          setEditingReview({ ...fullReview, id: reviewId });
                          setReviewText(fullReview.review || fullReview.comment || '');
                          setReviewRating(String(fullReview.rating || 5));
                          setReviewsError('');
                        } catch (requestError) {
                          setReviewsError(requestError.message || 'Could not load this review.');
                        }
                      }}>Edit</button>
                      <button className="text-button" type="button" onClick={() => deleteReview(reviewId)}>Delete</button>
                    </div>}
              </article>
            );
          })}
          {!reviews.length && !reviewsError && <p className="shop-empty">No reviews yet.</p>}
        </div>
      </section>
    </section>
  );
}

ProductTile.propTypes = {
  product: PropTypes.object.isRequired,
};

ProductGrid.propTypes = {
  products: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool,
};

CatalogPage.propTypes = {
  mode: PropTypes.string,
};

AccountPage.propTypes = {
  mode: PropTypes.oneOf(['login', 'register', 'forgot', 'change']).isRequired,
};