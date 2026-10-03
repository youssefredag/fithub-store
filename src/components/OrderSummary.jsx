import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export function OrderSummary({ total }) {
  return (
    <div className="mt-6 rounded-lg border bg-gray-50 p-5">
      <div className="space-y-2 text-sm">
        <p className="flex justify-between">
          <span>Subtotal</span>
          <span>${total.toFixed(2)}</span>
        </p>

        <p className="flex justify-between">
          <span>Shipping</span>
          <span>Free</span>
        </p>
      </div>

      <div className="my-4 border-t" />

      <p className="flex justify-between text-lg font-bold">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </p>

      <Link className="mt-5 block w-full rounded-md bg-blue-600 py-2.5 text-center font-medium text-white hover:bg-blue-700" to="/checkout">
        Checkout
      </Link>
    </div>
  );
}

OrderSummary.propTypes = {
  total: PropTypes.number.isRequired,
};
