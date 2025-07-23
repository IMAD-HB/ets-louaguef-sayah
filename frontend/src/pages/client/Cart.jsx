import React, { useCallback, useRef } from "react";
import { useCart } from "../../context/CartContext";
import CartItem from "../../components/client/CartItem";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice } = useCart();
  const navigate = useNavigate();

  // Throttle to prevent rapid navigation to checkout
  const isNavigating = useRef(false);

  const handleCheckout = useCallback(() => {
    if (isNavigating.current || cartItems.length === 0) return;

    isNavigating.current = true;
    navigate("/client/checkout");

    // Reset after 1 second to allow future navigations
    setTimeout(() => {
      isNavigating.current = false;
    }, 1000);
  }, [cartItems, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center sm:text-left">
          🛒 سلة التسوق
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center text-gray-500">
            سلتك فارغة حالياً.
            <br />
            <button
              onClick={() => navigate("/client/")}
              className="mt-3 inline-block text-blue-600 underline hover:text-blue-800 transition"
            >
              تصفح المنتجات
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <CartItem
                  key={item._id}
                  item={item}
                  onUpdate={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200">
              <div className="text-lg font-semibold text-gray-700">
                المجموع:{" "}
                <span className="text-blue-600">
                  {getTotalPrice().toLocaleString()} د.ج
                </span>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
                aria-disabled={cartItems.length === 0}
                role="button"
                className="w-full sm:w-auto"
              >
                متابعة إلى الدفع
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
