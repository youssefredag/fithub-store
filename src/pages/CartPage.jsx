import { OrderSummary } from "../components/OrderSummary";
import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { items , removeFromCart , addToCart , decreaseQtyFromCart} = useCart();


  let total = 0;
  for (let i = 0; i < items.length; i++) {
    const element = items[i];
    total = total + (element.price * element.qty )
  }


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
              src={i.image}
              alt={i.title}
              className="h-16 w-16 rounded-md object-cover"
            />

            <div className="flex-1">
              <p className="font-medium">{i.title}</p>
              <p className="text-gray-500">${i.price.toFixed(2)}</p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-center items-center gap-2">
                <button className="bg-[var(--brandColor)] border-[var(--brandColor)] text-white hover:bg-blue-800 hover:cursor-pointer border-2 rounded-full justify-center flex text-center items-center w-8 h-8" onClick={()=> addToCart(i) }>+</button>
                <span>{i.qty}</span>
                <button className="bg-[var(--brandColor)] border-[var(--brandColor)] text-white hover:bg-blue-800 hover:cursor-pointer border-2 rounded-full justify-center flex text-center items-center w-8 h-8" onClick={()=> decreaseQtyFromCart(i.id) }>-</button>
              </div>
            <button className="border-[#64748b] border-2 btn" onClick={()=> removeFromCart(i.id)} >Remove from cart</button>
            </div>
          </div>
        ))}
      </div>

      <OrderSummary total={total} />
    </div>
  );
}