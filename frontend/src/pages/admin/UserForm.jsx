import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../../utils/api";
import { toast } from "react-toastify";

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    phoneNumber: "",
    tier: "Retail",
    role: "client",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // Fetch user if editing
  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const fetchUser = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/auth/users/${id}`, {
          signal: controller.signal,
        });
        setFormData({
          name: data.name || "",
          username: data.username || "",
          phoneNumber: data.phoneNumber || "",
          tier: data.tier || "Retail",
          role: data.role || "client",
          password: "", // Don't pre-fill password
        });
      } catch (err) {
        if (err.name !== "CanceledError") {
          toast.error("فشل في تحميل بيانات المستخدم");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    return () => controller.abort(); // Cancel request on unmount
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { name, username, password } = formData;
    if (!name || !username || (!id && !password)) {
      toast.warn("يرجى ملء جميع الحقول المطلوبة.");
      return false;
    }

    if (password && password.length < 8) {
      toast.warn("كلمة المرور يجب أن تكون على الأقل 8 أحرف.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const confirmed = window.confirm(
      id ? "هل أنت متأكد من حفظ التعديلات؟" : "هل تريد إضافة هذا العميل؟"
    );
    if (!confirmed) return;

    try {
      if (id) {
        const { password, ...dataToSend } = formData;
        if (password) dataToSend.password = password;

        await axios.put(`/auth/users/${id}`, dataToSend);
        toast.success("تم حفظ التعديلات بنجاح ✅");
      } else {
        await axios.post("/auth/users", formData);
        toast.success("تمت إضافة العميل بنجاح ✅");
      }

      navigate("/admin/users");
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message || "حدث خطأ أثناء حفظ البيانات ❌";
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-600">
        جاري تحميل البيانات...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-4 mt-6 text-right rtl font-cairo"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-2">
        {id ? "تعديل عميل" : "إضافة عميل"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="الاسم الكامل *"
          className="p-2 border rounded focus:outline-none focus:ring"
        />

        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="اسم المستخدم *"
          className="p-2 border rounded focus:outline-none focus:ring"
        />

        <input
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          placeholder="رقم الهاتف"
          className="p-2 border rounded focus:outline-none focus:ring"
        />

        {!id && (
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="p-2 border rounded focus:outline-none focus:ring"
          >
            <option value="client">عميل</option>
            <option value="admin">مسؤول</option>
          </select>
        )}

        {formData.role === "client" && (
          <select
            name="tier"
            value={formData.tier}
            onChange={handleChange}
            className="p-2 border rounded focus:outline-none focus:ring"
          >
            <option value="Retail">عادي</option>
            <option value="Wholesale">جملة</option>
            <option value="SuperWholesale">جملة كبرى</option>
          </select>
        )}

        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="كلمة المرور *"
          className="p-2 border rounded focus:outline-none focus:ring"
          required={!id}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
      >
        {id ? "💾 حفظ التعديلات" : "➕ إضافة العميل"}
      </button>
    </form>
  );
};

export default UserForm;
