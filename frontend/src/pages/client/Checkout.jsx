import React, { useState, useCallback, useRef } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import OrderSummary from "../../components/client/OrderSummary";
import axios from "../../utils/api";
import { toast } from "react-toastify";

const Checkout = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const [payment, setPayment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isThrottled = useRef(false);
  const navigate = useNavigate();

  const total = getTotalPrice();

  const handleSubmit = useCallback(async () => {
    if (submitting || isThrottled.current) return;

    if (cartItems.length === 0) {
      toast.error("سلة التسوق فارغة");
      return;
    }

    const paymentValue = parseFloat(payment);
    if (!payment || isNaN(paymentValue) || paymentValue <= 0) {
      toast.error("يرجى إدخال مبلغ صالح");
      return;
    }

    setSubmitting(true);
    isThrottled.current = true;

    try {
      const { data } = await axios.post("/orders", {
        items: cartItems.map((item) => ({
          product: item._id,
          quantity: item.quantity,
        })),
        amountPaid: paymentValue,
      });

      clearCart();
      toast.success("✅ تم إرسال الطلب بنجاح");
      navigate(`/client/orders/${data.order._id}/receipt`);
    } catch (err) {
      console.error("❌ Order submission error:", err);
      toast.error("حدث خطأ أثناء تأكيد الطلب");
    } finally {
      setSubmitting(false);
      setTimeout(() => {
        isThrottled.current = false;
      }, 1000); // Throttle duration
    }
  }, [cartItems, payment, submitting, navigate, clearCart]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center sm:text-left">
          الدفع
        </h1>

        <OrderSummary
          cartItems={cartItems}
          paymentAmount={parseFloat(payment) || 0}
        />

        <div>
          <label
            htmlFor="payment"
            className="block mb-2 font-medium text-gray-700"
          >
            💵 المبلغ المدفوع (د.ج)
          </label>
          <input
            id="payment"
            type="number"
            inputMode="numeric"
            placeholder="0.00"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            min="0"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-200">
          <div className="text-lg font-semibold text-gray-700">
            🧾 المجموع:{" "}
            <span className="text-blue-600">{total.toLocaleString()} د.ج</span>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={submitting || cartItems.length === 0}
            aria-disabled={submitting || cartItems.length === 0}
            className="w-full sm:w-auto"
          >
            {submitting ? "جاري المعالجة..." : "تأكيد الطلب"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
