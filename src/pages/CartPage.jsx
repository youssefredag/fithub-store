import { OrderSummary } from "../components/OrderSummary";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function CartPage() {
  const {
    items, removeFromCart, addToCart, decreaseQtyFromCart, clearCart,
    cartTotal, cartTotalAfterDiscount, appliedCoupon, applyCoupon, user, authReady,
  } = useCart();
  const [coupon, setCoupon] = useState('');
  const [notice, setNotice] = useState('');
  const [couponBusy, setCouponBusy] = useState(false);


  const calculatedTotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0), 0);
  const subtotal = cartTotal || calculatedTotal;
  const total = cartTotalAfterDiscount > 0 && cartTotalAfterDiscount < subtotal
    ? cartTotalAfterDiscount
    : subtotal;

  async function submitCoupon(event) {
    event.preventDefault();
    setCouponBusy(true);
    setNotice('');
    try {
      const applied = await applyCoupon(coupon);
      if (applied) setNotice(`Coupon ${coupon.trim()} applied.`);
    } finally {
      setCouponBusy(false);
    }
  }


  if (user && !authReady) return <div className="shop-empty">Loading your cart...</div>;

  if (!items.length) {
    return (
      <div className="flex justify-center py-20 text-gray-500">
        Your cart is empty.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Your Cart</h1>
      <div className="space-y-3">
        {items.map((i) => (
          <div
            key={i.id}
            className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow-sm"
          >
            <img
              src={i.image || 'https://via.placeholder.com/150'}
              alt={i.title}
              className="h-16 w-16 rounded-md object-cover"
            />

            <div className="flex-1">
              <p className="font-medium">{i.title}</p>
              <p className="text-gray-500">${(Number(i.price) || 0).toFixed(2)}</p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-center items-center gap-2">
                <button className="bg-[var(--brandColor)] border-[var(--brandColor)] text-white hover:bg-blue-800 hover:cursor-pointer border-2 rounded-full justify-center flex text-center items-center w-8 h-8" onClick={()=> addToCart({ ...i, qty: 1 }) }>+</button>
                <span>{i.qty}</span>
                <button className="bg-[var(--brandColor)] border-[var(--brandColor)] text-white hover:bg-blue-800 hover:cursor-pointer border-2 rounded-full justify-center flex text-center items-center w-8 h-8" onClick={()=> decreaseQtyFromCart(i.id) }>-</button>
              </div>
            <button className="border-[#64748b] border-2 btn" onClick={()=> removeFromCart(i.id)} >Remove from cart</button>
            </div>
          </div>
        ))}
      </div>

      <form className="cart-coupon" onSubmit={submitCoupon}>
        {user ? <>
          <label htmlFor="cart-coupon">Coupon code</label>
          <div><input id="cart-coupon" value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="Enter coupon code" /><button className="button button-small" type="submit" disabled={couponBusy}>{couponBusy ? 'Applying...' : 'Apply'}</button></div>
          {appliedCoupon && <p className="form-message">Applied: {appliedCoupon}</p>}
          {notice && <p className="form-message" role="status">{notice}</p>}
        </> : <p>Sign in to apply a coupon or continue to checkout. <Link to="/login">Sign in</Link></p>}
        <button className="text-button" type="button" onClick={() => clearCart()}>Clear cart</button>
      </form>

      <OrderSummary total={total} />
      {!user && <p className="shop-empty">Your cart is saved in this browser. <Link to="/login">Sign in</Link> to sync it and check out.</p>}
    </div>
  );
}