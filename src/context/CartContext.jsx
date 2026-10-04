import { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { apiRequest, jsonBody } from '../services/api';
import { normalizeProduct } from '../services/catalog';

const CartContext = createContext();
const GUEST_CART_STORAGE_KEY = 'fithub-guest-cart';

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function readGuestCart() {
  const storedItems = readStorage(GUEST_CART_STORAGE_KEY, []);
  if (!Array.isArray(storedItems)) return [];
  return storedItems.flatMap((item) => {
    const id = item?._id || item?.id;
    const qty = Math.floor(Number(item?.qty || 1));
    if (!id || !Number.isFinite(qty) || qty < 1) return [];
    return [{ ...normalizeProduct(item), id: String(id), qty }];
  });
}

function normalizeAddress(address) {
  return {
    ...address,
    id: String(address._id || address.id),
    'full-name': address.name || address['full-name'] || '',
    'street-address': address.details || address['street-address'] || '',
    city: address.city || '',
    phone: address.phone || '',
    'postal-code': address.postalCode || address['postal-code'] || '',
  };
}

function unwrapAddresses(result) {
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.addresses)) return result.data.addresses;
  if (result?.data?.address) return [result.data.address];
  return [];
}

function unwrapCart(result) {
  const cart = result?.data?.cart || result?.data;
  const entries = cart?.products || cart?.items || [];
  return {
    id: cart?._id || cart?.id || '',
    total: Number(cart?.totalCartPrice ?? cart?.total ?? 0),
    totalAfterDiscount: Number(cart?.totalCartPriceAfterDiscount ?? cart?.totalAfterDiscount ?? cart?.totalCartPrice ?? cart?.total ?? 0),
    coupon: cart?.appliedCoupon?.name || cart?.coupon?.name || '',
    items: entries.map((entry) => {
      const product = normalizeProduct(entry.product || entry);
      return { ...product, qty: Number(entry.count || entry.qty || 1) };
    }),
  };
}

function unwrapWishlist(result) {
  const data = result?.data;
  const entries = Array.isArray(data) ? data : data?.wishlist || data?.products || [];
  return entries.map((entry) => normalizeProduct(entry.product || entry));
}

