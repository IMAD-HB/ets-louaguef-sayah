import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../utils/api.js";
import OrderRow from "../../components/admin/OrderRow";
import UserDebtCard from "../../components/admin/UserDebtCard";

const UserView = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const timer = setTimeout(() => {
      const fetchUserData = async () => {
        setLoading(true);
        try {
          const [{ data: userData }, { data: allOrders }] = await Promise.all([
            axios.get(`/auth/users/${id}`),
            axios.get("/orders"),
          ]);

          const userOrders = allOrders.filter(
            (order) => order.user?._id === id
          );

          setUser(userData);
          setOrders(userOrders);
        } catch (error) {
          console.error("❌ Error fetching user data", error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }, 300); // throttle delay

    return () => clearTimeout(timer);
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        🔄 جاري تحميل بيانات العميل...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center text-red-500">
        ❌ لم يتم العثور على المستخدم أو حدث خطأ في التحميل.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 space-y-6 font-[Cairo]">
      {/* User Name */}
      <h2 className="text-2xl font-bold text-gray-800">
        تفاصيل العميل: {user.name || "غير معروف"}
      </h2>

      {/* User Info Card */}
      <div className="bg-white rounded-xl shadow p-4 space-y-2 text-gray-700">
        <p>
          <strong>رقم الهاتف:</strong> {user.phoneNumber || "غير متوفر"}
        </p>
        <p>
          <strong>اسم المستخدم:</strong> {user.username || "—"}
        </p>
        <p>
          <strong>نوع الحساب:</strong> {user.tier || "غير محدد"}
        </p>
        <p>
          <strong>إجمالي الديون:</strong>{" "}
          {user.totalDebt?.toLocaleString() || "0"} دج
        </p>
      </div>

      {/* Debt Card */}
      <UserDebtCard user={user} />

      {/* Orders */}
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-gray-800">📦 الطلبات</h3>

        {orders.length === 0 ? (
          <div className="text-gray-500 text-center py-6">
            لا توجد طلبات لهذا العميل.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full bg-white text-sm text-right rtl:text-right">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2">رقم الطلب</th>
                  <th className="px-4 py-2">المجموع</th>
                  <th className="px-4 py-2">المدفوع</th>
                  <th className="px-4 py-2">الباقي</th>
                  <th className="px-4 py-2">الحالة</th>
                  <th className="px-4 py-2">التاريخ</th>
                  <th className="px-4 py-2">الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <OrderRow key={order._id} order={order} showUser={false} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserView;
