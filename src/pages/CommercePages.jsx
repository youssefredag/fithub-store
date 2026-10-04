import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaStar } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { apiRequest, jsonBody } from '../services/api';
import { formatPrice, gymBrands, loadBrands, loadCategories, loadProduct, loadProducts, slugify } from '../services/catalog';

function useCatalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([loadProducts(), loadCategories(), loadBrands()])
      .then(([nextProducts, nextCategories, nextBrands]) => {
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
  if (!products.length) return <div className="shop-empty">No products in this list yet. <Link to="/products">Browse equipment</Link></div>;
  return <div className="shop-grid">{products.map((product) => <ProductTile key={product.id} product={product} />)}</div>;
}

export function CatalogPage({ mode = 'products' }) {
  const { products, categories, brands, loading, error } = useCatalog();
  const { brand, category } = useParams();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');
  const title = mode === 'brand-detail' ? 'Brand collection' : mode === 'category-detail' ? 'Category collection' : 'Shop equipment';
  const detailSlug = brand || category;

  if (mode === 'brands' || mode === 'categories') {
    const values = mode === 'brands' ? brands : categories;
    return (
      <section className="shop-page">
        <div className="shop-page-heading"><p className="shop-eyebrow">FitHub / Explore</p><h1>{mode === 'brands' ? 'Brands' : 'Categories'}</h1><p>{mode === 'brands' ? 'Makers currently stocked in the shop.' : 'Browse the equipment by type.'}</p></div>
        <div className="collection-grid">
          {loading && <p className="shop-empty">Loading collections...</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
          {values.map((value) => {
            const name = value.name;
            const to = `/${mode}/${slugify(name)}`;
            const count = products.filter((product) => slugify(mode === 'brands' ? product.brand : product.category) === slugify(name)).length;
            const description = mode === 'brands' ? gymBrands.find((brandEntry) => brandEntry.name === name)?.description : null;
            return <Link className="collection-tile" key={value.id} to={to}><span>{mode === 'brands' ? 'BRAND' : 'CATEGORY'}</span><strong>{name}</strong>{description && <p>{description}</p>}<small>{count} {count === 1 ? 'item' : 'items'} <span aria-hidden="true">↗</span></small></Link>;
          })}
          {!values.length && !loading && <div className="shop-empty">{mode === 'brands' ? 'Brand names have not been added to the current product data.' : 'No categories are available.'} <Link to="/products">Browse equipment</Link></div>}
        </div>
      </section>
    );
  }

  let visible = products;
  if (mode === 'brand-detail') visible = visible.filter((product) => slugify(product.brand) === detailSlug);
  if (mode === 'category-detail') visible = visible.filter((product) => slugify(product.category) === detailSlug);
  const collectionTitle = decodeURIComponent(detailSlug || '')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
  const query = search.trim().toLowerCase();
  if (query) visible = visible.filter((product) => `${product.title} ${product.category} ${product.brand}`.toLowerCase().includes(query));
  visible = [...visible].sort((a, b) => sort === 'price-low' ? a.price - b.price : sort === 'price-high' ? b.price - a.price : 0);

  return (
    <section className="shop-page">
      <div className="shop-page-heading"><p className="shop-eyebrow">FitHub / {mode === 'products' ? 'Equipment' : mode === 'brand-detail' ? 'Brands' : 'Categories'}</p><h1>{mode === 'products' ? title : collectionTitle}</h1><p>{mode === 'products' ? 'Dumbbells, benches, racks, and the essentials for a home gym.' : mode === 'brand-detail' ? gymBrands.find((brandEntry) => slugify(brandEntry.name) === detailSlug)?.description || 'Products from this brand.' : 'Equipment available in this category.'}</p></div>
      <div className="catalog-toolbar"><label className="catalog-search"><span>Search</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search equipment" /></label><label className="catalog-sort"><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <ProductGrid products={visible} loading={loading} />
    </section>
  );
}

export function WishlistPage() {
  const { wishlist } = useCart();
  return <section className="shop-page"><div className="shop-page-heading"><p className="shop-eyebrow">Your account / Saved</p><h1>Wishlist</h1><p>{wishlist.length} saved {wishlist.length === 1 ? 'item' : 'items'}.</p></div><ProductGrid products={wishlist} /></section>;
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
  const { addresses, saveAddress, removeAddress, user } = useCart();
  const [notice, setNotice] = useState('');
  async function submit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const saved = await saveAddress(Object.fromEntries(formData.entries()));
    if (!saved) return;
    formElement.reset();
    setNotice(user?.token ? 'Address saved to your account.' : 'Address saved on this device.');
  }
  return (
    <section className="shop-page"><div className="shop-page-heading"><p className="shop-eyebrow">Your account / Delivery</p><h1>Addresses</h1><p>Manage the places where your equipment can be delivered.</p><nav className="account-links"><Link to="/orders">View orders</Link><Link to="/change-password">Change password</Link></nav></div>
      <div className="account-layout"><form className="shop-form address-form" onSubmit={submit}><h2>Add a delivery address</h2>{['Full name', 'Phone', 'Street address', 'City', 'Postal code'].map((label) => <label key={label}>{label}<input name={label.toLowerCase().replaceAll(' ', '-')} required /></label>)}<button className="button" type="submit">Save address</button>{notice && <p className="form-message" role="status">{notice}</p>}</form>
        <div className="address-list">{addresses.map((address) => <article className="address-entry" key={address.id}><h2>{address['full-name']}</h2><p>{address['street-address']}</p><p>{address.city}, {address['postal-code']}</p><p>{address.phone}</p><button className="text-button" type="button" onClick={() => removeAddress(address.id)}>Remove address</button></article>)}{!addresses.length && <p className="shop-empty">No saved addresses yet.</p>}</div>
      </div>
    </section>
  );
}

export function CheckoutPage() {
  const { items, addresses, saveAddress, placeOrder } = useCart();
  const navigate = useNavigate();
  const [payment, setPayment] = useState('cash');
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  if (!items.length) return <section className="shop-page shop-empty-page"><h1>Your cart is empty</h1><Link className="button" to="/products">Browse equipment</Link></section>;

  async function submit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    let address = addresses.find((saved) => saved.id === data.get('saved-address')) || Object.fromEntries(['full-name', 'phone', 'street-address', 'city', 'postal-code'].map((key) => [key, data.get(key)]));
    if (!address.id) {
      const saved = await saveAddress(address);
      if (!saved) return;
      if (saved !== true) address = saved;
    }
    const order = await placeOrder({ address, paymentMethod: payment });
    if (order && !order.redirecting) navigate('/orders', { state: { placed: true } });
  }

  return (
    <section className="shop-page"><div className="shop-page-heading"><p className="shop-eyebrow">FitHub / Checkout</p><h1>Delivery & payment</h1><p>Choose a delivery address and complete this demo order.</p></div>
      <form className="checkout-layout" onSubmit={submit}>
        <div className="checkout-fields"><fieldset className="checkout-fieldset"><legend>Delivery address</legend>{addresses.length > 0 && <label className="saved-address-select">Saved address<select name="saved-address" value={selectedAddressId} onChange={(event) => setSelectedAddressId(event.target.value)}><option value="">Enter a new address</option>{addresses.map((address) => <option key={address.id} value={address.id}>{address['full-name']} — {address.city}</option>)}</select></label>}<div className="checkout-address-grid">{[['full-name', 'Full name'], ['phone', 'Phone'], ['street-address', 'Street address'], ['city', 'City'], ['postal-code', 'Postal code']].map(([name, label]) => <label key={name}>{label}<input name={name} required={!selectedAddressId} disabled={Boolean(selectedAddressId)} /></label>)}</div></fieldset>
          <fieldset className="checkout-fieldset"><legend>Payment method</legend><label className="payment-choice"><input type="radio" name="payment" checked={payment === 'cash'} onChange={() => setPayment('cash')} /><span><strong>Cash on delivery</strong><small>Pay when your order arrives</small></span></label><label className="payment-choice"><input type="radio" name="payment" checked={payment === 'online'} onChange={() => setPayment('online')} /><span><strong>Online payment</strong><small>Demo checkout only; no charge will be made</small></span></label></fieldset>
        </div>
        <aside className="checkout-summary"><h2>Order summary</h2>{items.map((item) => <p className="summary-row" key={item.id}><span>{item.title} × {item.qty}</span><strong>{formatPrice(item.price * item.qty)}</strong></p>)}<p className="summary-total"><span>Total</span><strong>{formatPrice(total)}</strong></p><button className="button" type="submit">Place demo order</button><p className="demo-disclaimer">No payment is processed by this prototype.</p></aside>
      </form>
    </section>
  );
}