function unwrapOrders(result) {
  const data = result?.data;
  const entries = Array.isArray(data) ? data : data?.orders || [];
  return entries.map((order) => {
    const products = order.cartItems || order.products || order.orderItems || [];
    return {
      ...order,
      id: String(order._id || order.id),
      createdAt: order.createdAt || order.updatedAt,
      status: order.isDelivered ? 'Delivered' : order.isPaid ? 'Paid' : order.status || 'Processing',
      total: Number(order.totalOrderPrice ?? order.totalPrice ?? order.total ?? 0),
      paymentMethod: order.paymentMethodType === 'cash' ? 'cash' : 'online',
      address: normalizeAddress(order.shippingAddress || order.address || {}),
      items: products.map((entry) => ({
        ...normalizeProduct(entry.product || entry),
        qty: Number(entry.count || entry.qty || 1),
      })),
    };
  });
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() =>
    readStorage('fithub-user', null)?.token ? [] : readGuestCart(),
  );
  const [wishlist, setWishlist] = useState([]);
  const [cartId, setCartId] = useState('');
  const [cartTotal, setCartTotal] = useState(0);
  const [cartTotalAfterDiscount, setCartTotalAfterDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [user, setUser] = useState(() => {
    const savedUser = readStorage('fithub-user', null);
    return savedUser?.token ? savedUser : null;
  });
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [apiError, setApiError] = useState('');
  const [authReady, setAuthReady] = useState(() => !readStorage('fithub-user', null)?.token);

  async function reportRequest(request) {
    setApiError('');
    try {
      return await request();
    } catch (error) {
      setApiError(error.message || 'The shop request failed. Please try again.');
      return null;
    }
  }

  useEffect(() => {
    if (!user?.token) {
      setAuthReady(true);
      setItems(readGuestCart());
      setWishlist([]);
      setCartId('');
      setCartTotal(0);
      setCartTotalAfterDiscount(0);
      setAppliedCoupon('');
      setAddresses([]);
      setOrders([]);
      return undefined;
    }

    let active = true;
    setAuthReady(false);
    async function loadAccountData() {
      try {
        await apiRequest('/auth/verifyToken', { token: user.token });
        const requests = [
          apiRequest('/cart', { token: user.token, version: 2 }),
          apiRequest('/wishlist', { token: user.token }),
          apiRequest('/addresses', { token: user.token }),
          user._id ? apiRequest(`/orders/user/${encodeURIComponent(user._id)}`, { token: user.token }) : Promise.resolve(null),
        ];
        const [cartResult, wishlistResult, addressResult, orderResult] = await Promise.allSettled(requests);
        if (!active) return;

        if (cartResult.status === 'fulfilled') {
          let cart = unwrapCart(cartResult.value);
          const guestItems = readGuestCart();
          for (const guestItem of guestItems) {
            const current = cart.items.find((item) => item.id === guestItem.id);
            const nextQuantity = (current?.qty || 0) + guestItem.qty;
            if (current) {
              await apiRequest(`/cart/${encodeURIComponent(guestItem.id)}`, {
                method: 'PUT',
                token: user.token,
                version: 2,
                body: jsonBody({ count: nextQuantity }),
              });
            } else {
              await apiRequest('/cart', {
                method: 'POST',
                token: user.token,
                version: 2,
                body: jsonBody({ productId: guestItem.id }),
              });
              if (guestItem.qty > 1) {
                await apiRequest(`/cart/${encodeURIComponent(guestItem.id)}`, {
                  method: 'PUT',
                  token: user.token,
                  version: 2,
                  body: jsonBody({ count: guestItem.qty }),
                });
              }
            }
            cart.items = cart.items.filter((item) => item.id !== guestItem.id);
            cart.items.push({ ...guestItem, qty: nextQuantity });
          }
          if (guestItems.length) {
            cart = unwrapCart(await apiRequest('/cart', { token: user.token, version: 2 }));
            localStorage.removeItem(GUEST_CART_STORAGE_KEY);
          }
          setItems(cart.items);
          setCartId(cart.id);
          setCartTotal(cart.total);
          setCartTotalAfterDiscount(cart.totalAfterDiscount);
          setAppliedCoupon(cart.coupon);
        } else setApiError(cartResult.reason.message || 'Could not load your cart.');

        if (wishlistResult.status === 'fulfilled') setWishlist(unwrapWishlist(wishlistResult.value));
        else setApiError(wishlistResult.reason.message || 'Could not load your wishlist.');

        if (addressResult.status === 'fulfilled') setAddresses(unwrapAddresses(addressResult.value).map(normalizeAddress));
        else setApiError(addressResult.reason.message || 'Could not load your saved addresses.');

        if (orderResult.status === 'fulfilled' && orderResult.value) setOrders(unwrapOrders(orderResult.value));
        else if (orderResult.status === 'rejected') setApiError(orderResult.reason.message || 'Could not load your orders.');
      } catch (error) {
        if (!active) return;
        if (error.status === 401 || error.status === 403) {
          setUser(null);
          setApiError('Your session has expired. Please sign in again.');
        } else setApiError(error.message || 'Could not load your account data.');
      } finally {
        if (active) setAuthReady(true);
      }
    }

    loadAccountData();
    return () => { active = false; };
  }, [user]);

  async function refreshCart() {
    if (!user?.token) return false;
    const result = await apiRequest('/cart', { token: user.token, version: 2 });
    const cart = unwrapCart(result);
    setItems(cart.items);
    setCartId(cart.id);
    setCartTotal(cart.total);
    setCartTotalAfterDiscount(cart.totalAfterDiscount);
    setAppliedCoupon(cart.coupon);
    return true;
  }

  function requireAccount() {
    if (user?.token) return true;
    setApiError('Please sign in before adding items to your cart or wishlist.');
    return false;
  }

  async function addToCart(product) {
    const productId = product?._id || product?.id;
    if (!productId) {
      setApiError('This product cannot be added to your cart because it has no product ID.');
      return null;
    }
    const quantity = Math.floor(Number(product.qty ?? 1));
    if (!Number.isFinite(quantity) || quantity < 1) {
      setApiError('Enter a valid quantity before adding this product to your cart.');
      return null;
    }
    if (!user?.token) {
      const id = String(productId);
      setApiError('');
      setItems((currentItems) => {
        const current = currentItems.find((item) => item.id === id);
        if (current) {
          return currentItems.map((item) =>
            item.id === id ? { ...item, qty: item.qty + quantity } : item,
          );
        }
        return [...currentItems, { ...normalizeProduct(product), id, qty: quantity }];
      });
      return true;
    }
    return reportRequest(async () => {
      const current = items.find((item) => item.id === String(productId));
      const nextQuantity = (current?.qty || 0) + quantity;
      await apiRequest('/cart', {
        method: 'POST',
        token: user.token,
        version: 2,
        body: jsonBody({ productId }),
      });
      if (nextQuantity > 1) {
        await apiRequest(`/cart/${encodeURIComponent(productId)}`, {
          method: 'PUT',
          token: user.token,
          version: 2,
          body: jsonBody({ count: nextQuantity }),
        });
      }
      await refreshCart();
      return true;
    });
  }

  async function removeFromCart(id) {
    if (!user?.token) {
      setItems((currentItems) => currentItems.filter((item) => item.id !== String(id)));
      setApiError('');
      return true;
    }
    return reportRequest(async () => {
      await apiRequest(`/cart/${encodeURIComponent(id)}`, { method: 'DELETE', token: user.token, version: 2 });
      await refreshCart();
      return true;
    });
  }

  async function updateCartQuantity(id, quantity) {
    const safeQuantity = Math.floor(Number(quantity));
    if (!Number.isFinite(safeQuantity) || safeQuantity <= 0) return removeFromCart(id);
    if (!user?.token) {
      setItems((currentItems) => currentItems.map((item) =>
        item.id === String(id) ? { ...item, qty: safeQuantity } : item,
      ));
      setApiError('');
      return true;
    }
    return reportRequest(async () => {
      await apiRequest(`/cart/${encodeURIComponent(id)}`, {
        method: 'PUT',
        token: user.token,
        version: 2,
        body: jsonBody({ count: safeQuantity }),
      });
      await refreshCart();
      return true;
    });
  }

  function decreaseQtyFromCart(id) {
    const found = items.find((item) => item.id === String(id));
    if (found) return updateCartQuantity(id, found.qty - 1);
    return null;
  }

  async function clearCart() {
    if (!user?.token) {
      setItems([]);
      setApiError('');
      return true;
    }
    return reportRequest(async () => {
      await apiRequest('/cart', { method: 'DELETE', token: user.token, version: 2 });
      setItems([]);
      setCartId('');
      setCartTotal(0);
      setCartTotalAfterDiscount(0);
      setAppliedCoupon('');
      return true;
    });
  }

  async function applyCoupon(couponName) {
    if (!requireAccount()) return null;
    const safeCouponName = String(couponName || '').trim();
    if (!safeCouponName) {
      setApiError('Enter a coupon code first.');
      return null;
    }
    return reportRequest(async () => {
      const result = await apiRequest('/cart/applyCoupon', {
        method: 'PUT',
        token: user.token,
        version: 2,
        body: jsonBody({ couponName: safeCouponName }),
      });
      const cart = unwrapCart(result);
      if (cart.items.length) {
        setItems(cart.items);
        setCartId(cart.id || cartId);
      } else await refreshCart();
      setCartTotal(cart.total);
      setCartTotalAfterDiscount(cart.totalAfterDiscount);
      setAppliedCoupon(safeCouponName);
      return true;
    });
  }

  async function toggleWishlist(product) {
    if (!requireAccount()) return null;
    const exists = wishlist.some((item) => item.id === String(product.id));
    return reportRequest(async () => {
      await apiRequest(exists ? `/wishlist/${encodeURIComponent(product.id)}` : '/wishlist', {
        method: exists ? 'DELETE' : 'POST',
        token: user.token,
        ...(exists ? {} : { body: jsonBody({ productId: product.id }) }),
      });
      const result = await apiRequest('/wishlist', { token: user.token });
      setWishlist(unwrapWishlist(result));
      return true;
    });
  }

  async function saveAddress(address) {
    if (!requireAccount()) return null;
    return reportRequest(async () => {
      const result = await apiRequest('/addresses', {
        method: 'POST',
        token: user.token,
        body: jsonBody({
          name: address['full-name'] || address.name,
          details: address['street-address'] || address.details,
          phone: address.phone,
          city: address.city,
          ...(address['postal-code'] ? { postalCode: address['postal-code'] } : {}),
        }),
      });
      const saved = unwrapAddresses(result)[0];
      if (saved) {
        const normalized = normalizeAddress(saved);
        setAddresses((previous) => [...previous, normalized]);
        return normalized;
      }
      const refreshed = await apiRequest('/addresses', { token: user.token });
      setAddresses(unwrapAddresses(refreshed).map(normalizeAddress));
      return true;
    });
  }

  async function updateAddress(id, address) {
    if (!requireAccount()) return null;
    return reportRequest(async () => {
      const existingResult = await apiRequest(`/addresses/${encodeURIComponent(id)}`, { token: user.token });
      const existing = existingResult?.data?.address || existingResult?.data;
      if (!existing || String(existing._id || existing.id) !== String(id)) {
        throw new Error('Could not confirm the address to update.');
      }
      const result = await apiRequest('/addresses', {
        method: 'POST',
        token: user.token,
        body: jsonBody({
          name: address.name || address['full-name'] || existing.name,
          details: address.details || address['street-address'],
          phone: address.phone,
          city: address.city,
          ...(address.postalCode || address['postal-code'] ? { postalCode: address.postalCode || address['postal-code'] } : {}),
        }),
      });
      const replacement = unwrapAddresses(result)[0];
      if (!replacement) throw new Error('The replacement address was not returned by the server.');
      const normalized = normalizeAddress(replacement);
      await apiRequest(`/addresses/${encodeURIComponent(id)}`, { method: 'DELETE', token: user.token });
      setAddresses((previous) => previous.map((saved) => saved.id === String(id) ? normalized : saved));
      return normalized;
    });
  }

  async function getAddress(id) {
    if (!requireAccount()) return null;
    return reportRequest(async () => {
      const result = await apiRequest(`/addresses/${encodeURIComponent(id)}`, { token: user.token });
      const address = result?.data?.address || result?.data;
      if (!address) throw new Error('The requested address was not found.');
      return normalizeAddress(address);
    });
  }

  function removeAddress(id) {
    if (!requireAccount()) return;
    void reportRequest(async () => {
      await apiRequest(`/addresses/${encodeURIComponent(id)}`, { method: 'DELETE', token: user.token });
      setAddresses((previous) => previous.filter((address) => address.id !== id));
      return true;
    });
  }

  async function placeOrder({ address, paymentMethod }) {
    if (!requireAccount()) return null;
    return reportRequest(async () => {
      let currentCartId = cartId;
      if (!currentCartId) {
        const cartResult = await apiRequest('/cart', { token: user.token, version: 2 });
        const cart = unwrapCart(cartResult);
        currentCartId = cart.id;
        setItems(cart.items);
        setCartId(cart.id);
        setCartTotal(cart.total);
        setCartTotalAfterDiscount(cart.totalAfterDiscount);
        setAppliedCoupon(cart.coupon);
      }
      if (!currentCartId) throw new Error('Your server cart is empty. Refresh the page and try again.');

      const shippingAddress = {
        details: address['street-address'] || address.details,
        phone: address.phone,
        city: address.city,
        ...(address['postal-code'] ? { postalCode: address['postal-code'] } : {}),
      };

      if (paymentMethod === 'online') {
        const query = new URLSearchParams({ url: `${window.location.origin}/orders` });
        const result = await apiRequest(`/orders/checkout-session/${encodeURIComponent(currentCartId)}?${query}`, {
          method: 'POST',
          token: user.token,
          body: jsonBody({ shippingAddress }),
        });
        const checkoutUrl = result?.session?.url || result?.data?.session?.url || result?.data?.url || result?.url;
        if (!checkoutUrl) throw new Error('The server did not return an online payment link.');
        window.location.assign(checkoutUrl);
        return { redirecting: true };
      }

      const result = await apiRequest(`/orders/${encodeURIComponent(currentCartId)}`, {
        method: 'POST',
        token: user.token,
        version: 2,
        body: jsonBody({ shippingAddress }),
      });
      const order = result?.data?.order || result?.data;
      if (user._id) {
        const refreshedOrders = await apiRequest(`/orders/user/${encodeURIComponent(user._id)}`, { token: user.token });
        setOrders(unwrapOrders(refreshedOrders));
      } else {
        setOrders((previous) => [order, ...previous]);
      }
      await refreshCart();
      return order;
    });
  }

  function signIn(profile) {
    const nextUser = {
      ...profile,
      _id: profile._id || profile.id,
      name: profile.name || profile.firstName || profile.email?.split('@')[0] || 'Customer',
    };
    setUser(nextUser);
    setAuthReady(false);
    return nextUser;
  }

  function signOut() {
    setUser(null);
    setApiError('');
    setAuthReady(true);
  }

  async function updateProfile(profile) {
    if (!user?.token) return null;
    return reportRequest(async () => {
      const result = await apiRequest('/users/updateMe/', {
        method: 'PUT',
        token: user.token,
        body: jsonBody(profile),
      });
      const updatedUser = result?.data?.user || result?.data || {};
      const nextUser = {
        ...user,
        ...updatedUser,
        _id: updatedUser._id || user._id,
        token: user.token,
      };
      setUser(nextUser);
      return nextUser;
    });
  }


  useEffect(() => {
    if (user) localStorage.setItem('fithub-user', JSON.stringify(user));
    else localStorage.removeItem('fithub-user');
  }, [user]);

  useEffect(() => {
    if (!user?.token) localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, user]);

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, decreaseQtyFromCart, updateCartQuantity, clearCart,
      cartTotal, cartTotalAfterDiscount, appliedCoupon, applyCoupon,
      wishlist, toggleWishlist, user, signIn, signOut,
      addresses, saveAddress, updateAddress, getAddress, removeAddress, orders, placeOrder, updateProfile,
      authReady,
      apiError, dismissApiError: () => setApiError(''),
    }}>
      {children}
    </CartContext.Provider>
  );
}

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useCart = () => useContext(CartContext);
