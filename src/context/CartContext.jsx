import { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { apiRequest, jsonBody } from '../services/api';

const CartContext = createContext();

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
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

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readStorage('cart', []));
  const [wishlist, setWishlist] = useState(() => readStorage('fithub-wishlist', []));
  const [user, setUser] = useState(() => {
    const savedUser = readStorage('fithub-user', null);
    return savedUser?.token ? savedUser : null;
  });
  const [addresses, setAddresses] = useState(() => readStorage('fithub-addresses', []));
  const [orders, setOrders] = useState(() => readStorage('fithub-orders', []));
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
      return undefined;
    }
    let active = true;

    setAuthReady(false);
    async function verifySession() {
      try {
        await apiRequest('/auth/verifyToken', { token: user.token });
        if (!active) return;
        setAuthReady(true);
        try {
          const result = await apiRequest('/addresses', { token: user.token });
          if (active) setAddresses(unwrapAddresses(result).map(normalizeAddress));
        } catch (error) {
          if (active) setApiError(error.message || 'Could not load your saved addresses.');
        }
      } catch (error) {
        if (!active) return;
        if (error.status === 401 || error.status === 403) {
          setUser(null);
          setAddresses([]);
          setApiError('Your session has expired. Please sign in again.');
        } else {
          setApiError(error.message || 'Could not verify your session.');
        }
        setAuthReady(true);
      }
    }

    verifySession();
    return () => { active = false; };
  }, [user]);

  function addToCart(product) {
    setItems((previous) => {
      const found = previous.find((item) => item.id === product.id);
      return found
        ? previous.map((item) => item.id === product.id ? { ...item, qty: item.qty + (product.qty || 1) } : item)
        : [...previous, { ...product, qty: product.qty || 1 }];
    });
  }

  function removeFromCart(id) {
    setItems((previous) => previous.filter((item) => item.id !== id));
  }

  function updateCartQuantity(id, quantity) {
    const safeQuantity = Math.floor(Number(quantity));
    if (!Number.isFinite(safeQuantity) || safeQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((previous) => previous.map((item) => item.id === id ? { ...item, qty: safeQuantity } : item));
  }

  function decreaseQtyFromCart(id) {
    const found = items.find((item) => item.id === id);
    if (found) updateCartQuantity(id, found.qty - 1);
  }

  function toggleWishlist(product) {
    const exists = wishlist.some((item) => item.id === product.id);
    setWishlist((previous) => exists
      ? previous.filter((item) => item.id !== product.id)
      : [...previous, product]);
  }

  async function saveAddress(address) {
    if (!user?.token) {
      setAddresses((previous) => address.id
        ? previous.map((item) => item.id === address.id ? { ...address } : item)
        : [...previous, { ...address, id: crypto.randomUUID() }]);
      return true;
    }
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

  function removeAddress(id) {
    if (!user?.token) {
      setAddresses((previous) => previous.filter((address) => address.id !== id));
      return;
    }
    void reportRequest(async () => {
      await apiRequest(`/addresses/${encodeURIComponent(id)}`, { method: 'DELETE', token: user.token });
      setAddresses((previous) => previous.filter((address) => address.id !== id));
      return true;
    });
  }

  async function placeOrder({ address, paymentMethod }) {
    const order = {
      id: `FH-${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      items,
      total: items.reduce((sum, item) => sum + item.price * item.qty, 0),
      address,
      paymentMethod,
      status: 'Processing',
    };
    setOrders((previous) => [order, ...previous]);
    setItems([]);
    return order;
  }

  function signIn(profile) {
    const nextUser = {
      ...profile,
      _id: profile._id || profile.id,
      name: profile.name || profile.firstName || profile.email?.split('@')[0] || 'Customer',
    };
    setUser(nextUser);
    setAuthReady(true);
    return nextUser;
  }

  function signOut() {
    setUser(null);
    setAddresses([]);
    setApiError('');
    setAuthReady(true);
  }

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);
  useEffect(() => localStorage.setItem('fithub-wishlist', JSON.stringify(wishlist)), [wishlist]);
  useEffect(() => {
    if (user) localStorage.setItem('fithub-user', JSON.stringify(user));
    else localStorage.removeItem('fithub-user');
  }, [user]);
  useEffect(() => localStorage.setItem('fithub-addresses', JSON.stringify(addresses)), [addresses]);
  useEffect(() => localStorage.setItem('fithub-orders', JSON.stringify(orders)), [orders]);

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, decreaseQtyFromCart, updateCartQuantity,
      wishlist, toggleWishlist, user, signIn, signOut,
      addresses, saveAddress, removeAddress, orders, placeOrder,
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
