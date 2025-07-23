import React, { useEffect, useState, useRef } from "react";
import axios from "../../utils/api";
import { toast } from "react-toastify";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isFetching = useRef(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (isFetching.current) return;
      isFetching.current = true;

      try {
        const res = await axios.get("/auth/me", { withCredentials: true });
        const u = res.data.user;
        setUser(u);
        setFormData({
          name: u.name || "",
          phoneNumber: u.phoneNumber || "",
          password: "",
        });
      } catch (error) {
        toast.error(error.response?.data?.message || "فشل في جلب بيانات المستخدم");
      } finally {
        setLoading(false);
        setTimeout(() => {
          isFetching.current = false;
        }, 1000); // throttle duration
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple validation example (optional)
    if (!formData.name.trim()) {
      toast.error("يرجى إدخال الاسم");
      return;
    }
    if (formData.phoneNumber && !/^\+?\d{6,15}$/.test(formData.phoneNumber)) {
      toast.error("يرجى إدخال رقم هاتف صحيح");
      return;
    }

    setSaving(true);
    try {
      const res = await axios.put("/auth/profile", formData, {
        withCredentials: true,
      });
      setUser(res.data.user);
      setFormData((prev) => ({ ...prev, password: "" }));
      toast.success("✅ تم تحديث الملف الشخصي بنجاح");
    } catch (error) {
      toast.error(error.response?.data?.message || "❌ حدث خطأ أثناء التحديث");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-[30vh] flex items-center justify-center text-gray-500">
        ⏳ جارٍ تحميل البيانات...
      </div>
    );

  if (!user)
    return (
      <div className="text-center text-red-600 font-semibold">
        ❌ لم يتم العثور على بيانات المستخدم.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 font-cairo px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center sm:text-right">
          👤 الملف الشخصي
        </h1>

        <section className="bg-white rounded-lg shadow p-4 md:p-6 mb-6 space-y-2 text-gray-700 text-right">
          <p>
            <strong>اسم المستخدم:</strong> {user.username}
          </p>
          <p>
            <strong>الدور:</strong> {user.role}
          </p>
          <p>
            <strong>الرتبة:</strong> {user.tier}
          </p>
          <p>
            <strong>إجمالي الدين:</strong> {user.totalDebt?.toLocaleString() || 0} د.ج
          </p>
        </section>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow p-4 md:p-6 space-y-4 max-w-xl mx-auto"
          dir="rtl"
          noValidate
        >
          <div>
            <label htmlFor="name" className="block mb-1 font-semibold">
              الاسم
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="name"
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block mb-1 font-semibold">
              رقم الهاتف
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+213xxxxxxxxx"
              autoComplete="tel"
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 font-semibold">
              كلمة المرور الجديدة
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="اترك الحقل فارغاً إذا لم ترغب بالتغيير"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition disabled:opacity-50"
          >
            {saving ? "جارٍ الحفظ..." : "💾 حفظ التغييرات"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
