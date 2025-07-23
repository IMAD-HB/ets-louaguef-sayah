import React, { useEffect, useState } from "react";
import axios from "../../utils/api.js";
import OrderRow from "../../components/admin/OrderRow";
import { toast } from "react-toastify";

// Status labels and styling
const STATUS_LABELS = {
  All: "الكل",
  Pending: "قيد الانتظار",
  Confirmed: "تم التأكيد",
  Delivered: "تم التوصيل",
  Paid: "مدفوع",
};

const STATUS_COLORS = {
  Pending: "bg-yellow-100 text-yellow-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Delivered: "bg-green-100 text-green-800",
  Paid: "bg-gray-200 text-gray-700",
};

// Format helpers
const fmtNumber = (n) => (typeof n === "number" ? `${n.toLocaleString("fr-DZ")} DZD` : "—");
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString("fr-DZ") : "—");

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounced search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Initial fetch
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get("/orders");
        setOrders(data);
      } catch {
        toast.error("فشل تحميل الطلبات");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Handlers
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast.success("تم تحديث الحالة بنجاح");
    } catch {
      toast.error("فشل تحديث الحالة");
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الطلب؟")) return;
    try {
      await axios.delete(`/orders/${orderId}`);
      setOrders((prev) => prev.filter((order) => order._id !== orderId));
      toast.success("تم حذف الطلب بنجاح");
    } catch {
      toast.error("فشل حذف الطلب");
    }
  };

  const handleViewReceipt = async (orderId) => {
    try {
      const { data } = await axios.get(`/orders/${orderId}/receipt`);
      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {
      toast.error("فشل في عرض الإيصال");
    }
  };

  // Filtered orders by status and search
  const filteredOrders = orders
    .filter((order) => (filter === "All" ? true : order.status === filter))
    .filter((order) =>
      debouncedSearch
        ? order.user?.name?.includes(debouncedSearch) || order._id?.includes(debouncedSearch)
        : true
    );

  return (
    <div className="rtl font-cairo bg-gray-50 min-h-screen">
      <div className="p-4 max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">إدارة الطلبات</h1>

        {/* Search Input */}
        <input
          type="text"
          placeholder="🔍 ابحث عن عميل أو رقم الطلب"
          className="w-full border p-2 rounded shadow-sm focus:outline-none focus:ring focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-1 rounded-full text-sm font-semibold shadow transition ${
                filter === key
                  ? "bg-blue-600 text-white"
                  : "bg-white border text-gray-700 hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        {loading ? (
          <p className="text-center text-gray-600 mt-10">جارٍ التحميل...</p>
        ) : filteredOrders.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">لا توجد طلبات</p>
        ) : (
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="w-full text-right min-w-[700px]">
              <thead className="bg-gray-100 text-sm text-gray-700">
                <tr>
                  <th className="p-3">العميل</th>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">الإجمالي</th>
                  <th className="p-3">المتبقي</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <OrderRow
                    key={order._id}
                    order={order}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    onViewReceipt={() => handleViewReceipt(order._id)}
                    statusColor={STATUS_COLORS[order.status]}
                    fmtNumber={fmtNumber}
                    fmtDate={fmtDate}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
