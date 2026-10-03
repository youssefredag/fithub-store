import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

const CartContext = createContext(); 

function readStorage(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
}

export function CartProvider({children}) {
    const [items, setItems] = useState(() => readStorage('cart', []));
    const [wishlist, setWishlist] = useState(() => readStorage('fithub-wishlist', []));
    const [user, setUser] = useState(() => readStorage('fithub-user', null));
    const [addresses, setAddresses] = useState(() => readStorage('fithub-addresses', []));
    const [orders, setOrders] = useState(() => readStorage('fithub-orders', []));

    function addToCart(product) {
        setItems(prev => {
        const found = prev.find(i => i.id === product.id);
        if (found) {                            
            return prev.map(i =>
            i.id === product.id ? { ...i, qty: i.qty + (product.qty || 1) } : i
            );
        }
        return [...prev, { ...product, qty: product.qty || 1 }];
        });
    }

    function removeFromCart(id) {
        const filteredItems = items.filter((p)=> p.id !== id);
        setItems(filteredItems);
    }

    function decreaseQtyFromCart(id) {
        const found = items.find(item => item.id === id);
        if (found) {
            const qty = found.qty
            if (qty === 1) {
                removeFromCart(id);
                return null;
            } else {
                setItems((prev) =>{
                        return prev.map(item => {
                            return item.id === id ? {...item , qty: item.qty - 1 } : item
                        })
                    }
                )

            }
        }
        
        
    }

    function updateCartQuantity(id, quantity) {
        const safeQuantity = Math.floor(Number(quantity));
        if (safeQuantity <= 0) {
            removeFromCart(id);
            return;
        }
        setItems(previous => previous.map(item => item.id === id ? { ...item, qty: safeQuantity } : item));
    }

    function toggleWishlist(product) {
        setWishlist(previous => previous.some(item => item.id === product.id)
            ? previous.filter(item => item.id !== product.id)
            : [...previous, product]);
    }

    function saveAddress(address) {
        setAddresses(previous => {
            const next = address.id
                ? previous.map(item => item.id === address.id ? { ...address } : item)
                : [...previous, { ...address, id: crypto.randomUUID() }];
            return next;
        });
    }

    function removeAddress(id) {
        setAddresses(previous => previous.filter(address => address.id !== id));
    }

    function placeOrder({ address, paymentMethod }) {
        const order = {
            id: `FH-${Date.now().toString().slice(-8)}`,
            createdAt: new Date().toISOString(),
            items,
            total: items.reduce((sum, item) => sum + item.price * item.qty, 0),
            address,
            paymentMethod,
            status: 'Processing',
        };
        setOrders(previous => [order, ...previous]);
        setItems([]);
        return order;
    }

    function signIn(profile) {
        const nextUser = { name: profile.name || profile.firstName || profile.email.split('@')[0], email: profile.email };
        setUser(nextUser);
        return nextUser;
    }

    function signOut() {
        setUser(null);
    }

    useEffect(()=>{
        localStorage.setItem('cart' , JSON.stringify(items));
    }, [items])

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
        }}>
            {children}
        </CartContext.Provider>
    )
}

CartProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useCart = () => useContext(CartContext);