export function OrdersPage() {
  const { orders } = useCart();
  return <section className="shop-page"><div className="shop-page-heading"><p className="shop-eyebrow">Your account / Purchases</p><h1>Orders</h1><p>Track orders placed from this device.</p><nav className="account-links"><Link to="/addresses">Manage addresses</Link><Link to="/change-password">Change password</Link></nav></div>{orders.length ? <div className="order-list">{orders.map((order) => <article className="order-entry" key={order.id}><div className="order-entry-heading"><div><p className="shop-eyebrow">Order {order.id}</p><h2>{new Date(order.createdAt).toLocaleDateString()}</h2></div><span className="order-status">{order.status}</span></div><p>{order.items.reduce((sum, item) => sum + item.qty, 0)} items · {order.paymentMethod === 'cash' ? 'Cash on delivery' : 'Online demo payment'}</p><p>Delivering to {order.address?.['full-name']}, {order.address?.city}</p><ul>{order.items.map((item) => <li key={item.id}>{item.title} × {item.qty}</li>)}</ul><strong>{formatPrice(order.total)}</strong></article>)}</div> : <div className="shop-empty">No orders yet. <Link to="/products">Explore equipment</Link></div>}</section>;
}

export function ProductDetailsPage() {
  const { id } = useParams();
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');
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
  if (loading) return <div className="shop-empty detail-loading">Loading product...</div>;
  if (error) return <section className="shop-page shop-empty-page"><p className="form-error" role="alert">{error}</p><Link className="button" to="/products">Back to products</Link></section>;
  if (!product) return <section className="shop-page shop-empty-page"><h1>Product not found</h1><Link className="button" to="/products">Back to equipment</Link></section>;
  const saved = wishlist.some((item) => item.id === product.id);
  const image = product.image || product.images?.[0];
  return <section className="shop-page"><div className="detail-layout"><div className="detail-image"><img src={image} alt={product.title} /></div><div className="detail-copy"><p className="shop-eyebrow">{product.brand || product.category}</p><h1>{product.title}</h1><p className="shop-rating">{product.rating ? <><FaStar /> {Number(product.rating).toFixed(1)}</> : 'Not rated yet'}</p><strong className="detail-price">{formatPrice(product.price)}</strong><p className="detail-description">{product.description || 'See product specifications before choosing this item.'}</p><p className="detail-category">Category <Link to={`/categories/${slugify(product.category)}`}>{product.category}</Link></p><div className="detail-actions"><div className="quantity-stepper"><button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((current) => Math.max(1, current - 1))}>−</button><span>{quantity}</span><button type="button" aria-label="Increase quantity" onClick={() => setQuantity((current) => current + 1)}>+</button></div><button className="button" type="button" onClick={() => { addToCart({ ...product, image, qty: quantity }); setAdded(true); }}>Add to cart</button><button className="icon-button detail-save" type="button" aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'} onClick={() => toggleWishlist({ ...product, image })}>{saved ? <FaHeart /> : <FaRegHeart />}</button></div>{added && <p className="form-message" role="status">Added to your cart.</p>}</div></div></section>;
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