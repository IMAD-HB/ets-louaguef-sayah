import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../utils/api.js";

const UserView = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const timer = setTimeout(() => {
      const fetchUserData = async () => {
        setLoading(true);
        try {
          const { data: userData } = await axios.get(`/auth/users/${id}`);
          setUser(userData);
        } catch (error) {
          console.error("❌ Error fetching user data", error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }, 300);

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
          <strong>الدور:</strong> {user.role === "admin" ? "مسؤول" : "عميل"}
        </p>
        <p>
          <strong>إجمالي الديون:</strong>{" "}
          {user.totalDebt?.toLocaleString() || "0"} دج
        </p>
      </div>
    </div>
  );
};

export default UserView;
