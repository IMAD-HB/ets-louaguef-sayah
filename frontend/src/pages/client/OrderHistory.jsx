import React, { useEffect, useState, useRef } from "react";
import axios from "../../utils/api";
import OrderCard from "../../components/client/OrderCard";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFetching = useRef(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (isFetching.current) return;
      isFetching.current = true;

      try {
        const { data } = await axios.get("/orders/my");
        setOrders(data);
      } catch (error) {
        console.error("❌ خطأ في جلب الطلبات:", error);
      } finally {
        setLoading(false);
        setTimeout(() => {
          isFetching.current = false;
        }, 1000); // throttle duration
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-cairo px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center sm:text-start">
          📦 تاريخ الطلبات
        </h1>

        {loading ? (
          <div className="text-center text-gray-500">⏳ جارٍ التحميل...</div>
        ) : orders.length === 0 ? (
          <div className="text-center text-gray-500">🚫 لا توجد طلبات سابقة.</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
