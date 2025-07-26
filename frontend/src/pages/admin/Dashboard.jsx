import React, { useEffect, useState } from "react";
import axios from "../../utils/api.js";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const [summary, setSummary] = useState({
    clientCount: 0,
    orderCount: 0,
    totalDebt: 0,
  });

  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  const [form, setForm] = useState({
    user: "",
    items: [],
    amountPaid: "",
  });

  // Fetch summary, clients, and products on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, clientsRes, productsRes] = await Promise.all([
          axios.get("/admin/summary"),
          axios.get("/auth/users?role=client"),
          axios.get("/products"),
        ]);
        setSummary(summaryRes.data);
        setClients(clientsRes.data);
        setProducts(productsRes.data);
      } catch (err) {
        toast.error("فشل في تحميل البيانات");
        console.error("❌ Fetch error:", err);
      }
    };
    fetchData();
  }, []);

  const getPrice = (productId) => {
    const product = products.find((p) => p.id === productId);
    const tier = selectedClient?.tier || "Retail";
    return product?.basePrices?.[tier] || 0;
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...form.items];
    updatedItems[index][field] = value;
    setForm((prev) => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { product: "", quantity: 1 }],
    }));
  };

  const removeItem = (index) => {
    const updatedItems = [...form.items];
    updatedItems.splice(index, 1);
    setForm((prev) => ({ ...prev, items: updatedItems }));
  };

  const calculateTotal = () =>
    form.items.reduce((total, item) => {
      const price = getPrice(item.product);
      return total + price * item.quantity;
    }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedClient) {
      toast.error("الرجاء اختيار الزبون");
      return;
    }

    const items = form.items.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      unitPrice: getPrice(item.product),
    }));

    const totalPrice = calculateTotal();
    const amountPaid = parseFloat(form.amountPaid) || 0;
    const remainingDebt = totalPrice - amountPaid;

    try {
      await axios.post("/admin/orders", {
        user: selectedClient._id,
        items,
        totalPrice,
        amountPaid,
        remainingDebt,
      });

      toast.success("✅ تم إنشاء الطلب بنجاح");
      setForm({ user: "", items: [], amountPaid: "" });
      setSelectedClient(null);
    } catch (err) {
      console.error("❌ Order submission failed:", err);
      toast.error("حدث خطأ أثناء إنشاء الطلب");
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gray-100 font-[Cairo] p-4 space-y-8"
    >
      <h1 className="text-2xl font-bold text-gray-800">لوحة التحكم</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <SummaryCard
          title="عدد الزبائن"
          value={summary.clientCount}
          color="green"
        />
        <SummaryCard
          title="عدد الطلبات"
          value={summary.orderCount}
          color="blue"
        />
        <SummaryCard
          title="إجمالي الديون"
          value={`${summary.totalDebt.toLocaleString()} د.ج`}
          color="red"
        />
      </div>

      {/* Order Form */}
      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          إنشاء طلب جديد
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Selector */}
          <div>
            <label className="block text-sm font-medium mb-1">الزبون</label>
            <select
              className="w-full border p-2 rounded"
              value={form.user}
              onChange={(e) => {
                const client = clients.find((c) => c._id === e.target.value);
                setForm((prev) => ({ ...prev, user: client?._id || "" }));
                setSelectedClient(client || null);
              }}
              required
            >
              <option value="">اختر الزبون</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {/* Items Section */}
          {form.items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end"
            >
              <div className="sm:col-span-5">
                <label className="text-sm mb-1 block">المنتج</label>
                <select
                  className="w-full border p-2 rounded"
                  value={item.product}
                  onChange={(e) =>
                    handleItemChange(index, "product", e.target.value)
                  }
                  required
                >
                  <option value="">اختر المنتج</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="text-sm mb-1 block">الكمية</label>
                <input
                  type="number"
                  min="1"
                  className="w-full border p-2 rounded"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", +e.target.value)
                  }
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm block mb-1">السعر</label>
                <p className="p-2 border rounded bg-gray-50 text-center">
                  {getPrice(item.product).toLocaleString()} د.ج
                </p>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2 hover:bg-blue-600"
          >
            + إضافة منتج
          </button>

          {/* Payment & Total */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                المبلغ المدفوع
              </label>
              <input
                type="number"
                className="w-full border p-2 rounded"
                value={form.amountPaid}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, amountPaid: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الإجمالي</label>
              <p className="p-2 border rounded bg-gray-100">
                {calculateTotal().toLocaleString()} د.ج
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            disabled={!form.user || form.items.length === 0}
          >
            إنشاء الطلب
          </button>
        </form>
      </div>
    </div>
  );
};

// Summary Card Component
const SummaryCard = ({ title, value, color }) => {
  const colorMap = {
    green: "text-green-700",
    blue: "text-blue-700",
    red: "text-red-700",
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-4 text-center">
      <p className={`text-xl font-semibold ${colorMap[color]}`}>{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
};

export default AdminDashboard;
